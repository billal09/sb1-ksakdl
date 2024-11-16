import React from 'react';
import { useInvoices } from '../hooks/useInvoices';
import { CheckCircle, Clock, WifiOff, AlertCircle } from 'lucide-react';

export default function DatabaseStatus() {
  const { documents, isOnline, error } = useInvoices();

  const stats = documents.reduce(
    (acc, doc) => {
      if (doc.type === 'invoice') {
        doc.status === 'paid' ? acc.paid++ : acc.pending++;
      }
      return acc;
    },
    { paid: 0, pending: 0 }
  );

  return (
    <div className="space-y-4">
      {!isOnline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <WifiOff className="h-5 w-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">
              Mode hors ligne - Les modifications seront synchronisées automatiquement une fois la connexion rétablie
            </p>
          </div>
        </div>
      )}

      {error && !error.includes('Mode hors ligne') && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              {stats.paid} facture{stats.paid > 1 ? 's' : ''} payée{stats.paid > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="bg-yellow-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800 font-medium">
              {stats.pending} facture{stats.pending > 1 ? 's' : ''} en attente
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}