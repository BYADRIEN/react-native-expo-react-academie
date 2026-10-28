import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList } from 'react-native';

export default function HomeScreen() {
  const [products, setProducts] = useState<any[]>([]);

  const loadProducts = async () => {
    try {
      const allProducts = await AsyncStorage.getItem('products');
      const savedProducts = allProducts ? JSON.parse(allProducts) : [];

      setProducts(savedProducts);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    return (
      <Link href={`/modal?code=${item.code}`}>
        <ThemedView>
          <Image source={{ uri: item.image_url }} />

          <View>
            <ThemedText>{item.product_name}</ThemedText>
            <ThemedText>{item.brand}</ThemedText>
            <ThemedText>{item.score}</ThemedText>
          </View>
        </ThemedView>
      </Link>
    );
  };

  return (
    <SafeAreaView>
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.code}
      />
    </SafeAreaView>
  );
}