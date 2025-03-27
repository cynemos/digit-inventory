import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { Category } from '../../types';

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: '', attributes: [], imageUrl: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAttribute, setNewAttribute] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    const categoriesData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
    setCategories(categoriesData);
  }

  async function handleAddCategory() {
    if (!newCategory.name) return;
    await addDoc(collection(db, 'categories'), newCategory);
    setNewCategory({ name: '', attributes: [], imageUrl: '' });
    loadCategories();
  }

  async function handleDeleteCategory(id: string) {
    await deleteDoc(doc(db, 'categories', id));
    loadCategories();
  }

  async function handleUpdateCategory(category: Category) {
    if (!category.id) return;
    await updateDoc(doc(db, 'categories', category.id), {
      name: category.name,
      attributes: category.attributes,
      imageUrl: category.imageUrl
    });
    setEditingId(null);
    loadCategories();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Ajouter une catégorie
          </h3>
          <div className="mt-4 space-y-4">
            <div>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Nom de la catégorie"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div>
              <input
                type="text"
                value={newCategory.imageUrl}
                onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                placeholder="URL de l'image"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAttribute}
                onChange={(e) => setNewAttribute(e.target.value)}
                placeholder="Nouvel attribut"
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
              <button
                onClick={() => {
                  if (newAttribute) {
                    setNewCategory({
                      ...newCategory,
                      attributes: [...newCategory.attributes, newAttribute]
                    });
                    setNewAttribute('');
                  }
                }}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {newCategory.attributes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {newCategory.attributes.map((attr, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            )}
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Ajouter la catégorie
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg divide-y divide-gray-200">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Catégories existantes
          </h3>
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 flex items-start justify-between"
              >
                <div className="flex-1">
                  {editingId === category.id ? (
                    <div>
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) =>
                          setCategories(
                            categories.map((c) =>
                              c.id === category.id ? { ...c, name: e.target.value } : c
                            )
                          )
                        }
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md mb-2"
                      />
                      <input
                        type="text"
                        value={category.imageUrl || ''}
                        onChange={(e) =>
                          setCategories(
                            categories.map((c) =>
                              c.id === category.id ? { ...c, imageUrl: e.target.value } : c
                            )
                          )
                        }
                        placeholder="URL de l'image"
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  ) : (
                    <h4 className="text-lg font-medium">{category.name}</h4>
                  )}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {category.attributes.map((attr, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {attr}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  {editingId === category.id ? (
                    <button
                      onClick={() => handleUpdateCategory(category)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditingId(category.id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
