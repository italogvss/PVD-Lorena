import jsPDF from 'jspdf';
import type { SaleDetail } from '../types';
import { formatBRL } from './currency';
import { formatDateTime } from './date';

export function generateReceiptPDF(sale: SaleDetail): void {
  const doc = new jsPDF({ format: 'a5', orientation: 'portrait' });
  const margin = 15;
  let y = 20;

  const line = (text: string, indent = margin) => {
    doc.text(text, indent, y);
    y += 7;
  };

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  line('COMPROVANTE DE VENDA');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  y += 2;
  line(`Data: ${formatDateTime(sale.createdAt)}`);
  line(`Operador: ${sale.operatorName}`);
  if (sale.customerName) line(`Cliente: ${sale.customerName}`);

  y += 4;
  doc.setFont('helvetica', 'bold');
  line('ITENS');
  doc.setFont('helvetica', 'normal');

  sale.items.forEach(item => {
    line(`${item.productName}`);
    line(`  ${item.quantity}x ${formatBRL(item.unitPrice)} = ${formatBRL(item.subtotal)}`, margin + 4);
  });

  y += 4;
  doc.setFont('helvetica', 'bold');
  line(`TOTAL: ${formatBRL(sale.total)}`);
  doc.setFont('helvetica', 'normal');

  line(`Pagamento: ${sale.paymentMethod}`);
  if (sale.isInstallment && sale.installmentCount) {
    line(`Parcelas: ${sale.installmentCount}x ${formatBRL(sale.installmentValue ?? 0)}`);
  }
  line(`Valor pago: ${formatBRL(sale.amountPaid)}`);
  line(`Troco: ${formatBRL(sale.change)}`);

  doc.save(`recibo-${sale.id}.pdf`);
}
