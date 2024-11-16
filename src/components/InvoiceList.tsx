import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Download, Trash2, RefreshCw, CheckCircle } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import type { Document } from '../services/database';
import type { InvoiceStatus } from '../types/invoice';
import { INVOICE_STATUSES } from '../types/invoice';

interface InvoiceListProps {
  documents: Document[];
  onUpdateStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onConvertToInvoice: (id: string) => Promise<void>;
}

export default function InvoiceList({
  documents,
  onUpdateStatus,
  onDelete,
  onConvertToInvoice
}: InvoiceListProps) {
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredDocuments = documents.filter(doc => 
    filter === 'all' || doc.status === filter
  );

  const handleStatusUpdate = async (id: string, status: InvoiceStatus) => {
    try {
      setLoading(id);
      await onUpdateStatus(id, status);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
      setLoading(id);
      await onDelete(id);
    } finally {
      setLoading(null);
    }
  };

  const handleConvertToInvoice = async (id: string) => {
    try {
      setLoading(id);
      await onConvertToInvoice(id);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'all' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        {Object.keys(INVOICE_STATUSES).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as InvoiceStatus)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === status
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {INVOICE_STATUSES[status as InvoiceStatus].label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">
                    {doc.type === 'invoice' ? 'Facture' : 'Devis'} {doc.id}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {doc.clientName} - {doc.clientEmail}
                </p>
                <p className="text-gray-600">
                  Date: {format(new Date(doc.date), 'dd MMMM yyyy', { locale: fr })}
                </p>
                {doc.type === 'invoice' && (
                  <p className="text-gray-600">
                    Échéance: {format(new Date(doc.dueDate), 'dd MMMM yyyy', { locale: fr })}
                  </p>
                )}
                <p className="text-lg font-semibold">
                  Total: {doc.total.toFixed(2)} €
                </p>
                <InvoiceStatusBadge status={doc.status} />
              </div>

              <div className="flex gap-2">
                {doc.type === 'quote' && (
                  <button
                    onClick={() => handleConvertToInvoice(doc.id!)}
                    disabled={!!loading}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Convertir en facture"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                )}
                
                <button
                  onClick={() => generatePDF(doc)}
                  className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  title="Télécharger"
                >
                  <Download className="h-5 w-5" />
                </button>

                {doc.type === 'invoice' && doc.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(doc.id!, 'paid')}
                    disabled={!!loading}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    title="Marquer comme payée"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id!)}
                  disabled={!!loading}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Aucun document trouvé
          </div>
        )}
      </div>
    </div>
  );
}