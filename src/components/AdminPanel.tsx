import React, { useState } from 'react';
import { CategoryManager } from './admin/CategoryManager';
import { ProductManager } from './admin/ProductManager';
import { OptionManager } from './admin/OptionManager';
import { ListPlus, Package, Settings } from 'lucide-react';

type AdminTab = 'categories' | 'products' | 'options';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('categories')}
            className={`${
              activeTab === 'categories'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <ListPlus className="h-5 w-5 mr-2" />
            Catégories
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`${
              activeTab === 'products'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <Package className="h-5 w-5 mr-2" />
            Produits
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`${
              activeTab === 'options'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
          >
            <Settings className="h-5 w-5 mr-2" />
            Options
          </button>
        </nav>
      </div>
      <div className="p-6">
        {activeTab === 'categories' && <CategoryManager />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'options' && <OptionManager />}
      </div>
    </div>
  );
}
