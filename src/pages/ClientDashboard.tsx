import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import InvoiceList from '../components/InvoiceList';
import InvoiceForm from '../components/InvoiceForm';
import DatabaseStatus from '../components/DatabaseStatus';

export default function ClientDashboard() {
  const [showForm, setShowForm] = useState(false);
  const { 
    documents, 
    loading, 
    error,
    updateStatus,
    deleteDocument,
    convertToInvoice
  } = useInvoices();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Fermer le formulaire' : 'Créer un document'}
        </button>
      </div>
      
      <DatabaseStatus />
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8">
          <InvoiceForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      <div className="mt-8">
        <InvoiceList
          documents={documents}
          onUpdateStatus={updateStatus}
          onDelete={deleteDocument}
          onConvertToInvoice={convertToInvoice}
        />
      </div>
    </div>
  );
}