import React, { useState } from 'react';
import { deleteAllCollections } from '../utils/cleanupFirebase';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCleanup = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await deleteAllCollections();
      setMessage('Toutes les collections ont été supprimées avec succès');
    } catch (error) {
      setMessage('Erreur lors de la suppression des collections');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Administration</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Nettoyage de la base de données</h2>
        
        <div className="mb-4">
          <p className="text-red-600 font-medium">
            Attention : Cette action supprimera définitivement toutes les données.
          </p>
        </div>

        <button
          onClick={handleCleanup}
          disabled={loading}
          className={`px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Suppression en cours...' : 'Supprimer toutes les collections'}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}