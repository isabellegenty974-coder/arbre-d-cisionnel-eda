import { jsPDF } from 'jspdf';

export const exportStatsPDF = (filteredDiagnostics, topItems, domaines, evolution, selectedProfession) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 12;
    let y = 20;

    const checkPage = () => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
    };

    // Titre
    doc.setFontSize(18);
    doc.setTextColor(12, 59, 140);
    doc.text('Statistiques des Diagnostics', margin, y);
    y += 8;

    // Date + filtre
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Genere le ' + new Date().toLocaleDateString('fr-FR'), margin, y);
    y += 5;
    if (selectedProfession) {
      doc.text('Filtre : ' + selectedProfession, margin, y);
      y += 5;
    }
    y += 5;

    // KPIs
    const nbEleves = new Set(filteredDiagnostics.map(d => d.eleve_prenom + ' ' + d.eleve_nom)).size;
    const nbDiagnostics = filteredDiagnostics.length;
    let nbItems = 0;
    filteredDiagnostics.forEach(d => {
      ['apprentissages', 'comportement', 'developpement', 'contexte'].forEach(cat => {
        nbItems += (d.selections?.[cat] || []).length;
      });
    });

    doc.setFontSize(13);
    doc.setTextColor(12, 59, 140);
    doc.text('Resume', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Eleves suivis : ' + nbEleves, margin + 4, y); y += 6;
    doc.text('Diagnostics realises : ' + nbDiagnostics, margin + 4, y); y += 6;
    doc.text('Items observes : ' + nbItems, margin + 4, y); y += 10;

    // Domaines
    const domainesOk = (domaines || []).filter(d => d.value > 0);
    if (domainesOk.length > 0) {
      checkPage();
      doc.setFontSize(13);
      doc.setTextColor(12, 59, 140);
      doc.text('Repartition par domaine', margin, y);
      y += 7;
      const total = domainesOk.reduce((s, d) => s + d.value, 0);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      domainesOk.forEach(domain => {
        const pct = total > 0 ? ((domain.value / total) * 100).toFixed(1) : 0;
        doc.text(domain.name + ' : ' + domain.value + ' (' + pct + '%)', margin + 4, y);
        y += 6;
        checkPage();
      });
      y += 4;
    }

    // Top 10
    if ((topItems || []).length > 0) {
      checkPage();
      doc.setFontSize(13);
      doc.setTextColor(12, 59, 140);
      doc.text('Top 10 observations frequentes', margin, y);
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      topItems.forEach((item, idx) => {
        checkPage();
        const label = item.name.length > 70 ? item.name.slice(0, 70) + '...' : item.name;
        doc.text((idx + 1) + '. ' + label, margin + 4, y);
        doc.text(item.total + 'x', pageWidth - margin, y, { align: 'right' });
        y += 5;
      });
      y += 4;
    }

    // Evolution mensuelle
    if ((evolution || []).length > 0) {
      checkPage();
      doc.setFontSize(13);
      doc.setTextColor(12, 59, 140);
      doc.text('Evolution mensuelle', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      evolution.forEach(month => {
        checkPage();
        doc.text(month.mois + ' : ' + month.total + ' diagnostic(s)', margin + 4, y);
        y += 5;
      });
    }

    // Pieds de page
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Page ' + i + '/' + totalPages, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    doc.save('statistiques-' + new Date().toISOString().split('T')[0] + '.pdf');
  } catch (err) {
    console.error('Erreur export PDF:', err);
    alert('Erreur lors de la generation du PDF : ' + err.message);
  }
};