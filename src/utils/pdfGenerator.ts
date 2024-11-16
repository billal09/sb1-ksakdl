import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Document } from '../services/database';

const APP_NAME = 'Bil-Development Facture Pro';

export function generatePDF(document: Document): void {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true
    });
    
    // Add header with app name
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(APP_NAME, doc.internal.pageSize.width / 2, 10, { align: 'center' });
    
    // Document type title
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text(document.type === 'invoice' ? 'FACTURE' : 'DEVIS', 20, 30);

    // Status for invoices
    if (document.type === 'invoice') {
      doc.setFontSize(14);
      const statusColor = document.status === 'paid' 
        ? [39, 174, 96]  // Green for paid
        : [243, 156, 18]; // Orange for pending
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(
        document.status === 'paid' ? 'PAYÉE' : 'EN ATTENTE',
        150,
        30
      );
    }

    // Company information
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('ÉMETTEUR', 20, 50);
    doc.text(document.companyInfo.name, 20, 55);
    doc.text(`SIREN: ${document.companyInfo.siren}`, 20, 60);
    doc.text(document.companyInfo.address, 20, 65);
    doc.text(document.companyInfo.phone, 20, 70);
    doc.text(document.companyInfo.email, 20, 75);

    // Client information
    doc.text('CLIENT', 120, 50);
    doc.text(document.clientName, 120, 55);
    doc.text(document.clientEmail, 120, 60);

    // Document details
    doc.text(`N° ${document.id || ''}`, 20, 90);
    doc.text(`Date: ${format(new Date(document.date), 'dd MMMM yyyy', { locale: fr })}`, 20, 95);
    if (document.type === 'invoice') {
      doc.text(`Échéance: ${format(new Date(document.dueDate), 'dd MMMM yyyy', { locale: fr })}`, 20, 100);
    }

    // Items table
    const tableColumn = ['Description', 'Quantité', 'Prix unitaire (€)', 'Total (€)'];
    const tableRows = document.items.map(item => [
      item.description,
      item.quantity.toString(),
      item.price.toFixed(2),
      (item.quantity * item.price).toFixed(2)
    ]);

    (doc as any).autoTable({
      startY: 110,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [44, 62, 80],
        textColor: [255, 255, 255],
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 40, halign: 'right' },
        3: { cellWidth: 40, halign: 'right' }
      }
    });

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Subtotal
    doc.text('Total HT:', 140, finalY);
    doc.text(`${document.subtotal.toFixed(2)} €`, 170, finalY, { align: 'right' });
    
    // VAT
    doc.text(`TVA (${document.vatRate}%)`, 140, finalY + 5);
    doc.text(`${document.vatAmount.toFixed(2)} €`, 170, finalY + 5, { align: 'right' });
    
    // Total including VAT
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Total TTC:', 140, finalY + 15);
    doc.text(`${document.total.toFixed(2)} €`, 170, finalY + 15, { align: 'right' });

    // Notes section
    if (document.notes) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Notes:', 20, finalY + 25);
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(document.notes, 170);
      doc.text(splitNotes, 20, finalY + 30);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    const footerText = `Document généré par ${APP_NAME} le ${format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}`;
    doc.text(
      footerText,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Generate filename and save
    const documentType = document.type === 'invoice' ? 'facture' : 'devis';
    const documentNumber = document.id || format(new Date(), 'yyyyMMddHHmmss');
    const filename = `${documentType}-${documentNumber}.pdf`;

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Erreur lors de la génération du PDF');
  }
}