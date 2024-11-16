export interface CompanyInfo {
  name: string;
  siren: string;
  phone: string;
  email: string;
  address: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id?: string;
  type: 'invoice' | 'quote';
  status: 'pending' | 'paid';
  
  // Supplier information
  supplierId: string;
  supplierName: string;
  companyInfo: CompanyInfo;
  
  // Client information
  clientName: string;
  clientEmail: string;
  
  // Dates
  date: string;
  dueDate: string;
  createdAt: Date;
  updatedAt?: Date;
  convertedAt?: Date;
  
  // Financial information
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  
  // Additional information
  notes?: string;
  paymentTerms?: string;
  paymentMethod?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone: string;
  email: string;
  address: string;
  siren: string;
  createdAt: Date;
  updatedAt?: Date;
  settings?: {
    defaultVatRate?: number;
    defaultPaymentTerms?: string;
    defaultPaymentMethod?: string;
    logo?: string;
  };
}