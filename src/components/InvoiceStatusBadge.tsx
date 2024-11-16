import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import type { InvoiceStatus } from '../types/invoice';
import { INVOICE_STATUSES } from '../types/invoice';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const icons = {
  'check-circle': CheckCircle,
  'clock': Clock,
  'alert-circle': AlertCircle,
  'x-circle': XCircle
};

export default function InvoiceStatusBadge({ status, className = '' }: InvoiceStatusBadgeProps) {
  const config = INVOICE_STATUSES[status];
  const Icon = icons[config.icon as keyof typeof icons];
  
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`${baseClasses} ${colorClasses[config.color]} ${className}`}>
      <Icon className="w-4 h-4 mr-1" />
      {config.label}
    </span>
  );
}