import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { Option, Product } from '../../types';

export function OptionManager() {
  const [options, setOptions] = useState<Option[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newOption, setNewOption] = useState<Partial<Option>>({
    reference: '',
    name: '',
    description: '',
    price: 0,
    productIds: [],
    dependencies: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadOptions();
    loadProducts();
  }, []);

  async function loadOptions() {
    const querySnapshot = await getDocs(collection(db, 'options'));
    const optionsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Option[];
    setOptions(optionsData);
  }

  async function loadProducts() {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
    setProducts(productsData);
  }

  async function handleAddOption() {
    if (!newOption.name || !newOption.reference) return;
    await addDoc(collection(db, 'options'), newOption);
    setNewOption({
      reference: '',
      name: '',
      description: '',
      price: 0,
      productIds: [],
      dependencies: []
    });
    loadOptions();
  }

  async function handleDeleteOption(id: string) {
    await deleteDoc(doc(db, 'options', id));
    loadOptions();
  }

  async function handleUpdateOption(option: Option) {
    if (!option.id) return;
    const { id, ...optionData } = option;
    await updateDoc(doc(db, 'options', id), optionData);
    setEditingId(null);
    loadOptions();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ajouter une option
          </h3>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Référence
                </label>
                <input
                  type="text"
                  value={newOption.reference}
                  onChange={(e) => setNewOption({ ...newOption, reference: e.target.value })}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  type="text"
                  value={newOption.name}
                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                  className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={newOption.description}
                onChange={(e) => setNewOption({ ...newOption, description: e.target.value })}
                rows={3}
                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix
              </label>
              <input
                type="number"
                value={newOption.price}
                onChange={(e) => setNewOption({ ...newOption, price: parseFloat(e.target.value) })}
                className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Produits compatibles
              </label>
              <div className="mt-2 space-y-2">
                {products.map((product) => (
                  <label key={product.id} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={newOption.productIds?.includes(product.id)}
                      onChange={(e) => {
                        const productIds = e.target.checked
                          ? [...(newOption.productIds || []), product.id]
                          : (newOption.productIds || []).filter(id => id !== product.id);
                        setNewOption({ ...newOption, productIds });
                      }}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{product.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Dépendances
              </label>
              <div className="mt-2 space-y-2">
                {options.map((option) => (
                  <label key={option.id} className="inline-flex items-center mr-4">
                    <input
                      type="checkbox"
                      checked={newOption.dependencies?.includes(option.id)}
                      onChange={(e) => {
                        const dependencies = e.target.checked
                          ? [...(newOption.dependencies || []), option.id]
                          : (newOption.dependencies || []).filter(id => id !== option.id);
                        setNewOption({ ...newOption, dependencies });
                      }}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">{option.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddOption}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ajouter l'option
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Options existantes
          </h3>
          <div className="space-y-4">
            {options.map((option) => (
              <div
                key={option.id}
                className="border rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingId === option.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={option.reference}
                            onChange={(e) =>
                              setOptions(options.map(o =>
                                o.id === option.id ? { ...o, reference: e.target.value } : o
                              ))
                            }
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Référence"
                          />
                          <input
                            type="text"
                            value={option.name}
                            onChange={(e) =>
                              setOptions(options.map(o =>
                                o.id === option.id ? { ...o, name: e.target.value } : o
                              ))
                            }
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Nom"
                          />
                        </div>
                        <textarea
                          value={option.description}
                          onChange={(e) =>
                            setOptions(options.map(o =>
                              o.id === option.id ? { ...o, description: e.target.value } : o
                            ))
                          }
                          rows={3}
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Description"
                        />
                        <input
                          type="number"
                          value={option.price}
                          onChange={(e) =>
                            setOptions(options.map(o =>
                              o.id === option.id ? { ...o, price: parseFloat(e.target.value) } : o
                            ))
                          }
                          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Prix"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Produits compatibles
                          </label>
                          {products.map((product) => (
                            <label key={product.id} className="inline-flex items-center mr-4">
                              <input
                                type="checkbox"
                                checked={option.productIds.includes(product.id)}
                                onChange={(e) => {
                                  const productIds = e.target.checked
                                    ? [...option.productIds, product.id]
                                    : option.productIds.filter(id => id !== product.id);
                                  setOptions(options.map(o =>
                                    o.id === option.id ? { ...o, productIds } : o
                                  ));
                                }}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-600">{product.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium">{option.name}</h4>
                          <span className="ml-2 text-sm text-gray-500">({option.reference})</span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{option.description}</p>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-900">{option.price} €</span>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-700">Produits compatibles:</span>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {products
                              .filter(product => option.productIds.includes(product.id))
                              .map(product => (
                                <span
                                  key={product.id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {product.name}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {editingId === option.id ? (
                      <button
                        onClick={() => handleUpdateOption(option)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(option.id)}
                        className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteOption(option.id)}
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
