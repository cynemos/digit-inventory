import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Product, Category } from '../types';

export function ProductSummary() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  async function loadCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Liste des Produits par Catégorie
      </h2>
      {categories.map(category => (
        <div key={category.id} className="mb-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {category.name}
          </h3>
          <ul>
            {products
              .filter(product => product.categoryIds.includes(category.id))
              .map(product => (
                <li key={product.id} className="text-gray-500">
                  {product.name} - {product.reference}
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
