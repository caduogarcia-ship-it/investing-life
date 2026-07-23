import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  longName: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalCurrent: number;
  totalPnl: number;
  pnlPercent: number;
}

export class PdfReportService {
  public generatePortfolioReport(
    clientName: string,
    portfolio: PortfolioItem[],
    summary: PortfolioSummary
  ): void {
    const doc = new jsPDF();
    const dateStr = new Date().toLocaleDateString('pt-BR');

    // Header
    doc.setFontSize(18);
    doc.text('Investing Life - Relatório de Carteira', 14, 22);

    doc.setFontSize(12);
    doc.text(`Cliente: ${clientName}`, 14, 32);
    doc.text(`Data: ${dateStr}`, 14, 38);

    // Table with all portfolio items
    const tableColumn = ["Símbolo", "Nome", "Qtd", "PM", "Preço Atual", "P&L"];
    const tableRows: Array<Array<string | number>> = [];

    portfolio.forEach(item => {
      const pnl = (item.currentPrice - item.averagePrice) * item.quantity;
      const itemData = [
        item.symbol,
        item.longName,
        item.quantity,
        `R$ ${item.averagePrice.toFixed(2)}`,
        `R$ ${item.currentPrice.toFixed(2)}`,
        `R$ ${pnl.toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY || (doc as any).previousAutoTable?.finalY || 100;

    // Summary section with totals
    doc.setFontSize(14);
    doc.text('Resumo da Carteira', 14, finalY + 15);

    doc.setFontSize(11);
    doc.text(`Total Investido: R$ ${summary.totalInvested.toFixed(2)}`, 14, finalY + 25);
    doc.text(`Valor Atual: R$ ${summary.totalCurrent.toFixed(2)}`, 14, finalY + 31);
    doc.text(`Lucro/Prejuízo: R$ ${summary.totalPnl.toFixed(2)} (${summary.pnlPercent.toFixed(2)}%)`, 14, finalY + 37);

    // Footer disclaimer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        'Este relatório é apenas para fins informativos e não constitui recomendação de investimento.',
        14,
        doc.internal.pageSize.height - 10
      );
    }

    // Save as download
    const filenameDate = new Date().toISOString().split('T')[0];
    const safeClientName = clientName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`relatorio_carteira_${safeClientName}_${filenameDate}.pdf`);
  }
}
