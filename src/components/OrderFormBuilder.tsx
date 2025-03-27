import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Product, Option, Category } from '../types';
import { PackageSearch, Tags } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function OrderFormBuilder() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [availableOptions, setAvailableOptions] = useState<Option[]>([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadOptions();
    }
  }, [selectedProduct]);

  // Reset product selection when category changes
  useEffect(() => {
    setSelectedProduct(null);
    setSelectedOptions([]);
  }, [selectedCategory]);

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

  async function loadOptions() {
    if (!selectedProduct) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'options'));
      const optionsData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Option[];
      
      const compatibleOptions = optionsData.filter(option => 
        option.productIds.includes(selectedProduct.id)
      );
      setAvailableOptions(compatibleOptions);
    } catch (error) {
      console.error('Error loading options:', error);
    }
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category || null);
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setSelectedOptions([]);
  };

  const handleOptionToggle = (option: Option) => {
    setSelectedOptions(prev => {
      const isSelected = prev.some(o => o.id === option.id);
      if (isSelected) {
        return prev.filter(o => o.id !== option.id);
      } else {
        return [...prev, option];
      }
    });
  };

  const calculateTotal = () => {
    const productPrice = selectedProduct?.price || 0;
    const optionsTotal = selectedOptions.reduce((sum, option) => sum + option.price, 0);
    return productPrice + optionsTotal;
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.categoryIds.includes(selectedCategory.id))
    : [];

  const generatePDF = () => {
    if (!selectedProduct) return;

    const doc = new jsPDF();

    doc.text(`Fiche d'Aide - ${selectedProduct.name}`, 10, 10);

    let y = 20;
    doc.text(`Produit: ${selectedProduct.name}`, 10, y);
    y += 10;

    if (selectedOptions.length > 0) {
      doc.text('Options:', 10, y);
      y += 10;

      const optionsData = selectedOptions.map(option => [option.name, option.reference, option.price]);

      (doc as any).autoTable({
        head: [['Nom', 'Référence', 'Prix']],
        body: optionsData,
        startY: y,
      });
    }

    doc.save(`fiche-aide-${selectedProduct.name}.pdf`);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Category Selection */}
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
              <Tags className="h-5 w-5 text-indigo-500" />
              Sélection de la Catégorie
            </h3>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  onClick={() => handleCategorySelect(category)}
                >
                  {category.imageUrl && (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 w-full bg-gray-800 bg-opacity-60 text-white p-2">
                    <h4 className="text-sm font-medium text-center">{category.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Selection */}
          {selectedCategory && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                <PackageSearch className="h-5 w-5 text-indigo-500" />
                Sélection du Produit
              </h3>
              <div className="mt-2">
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  onChange={(e) => handleProductSelect(e.target.value)}
                  value={selectedProduct?.id || ''}
                >
                  <option value="">Sélectionnez un produit</option>
                  {filteredProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.reference}
                    </option>
                  ))}
                </select>
                {filteredProducts.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    Aucun produit disponible dans cette catégorie
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Product Details */}
          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-lg font-medium text-gray-900">{selectedProduct.name}</h4>
              <p className="mt-1 text-sm text-gray-600">{selectedProduct.description}</p>
              {selectedProduct.imageUrl && (
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="mt-2 h-48 w-full object-cover rounded-md"
                />
              )}
              <div className="mt-2">
                <span className="text-lg font-medium text-gray-900">
                  Prix: {selectedProduct.price} €
                </span>
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-700">Catégories:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {categories
                    .filter(category => selectedProduct.categoryIds.includes(category.id))
                    .map(category => (
                      <span
                        key={category.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category.name}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Options */}
          {selectedProduct && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Options Disponibles
              </h3>
              <div className="mt-2 space-y-4">
                {availableOptions.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Aucune option disponible pour ce produit
                  </p>
                ) : (
                  availableOptions.map((option) => (
                    <label
                      key={option.id}
                      className="relative flex items-start py-4 px-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="min-w-0 flex-1 text-sm">
                        <div className="font-medium text-gray-700">
                          {option.name}
                          <span className="ml-2 text-gray-500">({option.reference})</span>
                        </div>
                        <p className="mt-1 text-gray-500">{option.description}</p>
                        <p className="mt-1 font-medium text-gray-900">{option.price} €</p>
                      </div>
                      <div className="ml-3 flex items-center h-5">
                        <input
                          type="checkbox"
                          checked={selectedOptions.some(o => o.id === option.id)}
                          onChange={() => handleOptionToggle(option)}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Summary */}
          {selectedProduct && (
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Récapitulatif
              </h3>
              <div className="mt-2 p-4 bg-gray-50 rounded-md">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Produit:</span>
                    <span className="font-medium">{selectedProduct.price} €</span>
                  </div>
                  {selectedOptions.map(option => (
                    <div key={option.id} className="flex justify-between">
                      <span className="text-gray-700">{option.name}:</span>
                      <span className="font-medium">{option.price} €</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">Total:</span>
                      <span className="font-medium text-gray-900">{calculateTotal()} €</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={generatePDF}
              disabled={!selectedProduct}
            >
              Générer la Fiche d'Aide
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
