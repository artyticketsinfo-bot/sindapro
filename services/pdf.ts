
import { jsPDF } from 'jspdf';
import { Member, Case, CaseStatus } from '../types';

const COLORS = {
  primary: [30, 64, 175], // Blue 800
  text: [31, 41, 55],    // Gray 800
  lightText: [107, 114, 128], // Gray 500
  divider: [229, 231, 235]  // Gray 200
};

const drawHeader = (doc: jsPDF, title: string) => {
  // Title Bar
  doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  // App Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('GESTIONE SINDACALE', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Software Gestionale Professionale', 20, 27);
  
  // Date and Page title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 20, 55);
  
  doc.setFontSize(9);
  doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
  doc.text(`Data Documento: ${new Date().toLocaleString('it-IT')}`, 140, 55);
  
  // Divider
  doc.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
  doc.line(20, 60, 190, 60);
};

const drawFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(COLORS.divider[0], COLORS.divider[1], COLORS.divider[2]);
  doc.line(20, pageHeight - 20, 190, pageHeight - 20);
  
  doc.setFontSize(8);
  doc.setTextColor(COLORS.lightText[0], COLORS.lightText[1], COLORS.lightText[2]);
  doc.text('Documento ad uso strettamente interno. Riservato.', 20, pageHeight - 13);
  doc.text(`Pagina ${doc.internal.getCurrentPageInfo().pageNumber}`, 180, pageHeight - 13);
};

export const exportMemberPDF = (member: Member) => {
  const doc = new jsPDF();
  drawHeader(doc, 'Scheda Anagrafica Iscritto');
  
  let y = 75;
  const labelX = 20;
  const valueX = 70;
  const step = 10;

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  doc.setFontSize(11);

  const fields = [
    { label: 'ID Iscritto:', value: member.id },
    { label: 'Nominativo:', value: `${member.cognome} ${member.nome}` },
    { label: 'Codice Fiscale:', value: member.codiceFiscale },
    { label: 'Email:', value: member.email },
    { label: 'Telefono:', value: member.telefono },
    { label: 'Data Iscrizione:', value: member.dataIscrizione },
    { label: 'Stato Quota:', value: member.quotaAttiva ? 'REGOLARE / ATTIVA' : 'IRREGOLARE / SOSPESA' }
  ];

  fields.forEach(field => {
    doc.setFont('helvetica', 'bold');
    doc.text(field.label, labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(field.value.toString(), valueX, y);
    y += step;
  });

  drawFooter(doc);
  doc.save(`Scheda_${member.cognome}_${member.nome}.pdf`);
};

export const exportCasePDF = (caseData: Case, memberName: string) => {
  const doc = new jsPDF();
  drawHeader(doc, 'Dettaglio Pratica Sindacale');
  
  let y = 75;
  const labelX = 20;
  const valueX = 70;
  const step = 10;

  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  const fields = [
    { label: 'Codice Pratica:', value: caseData.id },
    { label: 'Titolo:', value: caseData.titolo },
    { label: 'Stato Corrente:', value: caseData.status.toUpperCase() },
    { label: 'Priorità:', value: caseData.priorita.toUpperCase() },
    { label: 'Data Apertura:', value: caseData.dataApertura },
    { label: 'Scadenza Prevista:', value: caseData.scadenza },
    { label: 'Iscritto Associato:', value: memberName }
  ];

  fields.forEach(field => {
    doc.setFont('helvetica', 'bold');
    doc.text(field.label, labelX, y);
    doc.setFont('helvetica', 'normal');
    doc.text(field.value.toString(), valueX, y);
    y += step;
  });

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Descrizione Pratica:', labelX, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const splitDesc = doc.splitTextToSize(caseData.descrizione, 170);
  doc.text(splitDesc, labelX, y);

  drawFooter(doc);
  doc.save(`Pratica_${caseData.id}.pdf`);
};

export const exportReportPDF = (title: string, data: any[], headers: string[], keys: string[]) => {
  const doc = new jsPDF();
  drawHeader(doc, title);
  
  let y = 75;
  const colWidth = 170 / headers.length;
  
  // Draw Table Headers
  doc.setFillColor(243, 244, 246);
  doc.rect(20, y - 5, 170, 8, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);
  
  headers.forEach((header, i) => {
    doc.text(header, 22 + (i * colWidth), y);
  });
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2]);

  data.forEach((row, rowIndex) => {
    if (y > 270) {
      drawFooter(doc);
      doc.addPage();
      drawHeader(doc, title);
      y = 75;
      // Re-draw headers
      doc.setFillColor(243, 244, 246);
      doc.rect(20, y - 5, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      headers.forEach((header, i) => {
        doc.text(header, 22 + (i * colWidth), y);
      });
      y += 10;
      doc.setFont('helvetica', 'normal');
    }
    
    keys.forEach((key, colIndex) => {
      const val = row[key]?.toString() || '-';
      doc.text(val, 22 + (colIndex * colWidth), y);
    });
    
    y += 8;
    // Row Divider
    doc.setDrawColor(249, 250, 251);
    doc.line(20, y - 2, 190, y - 2);
  });

  drawFooter(doc);
  doc.save(`Report_${title.replace(/\s+/g, '_')}.pdf`);
};
