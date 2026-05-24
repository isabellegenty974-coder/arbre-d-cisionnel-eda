import jsPDF from 'jspdf';

export const exportStatsPDF = (filteredDiagnostics, topItems, domaines, evolution, selectedProfession) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  let yPos = 15;

  // Titre
  doc.setFontSize(20);
  doc.setTextColor(12, 59, 140); // Bleu #0C3B8C
  doc.text('Statistiques des Diagnostics', margin, yPos);
  yPos += 10;

  // Date d'export
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, yPos);
  if (selectedProfession) {
    doc.text(`Filtre: ${selectedProfession}`, margin, yPos + 5);
  }
  yPos += 15;

  // KPIs
  doc.setFontSize(12);
  doc.setTextColor(12, 59, 140);
  doc.text('Résumé des données', margin, yPos);
  yPos += 8;

  const nbEleves = new Set(filteredDiagnostics.map(d => `${d.eleve_prenom} ${d.eleve_nom}`)).size;
  const nbDiagnostics = filteredDiagnostics.length;
  const nbItems = (() => {
    let n = 0;
    filteredDiagnostics.forEach(d => {
      ['apprentissages', 'comportement', 'developpement', 'contexte'].forEach(cat => {
        n += (d.selections?.[cat] || []).length;
      });
    });
    return n;
  })();

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`• Élèves: ${nbEleves}`, margin + 5, yPos);
  doc.text(`• Diagnostics: ${nbDiagnostics}`, margin + 5, yPos + 5);
  doc.text(`• Items observés: ${nbItems}`, margin + 5, yPos + 10);
  yPos += 25;

  // Top 10 items
  if (topItems.length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(12, 59, 140);
    doc.text('Top 10 observations fréquentes', margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    topItems.forEach((item, idx) => {
      const ranking = `${idx + 1}.`;
      const label = item.name.length > 60 ? item.name.slice(0, 60) + '…' : item.name;
      doc.text(ranking, margin + 5, yPos);
      doc.text(label, margin + 12, yPos);
      doc.text(`${item.total}x`, pageWidth - margin - 10, yPos, { align: 'right' });
      yPos += 5;
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 15;
      }
    });
    yPos += 5;
  }

  // Répartition par domaine
  if (domaines.filter(d => d.value > 0).length > 0) {
    doc.setFontSize(12);
    doc.setTextColor(12, 59, 140);
    doc.text('Répartition par domaine', margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    const domainesFiltered = domaines.filter(d => d.value > 0);
    const total = domainesFiltered.reduce((sum, d) => sum + d.value, 0);
    
    domainesFiltered.forEach(domain => {
      const percent = ((domain.value / total) * 100).toFixed(1);
      doc.text(`${domain.name}: ${domain.value} (${percent}%)`, margin + 5, yPos);
      yPos += 5;
    });
    yPos += 5;
  }

  // Évolution mensuelle
  if (evolution.length > 0) {
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 15;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(12, 59, 140);
    doc.text('Évolution mensuelle (derniers 12 mois)', margin, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    evolution.forEach(month => {
      doc.text(`${month.mois}: ${month.total} diagnostic(s)`, margin + 5, yPos);
      yPos += 5;
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 15;
      }
    });
  }

  // Pied de page
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i}/${totalPages}`, pageWidth - margin - 10, pageHeight - 8, { align: 'right' });
  }

  doc.save(`statistiques-diagnostics-${new Date().toISOString().split('T')[0]}.pdf`);
};