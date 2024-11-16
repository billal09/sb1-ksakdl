export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceStatusConfig {
  label: string;
  color: string;
  icon: string;
}

export const INVOICE_STATUSES: Record<InvoiceStatus, InvoiceStatusConfig> = {
  pending: {
    label: 'En attente',
    color: 'yellow',
    icon: 'clock'
  },
  paid: {
    label: 'Payée',
    color: 'green',
    icon: 'check-circle'
  },
  overdue: {
    label: 'En retard',
    color: 'red',
    icon: 'alert-circle'
  },
  cancelled: {
    label: 'Annulée',
    color: 'gray',
    icon: 'x-circle'
  }
};