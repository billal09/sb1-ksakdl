import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useUserData } from '../hooks/useUserData';
import { databaseService } from '../services/database';
import { generatePDF } from '../utils/pdfGenerator';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export default function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const { currentUser } = useAuth();
  const { userData } = useUserData();
  const [documentType, setDocumentType] = useState<'invoice' | 'quote'>('invoice');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    companyInfo: {
      name: '',
      siren: '',
      phone: '',
      email: '',
      address: ''
    },
    clientName: '',
    clientEmail: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: '', quantity: 1, price: 0 }],
    vatRate: 20,
    notes: ''
  });

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          name: userData.companyName || '',
          siren: userData.siren || '',
          phone: userData.phone || '',
          email: userData.email || '',
          address: userData.address || ''
        }
      }));
    }
  }, [userData]);

  const calculateSubtotal = () => {
    return formData.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const calculateVAT = () => {
    return (calculateSubtotal() * formData.vatRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      setFormData({
        ...formData,
        items: formData.items.filter((_, i) => i !== index)
      });
    }
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    if (field === 'price' || field === 'quantity') {
      value = parseFloat(value.toString()) || 0;
    }
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Vous devez être connecté pour créer un document');
      return;
    }

    if (!userData) {
      setError('Les informations de votre profil sont requises');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const documentData = {
        type: documentType,
        status: 'pending' as const,
        supplierId: currentUser.uid,
        supplierName: `${userData.firstName} ${userData.lastName}`,
        companyInfo: formData.companyInfo,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        date: formData.date,
        dueDate: formData.dueDate,
        items: formData.items,
        subtotal: calculateSubtotal(),
        vatRate: formData.vatRate,
        vatAmount: calculateVAT(),
        total: calculateTotal(),
        notes: formData.notes
      };

      // Create document in Firestore
      const docId = await databaseService.createDocument(documentData);
      
      if (!docId) {
        throw new Error('Erreur lors de la création du document');
      }

      // Generate and download PDF
      generatePDF({ ...documentData, id: docId });

      setSuccess(`${documentType === 'invoice' ? 'Facture' : 'Devis'} créé avec succès !`);
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        clientName: '',
        clientEmail: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        notes: ''
      }));

      onSuccess?.();
    } catch (err) {
      console.error('Error creating document:', err);
      setError('Une erreur est survenue lors de la création du document. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setDocumentType('invoice')}
          className={`px-4 py-2 rounded-lg ${
            documentType === 'invoice'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Facture
        </button>
        <button
          type="button"
          onClick={() => setDocumentType('quote')}
          className={`px-4 py-2 rounded-lg ${
            documentType === 'quote'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Devis
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Informations client</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du client</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email du client</label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Dates</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date d'émission</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            {documentType === 'invoice' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'échéance</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Articles</h3>
        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 mb-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                type="text"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Quantité</label>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700">Prix unitaire (€)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="col-span-1 flex items-end">
              {formData.items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-800 p-2"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="mt-2 flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" />
          Ajouter un article
        </button>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div>
          <p className="text-gray-600">Total HT: {calculateSubtotal().toFixed(2)} €</p>
          <p className="text-gray-600">TVA ({formData.vatRate}%): {calculateVAT().toFixed(2)} €</p>
          <p className="text-xl font-bold">Total TTC: {calculateTotal().toFixed(2)} €</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Création...' : `Créer ${documentType === 'invoice' ? 'la facture' : 'le devis'}`}
        </button>
      </div>
    </form>
  );
}