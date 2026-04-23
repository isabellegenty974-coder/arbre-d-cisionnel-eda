import jsPDF from 'jspdf';

export const exportResumePDF = (eleve, selections, crossRecommendations) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;

  const addPage = () => {
    doc.addPage();
    yPosition = 20;
  };

  const checkPageBreak = (heightNeeded = 20) => {
    if (yPosition + heightNeeded > pageHeight - 15) {
      addPage();
    }
  };

  // Header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('RÉSUMÉ DIAGNOSTIQUE', margin, yPosition);
  yPosition += 12;

  // Date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 10;

  // Info élève
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Informations élève', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  if (eleve) {
    doc.text(`Nom: ${eleve.nom}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Prénom: ${eleve.prenom}`, margin, yPosition);
    yPosition += 6;
    if (eleve.age) {
      doc.text(`Âge: ${eleve.age} ans`, margin, yPosition);
      yPosition += 6;
    }
    if (eleve.classe) {
      doc.text(`Classe: ${eleve.classe}`, margin, yPosition);
      yPosition += 6;
    }
  }
  yPosition += 4;

  // Sélections
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('Sélections diagnostiques', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  Object.entries(selections).forEach(([category, items]) => {
    checkPageBreak(15);
    doc.setFont(undefined, 'bold');
    doc.text(`${category}:`, margin, yPosition);
    yPosition += 6;

    doc.setFont(undefined, 'normal');
    items.forEach((item) => {
      checkPageBreak(10);
      const text = `• ${item.label}`;
      const wrappedText = doc.splitTextToSize(text, maxWidth - 5);
      doc.text(wrappedText, margin + 5, yPosition);
      yPosition += wrappedText.length * 5 + 2;
    });
    yPosition += 2;
  });

  // Recommandations croisées
  if (Object.keys(crossRecommendations).length > 0) {
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Recommandations croisées', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    Object.entries(crossRecommendations).forEach(([qId, reason]) => {
      checkPageBreak(15);
      doc.setFont(undefined, 'bold');
      doc.text(`${qId.toUpperCase()}`, margin, yPosition);
      yPosition += 5;

      doc.setFont(undefined, 'normal');
      const wrappedReason = doc.splitTextToSize(reason, maxWidth - 5);
      doc.text(wrappedReason, margin + 5, yPosition);
      yPosition += wrappedReason.length * 4 + 3;
    });
  }

  doc.save(`diagnostic_${eleve?.nom || 'eleve'}_${new Date().toISOString().split('T')[0]}.pdf`);
};