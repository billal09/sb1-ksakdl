import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import InvoiceForm from '../components/InvoiceForm';

export default function SupplierDashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Bil-Development Facture Pro - Créer une facture</h1>
      <InvoiceForm />
    </div>
  );
}