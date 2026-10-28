import NutrimentItem from '@/components/NutrimentIem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView
} from 'react-native';

const DATA = {
  sugars_100g: {
    title: 'Sucres',
    subtitle: 'Sucres pour 100g',
    icon: '🍬',
    limit: 10,
  },

  salt_100g: {
    title: 'Sel',
    subtitle: 'Sel pour 100g',
    icon: '🧂',
    limit: 1.5,
  },

  fat_100g: {
    title: 'Matières grasses',
    subtitle: 'Matières grasses pour 100g',
    icon: '🥑',
    limit: 20,
  },
};

export default function ModalScreen() {
  const { code } = useLocalSearchParams() as { code: string };

  console.log('code', code);

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await AsyncStorage.getItem('products');

        const savedProducts = products
          ? JSON.parse(products)
          : [];

        console.log('savedProducts', savedProducts);

        // IMPORTANT : === pour comparer
        const product = savedProducts.find(
          (p: any) => p.code === code
        );

        console.log('product', product);

        setProduct(product);
      } catch (error) {
        console.error(error);
      }
    };

    loadProducts();
  }, [code]);

  if (!product) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  console.log('product infos =>', product.nutriments);

  const BAD_NUTRIMENTS = Object.keys(product.nutriments).filter(
    (key: string) => {
      if (Object.keys(DATA).includes(key)) {
        return (
          product.nutriments[key] > DATA[key as keyof typeof DATA].limit
        );
      }

      return false;
    }
  );

  const GOOD_NUTRIMENTS = Object.keys(product.nutriments).filter(
    (key: string) => {
      if (Object.keys(DATA).includes(key)) {
        return (
          product.nutriments[key] < DATA[key as keyof typeof DATA].limit
        );
      }

      return false;
    }
  );

  return (
    <ScrollView style={styles.container}>
      <Text>{product.product_name}</Text>
      <Text>{product.product_brands}</Text>
      <Text>{product.product_grade}</Text>


      <Image
        source={{ uri: product.image_url }}
        style={styles.image}
      />

      <Text>Bien</Text>

      {GOOD_NUTRIMENTS.map((key: string) => (
  <NutrimentItem
    good
    key={key}
    {...DATA[key as keyof typeof DATA]}
    value={product.nutriments[key]}
  />
))}
      <Text>Moins bien</Text>

      {BAD_NUTRIMENTS.map((key: string) => (
  <NutrimentItem
    good={false}
    key={key}
    {...DATA[key as keyof typeof DATA]}
    value={product.nutriments[key]}
  />
))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
  },
});