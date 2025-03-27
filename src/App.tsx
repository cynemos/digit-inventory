import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { OrderFormBuilder } from './components/OrderFormBuilder';
import { AdminLogin } from './components/AdminLogin';
import { AdminPanel } from './components/AdminPanel';
import { useAuth } from './contexts/AuthContext';
import { Lock, FileText, History, Settings } from 'lucide-react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProductSummary } from './components/ProductSummary';

function App() {
  const { isAdmin } = useAuth();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'order' | 'history'>('order');

  // Reset showAdminLogin when logging out
  useEffect(() => {
    if (!isAdmin) {
      setShowAdminLogin(false);
    }
  }, [isAdmin]);

  if (showAdminLogin && !isAdmin) {
    return <AdminLogin onCancel={() => setShowAdminLogin(false)} />;
  }

  return (
    <Router>
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Aide à la saisie de Bons de Commande
                </h1>
              </div>
              {!isAdmin ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Accès Admin
                </button>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">Mode Administrateur</span>
                  <Settings className="h-5 w-5 text-indigo-600" />
                </div>
              )}
            </div>

            {!isAdmin && (
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('order')}
                    className={`${
                      activeTab === 'order'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <FileText className="h-5 w-5" />
                    <span>Nouveau Bon de Commande</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`${
                      activeTab === 'history'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <History className="h-5 w-5" />
                    <span>Historique</span>
                  </button>
                </nav>
              </div>
            )}

            <div className="mt-4">
              <Routes>
                <Route path="/" element={
                  activeTab === 'order' ? (
                    <OrderFormBuilder />
                  ) : (
                    <div className="bg-white shadow sm:rounded-lg p-6">
                      <div className="text-center text-gray-500 py-12">
                        <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Historique des Bons de Commande
                        </h3>
                        <p>Fonctionnalité à venir</p>
                      </div>
                    </div>
                  )
                } />
                <Route path="/products" element={<ProductSummary />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </div>
          </div>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
