import jsPDF from 'jspdf';

export async function generateReport(data, user) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 25;
  const marginBottom = 20;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let yPosition = marginTop;

  // ──────────────────────────────────────────────────────
  // FONCTION : Ajouter pied de page
  // ──────────────────────────────────────────────────────
  const addFooter = (pageNum, totalPages) => {
    doc.setFont('Arial', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);

    const footerY = pageHeight - marginBottom + 5;

    // Gauche
    doc.text('Suivis RASED · Circonscription de La Possession', marginLeft, footerY);

    // Centre
    const centerText = `Page ${pageNum}/${totalPages}`;
    const centerX = pageWidth / 2;
    doc.text(centerText, centerX, footerY, { align: 'center' });

    // Droite
    const today = new Date().toLocaleDateString('fr-FR');
    doc.text(today, pageWidth - marginRight, footerY, { align: 'right' });
  };

  // ──────────────────────────────────────────────────────
  // FONCTION : Vérifier si on doit passer à la page suivante
  // ──────────────────────────────────────────────────────
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - marginBottom) {
      addFooter(doc.getNumberOfPages(), '?'); // sera mis à jour après
      doc.addPage();
      yPosition = marginTop;
    }
  };

  // ──────────────────────────────────────────────────────
  // EN-TÊTE OFFICIEL
  // ──────────────────────────────────────────────────────
  doc.setFont('Arial', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(26, 51, 83);

  doc.text('RASED · Circonscription de La Possession', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;
  doc.setFont('Arial', 'normal');
  doc.setFontSize(10);
  doc.text('La Réunion', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Bloc auteur
  doc.setFont('Arial', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const professionLabel = {
    'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA',
    'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
    'MaDP': 'Maître à Dominante Pédagogique (MaDP)'
  };

  doc.text(`${user.full_name || 'Utilisateur'}`, marginLeft, yPosition);
  yPosition += 6;
  doc.text(`Rôle : ${professionLabel[user.profession] || user.profession}`, marginLeft, yPosition);
  yPosition += 10;

  // Date du jour
  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`La Possession, le ${formattedDate}`, marginLeft, yPosition);
  yPosition += 15;

  // ──────────────────────────────────────────────────────
  // TITRE PRINCIPAL
  // ──────────────────────────────────────────────────────
  checkPageBreak(40);
  doc.setFont('Arial', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 51, 83);

  const reportTitle = data.type === 'synthese' ? 'SYNTHÈSE DE SUIVI' : 'COMPTE-RENDU D\'HYPOTHÈSES';
  doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // ──────────────────────────────────────────────────────
  // INFORMATIONS ÉLÈVE
  // ──────────────────────────────────────────────────────
  checkPageBreak(25);
  doc.setFont('Arial', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  const eleve = data.eleve;
  const infoElements = [
    `Élève : ${eleve.prenom} ${eleve.nom}`,
    `Classe : ${eleve.classe || 'Non renseignée'}`,
    `École : ${eleve.ecole || 'Non renseignée'}`,
    eleve.date_naissance ? `Date de naissance : ${new Date(eleve.date_naissance).toLocaleDateString('fr-FR')}` : null
  ].filter(Boolean);

  infoElements.forEach(info => {
    doc.text(info, marginLeft, yPosition);
    yPosition += 5;
  });
  yPosition += 5;

  // ──────────────────────────────────────────────────────
  // SECTIONS DU RAPPORT
  // ──────────────────────────────────────────────────────

  const sections = [
    {
      titre: 'Motif du signalement',
      contenu: data.motif || 'Non renseigné'
    },
    {
      titre: 'Observations',
      contenu: data.observations || 'Aucune observation enregistrée'
    },
    {
      titre: 'Hypothèses formulées',
      contenu: data.hypotheses && data.hypotheses.length > 0
        ? data.hypotheses.map((h, i) => `${i + 1}. ${h}`).join('\n')
        : 'Aucune hypothèse formulée'
    },
    {
      titre: 'Préconisations et actions',
      contenu: data.actions && data.actions.length > 0
        ? data.actions.map((a, i) => `${i + 1}. ${a}`).join('\n')
        : 'Aucune action enregistrée'
    },
    {
      titre: 'Suites envisagées',
      contenu: data.suites || 'À déterminer'
    }
  ];

  sections.forEach((section) => {
    checkPageBreak(25);

    // Titre de section
    doc.setFont('Arial', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 196);
    doc.text(section.titre, marginLeft, yPosition);
    yPosition += 7;

    // Contenu
    doc.setFont('Arial', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    const splitText = doc.splitTextToSize(section.contenu, contentWidth - 5);
    splitText.forEach((line) => {
      checkPageBreak(8);
      doc.text(line, marginLeft + 5, yPosition);
      yPosition += 5;
    });

    yPosition += 3;
  });

  // ──────────────────────────────────────────────────────
  // SIGNATURE
  // ──────────────────────────────────────────────────────
  checkPageBreak(50);
  yPosition += 10;

  doc.setFont('Arial', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  doc.text('Fait à La Possession,', marginLeft, yPosition);
  yPosition += 5;
  doc.text(`le ${formattedDate}`, marginLeft, yPosition);
  yPosition += 12;

  // Ligne de signature
  doc.setDrawColor(0);
  doc.line(marginLeft, yPosition, marginLeft + 50, yPosition);
  yPosition += 3;
  doc.setFont('Arial', 'normal');
  doc.setFontSize(9);
  doc.text('(Signature)', marginLeft, yPosition + 5);
  yPosition += 8;

  // Bloc signature
  doc.setFont('Arial', 'normal');
  doc.setFontSize(10);
  doc.text(user.full_name || 'Utilisateur', marginLeft, yPosition);
  yPosition += 5;
  doc.text(professionLabel[user.profession] || user.profession, marginLeft, yPosition);
  yPosition += 5;
  doc.setFont('Arial', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text('RASED · Circonscription de La Possession', marginLeft, yPosition);

  // ──────────────────────────────────────────────────────
  // AJOUTER LES PIEDS DE PAGE À TOUTES LES PAGES
  // ──────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(i, totalPages);
  }

  return doc;
}

export function downloadReport(doc, filename = 'rapport.pdf') {
  doc.save(filename);
}