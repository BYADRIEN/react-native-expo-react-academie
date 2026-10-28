import {
  StyleSheet,
  View,
  Text,
  Button,
  ActivityIndicator,
} from 'react-native';
import {
  BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

export default function TabTwoScreen() {
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Demande la permission caméra
  useEffect(() => {
    //AsyncStorage.clear()
    requestPermission();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Permission encore en cours
  if (!permission) {
    return <View />;
  }

  // Permission refusée
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Nous avons besoin de votre permission pour utiliser la caméra.
        </Text>

        <Button
          onPress={requestPermission}
          title="Autoriser la caméra"
        />
      </View>
    );
  }

  // Sauvegarde du produit dans AsyncStorage
  const saveItemToStorage = async (product: any) => {
    try {
      const products = await AsyncStorage.getItem('products');

      console.log('Produits avant ajout :', products);

      const savedProducts = products
        ? JSON.parse(products)
        : [];

      const index = savedProducts.findIndex(
        (p: any) => p.code === product.code
      );

      if (index === -1) {
        savedProducts.unshift(product);

        await AsyncStorage.setItem(
          'products',
          JSON.stringify(savedProducts)
        );

        console.log('Produit ajouté !');
      } else {
        console.log('Produit déjà enregistré.');
      }
    } catch (error) {
      console.error(
        'Erreur AsyncStorage :',
        error
      );
    }
  };

  const getScore = (product : any ) => {
    const score = Math.round(
      product.nutriments.energy_100g 
      / 100
    )
    return score
  }

  // Gestion du scan
  const handleScan = async (
    scanningResult: BarcodeScanningResult
  ) => {
    console.log('Scanned:', scanningResult);

    // Empêche plusieurs scans successifs
    setScanned(true);

    // Annule un ancien timeout s'il existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Petite attente avant la requête API
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(
          API_URL +
            scanningResult.data +
            '.json?lc=fr'
        );

        console.log('Response:', response.data);
        console.log('response.data.status', response.data.status)

        // Produit trouvé
        if (response.data.status === "success") {
          const product = response.data.product;

          // Note temporaire
          const score = getScore(product);

          // Sauvegarde
          await saveItemToStorage({
            ...product,
            score,
          });

          // Navigation vers la modal
          router.push({
            pathname: '/modal',
            params: {
              code: product.code,
            },
          });
        } else {
          // Produit introuvable
          console.log('Produit introuvable');

          setScanned(false);
        }
      } catch (error) {
        console.error(
          'Erreur API :',
          error
        );

        setScanned(false);
      }
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8'],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleScan
        }
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.scanArea} />
      </View>

      {/* Loading */}
      {scanned && (
        <View style={styles.feedback}>
          <ActivityIndicator
            size="large"
            color="white"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  feedback: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  scanArea: {
    width: 300,
    height: 200,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
  },
});