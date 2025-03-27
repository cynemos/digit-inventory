import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save, Image } from 'lucide-react';
import { Product, Category } from '../../types';

export function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    reference: '',
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    categoryIds: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    setProducts(productsData);
  }

  async function loadCategories() {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    setCategories(categoriesData);
  }

  async function handleAddProduct() {
    if (!newProduct.name || !newProduct.reference) return;
    await addDoc(collection(db, 'products'), newProduct);
    setNewProduct({
      reference: '',
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      categoryIds: []
    });
    loadProducts();
  }

  async function handleDeleteProduct(id: string) {
    await deleteDoc(doc(db, 'products', id));
    loadProducts();
  }

  async function handleUpdateProduct(product: Product) {
    if (!product.id) return;
    const { id, ...productData } = product;
    await updateDoc(doc(db, 'products', id), productData);
    setEditingId(null);
    loadProducts();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ajouter un produit
          </h3>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Référence
                </label>
                <input
                  type="text"
                  value={newProduct.reference}
                  onChange={(e) => setNewProduct({ ...newProduct, reference: e.target.value })}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                rows={3}
                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prix
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catégories
              </label>
              <div className="mt-2 space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={newProduct.categoryIds?.includes(category.id)}
                      onChange={(e) => {
                        const categoryIds = e.target.checked
                          ? [...(newProduct.categoryIds || []), category.id]
                          : (newProduct.categoryIds || []).filter(id => id !== category.id);
                        setNewProduct({ ...newProduct, categoryIds });
                      }}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddProduct}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ajouter le produit
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Produits existants
          </h3>
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === product.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={product.reference}
                            onChange={(e) =>
                              setProducts(products.map(p =>
                                p.id === product.id ? { ...p, reference: e.target.value } : p
                              ))
                            }
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Référence"
                          />
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) =>
                              setProducts(products.map(p =>
                                p.id === product.id ? { ...p, name: e.target.value } : p
                              ))
                            }
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Nom"
                          />
                        </div>
                        <textarea
                          value={product.description}
                          onChange={(e) =>
                            setProducts(products.map(p =>
                              p.id === product.id ? { ...p, description: e.target.value } : p
                            ))
                          }
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            value={product.price}
                            onChange={(e) =>
                              setProducts(products.map(p =>
                                p.id === product.id ? { ...p, price: parseFloat(e.target.value) } : p
                              ))
                            }
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Prix"
                          />
                          <input
                            type="url"
                            value={product.imageUrl}
                            onChange={(e) =>
                              setProducts(products.map(p =>
                                p.id === product.id ? { ...p, imageUrl: e.target.value } : p
                              ))
                            }
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="URL de l'image"
                          />
                        </div>
                        <div className="space-y-2">
                          {categories.map((category) => (
                            <label key={category.id} className="inline-flex items-center mr-4">
                              <input
                                type="checkbox"
                                checked={product.categoryIds.includes(category.id)}
                                onChange={(e) => {
                                  const categoryIds = e.target.checked
                                    ? [...product.categoryIds, category.id]
                                    : product.categoryIds.filter(id => id !== category.id);
                                  setProducts(products.map(p =>
                                    p.id === product.id ? { ...p, categoryIds } : p
                                  ));
                                }}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium">{product.name}</h4>
                          <span className="ml-2 text-sm text-gray-500">({product.reference})</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{product.description}</p>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-900">{product.price} €</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {categories
                            .filter(category => product.categoryIds.includes(category.id))
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
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {editingId === product.id ? (
                      <button
                        onClick={() => handleUpdateProduct(product)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(product.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
