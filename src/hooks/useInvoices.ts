import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, orderBy, onSnapshot, enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { databaseService } from '../services/database';
import type { Document } from '../services/database';
import type { InvoiceStatus } from '../types/invoice';

export function useInvoices() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { currentUser } = useAuth();

  const handleConnectionChange = useCallback(async (online: boolean) => {
    setIsOnline(online);
    try {
      if (online) {
        await enableNetwork(db);
        setError(null);
      } else {
        await disableNetwork(db);
        setError('Mode hors ligne - Les modifications seront synchronisées automatiquement une fois la connexion rétablie');
      }
    } catch (err) {
      console.error('Network status change error:', err);
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => handleConnectionChange(true);
    const handleOffline = () => handleConnectionChange(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection check
    handleConnectionChange(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleConnectionChange]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'invoices'),
          where('supplierId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(
          q,
          {
            next: (snapshot) => {
              const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Document[];
              setDocuments(docs);
              setLoading(false);
              if (isOnline) setError(null);
            },
            error: (err) => {
              console.error('Subscription error:', err);
              if (err.code === 'unavailable' || err.code === 'failed-precondition') {
                handleConnectionChange(false);
              } else {
                setError('Erreur de chargement des documents');
              }
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.error('Setup error:', err);
        setError('Erreur de configuration');
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, isOnline, handleConnectionChange]);

  const updateStatus = async (id: string, status: InvoiceStatus) => {
    if (!id || !status) return;
    try {
      await databaseService.updateDocumentStatus(id, status);
      if (!isOnline) {
        setError('Document mis à jour. Les modifications seront synchronisées une fois la connexion rétablie');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      throw new Error('Erreur lors de la mise à jour du statut');
    }
  };

  const deleteDocument = async (id: string) => {
    if (!id) return;
    try {
      await databaseService.deleteDocument(id);
      if (!isOnline) {
        setError('Document supprimé. Les modifications seront synchronisées une fois la connexion rétablie');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Erreur lors de la suppression du document');
    }
  };

  const convertToInvoice = async (id: string) => {
    if (!id) return;
    try {
      await databaseService.convertQuoteToInvoice(id);
      if (!isOnline) {
        setError('Devis converti en facture. Les modifications seront synchronisées une fois la connexion rétablie');
      }
    } catch (error) {
      console.error('Error converting to invoice:', error);
      throw new Error('Erreur lors de la conversion en facture');
    }
  };

  return {
    documents,
    loading,
    error,
    isOnline,
    updateStatus,
    deleteDocument,
    convertToInvoice
  };
}