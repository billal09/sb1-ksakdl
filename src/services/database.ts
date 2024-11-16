import { 
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  deleteDoc,
  serverTimestamp,
  updateDoc,
  writeBatch,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { InvoiceStatus } from '../types/invoice';

export interface Document {
  id?: string;
  type: 'invoice' | 'quote';
  status: InvoiceStatus;
  supplierId: string;
  supplierName: string;
  companyInfo: {
    name: string;
    siren: string;
    phone: string;
    email: string;
    address: string;
  };
  clientName: string;
  clientEmail: string;
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  notes?: string;
  createdAt?: any;
}

class DatabaseService {
  private static instance: DatabaseService;
  private initialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async createDocument(data: Omit<Document, 'id'>): Promise<string> {
    try {
      // Generate sequential number for document
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      
      const q = query(
        collection(db, 'invoices'),
        where('type', '==', data.type),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      let lastNumber = 0;
      
      if (!querySnapshot.empty) {
        const lastDoc = querySnapshot.docs[0];
        const lastId = lastDoc.id;
        const match = lastId.match(/\d+$/);
        if (match) {
          lastNumber = parseInt(match[0], 10);
        }
      }
      
      const nextNumber = lastNumber + 1;
      const documentId = `${data.type === 'invoice' ? 'FAC' : 'DEV'}-${year}${month}-${nextNumber.toString().padStart(4, '0')}`;

      // Use batch write for atomicity
      const batch = writeBatch(db);
      const docRef = doc(db, 'invoices', documentId);
      
      batch.set(docRef, {
        ...data,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      return documentId;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Erreur lors de la création du document. Veuillez réessayer.');
    }
  }

  async updateDocumentStatus(id: string, status: InvoiceStatus): Promise<void> {
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      throw new Error('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'invoices', id));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Erreur lors de la suppression du document. Veuillez réessayer.');
    }
  }

  async convertQuoteToInvoice(id: string): Promise<void> {
    try {
      const docRef = doc(db, 'invoices', id);
      await updateDoc(docRef, {
        type: 'invoice',
        status: 'pending',
        convertedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error converting quote:', error);
      throw new Error('Erreur lors de la conversion du devis. Veuillez réessayer.');
    }
  }

  async toggleNetworkStatus(online: boolean): Promise<void> {
    try {
      if (online) {
        await enableNetwork(db);
      } else {
        await disableNetwork(db);
      }
    } catch (error) {
      console.error('Error toggling network status:', error);
    }
  }
}

export const databaseService = DatabaseService.getInstance();