import jsPDF from 'jspdf';
import { titleCase } from './utils';

export async function generateReport(data, user) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 25;
  const marginRight = 25;
  const marginTop = 20;
  const marginBottom = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let currentPage = 1;
  let yPosition = marginTop;
  let isFirstPage = true;

  // Fonction pour ajouter le pied de page
  const addFooter = (pageNum, totalPages) => {
    doc.setFont('Calibri', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);

    const footerY = pageHeight - marginBottom + 8;

    // Ligne séparatrice
    doc.setDrawColor(200, 200, 200);
    doc.line(marginLeft, pageHeight - marginBottom + 3, pageWidth - marginRight, pageHeight - marginBottom + 3);

    // Contenu du pied
    doc.text('Suivis RASED · Circonscription de La Possession', marginLeft, footerY);

    const centerText = 'Document confidentiel';
    doc.text(centerText, pageWidth / 2, footerY, { align: 'center' });

    const today = new Date().toLocaleDateString('fr-FR');
    const rightText = `Page ${pageNum} / ${totalPages} · ${today}`;
    doc.text(rightText, pageWidth - marginRight, footerY, { align: 'right' });
  };

  // Fonction pour vérifier et créer une nouvelle page si nécessaire
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - marginBottom) {
      addFooter(currentPage, '?'); // Sera mis à jour après
      doc.addPage();
      currentPage += 1;
      yPosition = marginTop;
      isFirstPage = false;
    }
  };

  // ──────────────────────────────────────────────────────
  // EN-TÊTE (première page seulement)
  // ──────────────────────────────────────────────────────
  
  // Bandeau
  doc.setFillColor(26, 51, 83);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  doc.setFont('Calibri', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text('RASED · Circonscription de La Possession', pageWidth / 2, 12, { align: 'center' });
  
  yPosition = 30;

  // Ligne séparatrice
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, 28, pageWidth - marginRight, 28);

  // Informations rédacteur (droite)
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const fullName = user?.full_name || 'Non renseigné';
  const profession = user?.profession || 'Non renseigné';

  const professionLabel = {
    'Psy EN EDA': 'Psychologue de l\'Éducation Nationale · Spécialité EDA',
    'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
    'MaDP': 'Maître à Dominante Pédagogique (MaDP)'
  };

  const officialTitle = professionLabel[profession] || profession;

  doc.text(fullName, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 5;
  doc.text(officialTitle, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 5;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`La Possession, le ${formattedDate}`, pageWidth - marginRight, yPosition, { align: 'right' });
  yPosition += 12;

  // Ligne séparatrice
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 8;

  // ──────────────────────────────────────────────────────
  // TITRE ET IDENTITÉ ÉLÈVE
  // ──────────────────────────────────────────────────────
  
  doc.setFont('Calibri', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 51, 83);
  
  const reportTitle = data.type === 'synthese' ? 'SYNTHÈSE DE SUIVI' : 'COMPTE-RENDU D\'HYPOTHÈSES';
  doc.text(reportTitle, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Identité de l'élève
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);

  const eleve = data.eleve;
  const eleveName = `${eleve.prenom} ${eleve.nom}`;
  const eleveClass = eleve.classe || '—';
  const eleveSchool = titleCase(eleve.ecole) || '—';
  const eleveBirthDate = eleve.date_naissance 
    ? new Date(eleve.date_naissance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  const identityText = `${eleveName} · ${eleveClass} · ${eleveSchool} · Née le ${eleveBirthDate}`;
  doc.text(identityText, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Ligne séparatrice
  doc.setDrawColor(200, 200, 200);
  doc.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
  yPosition += 8;

  // ──────────────────────────────────────────────────────
  // CORPS DU RAPPORT
  // ──────────────────────────────────────────────────────

  doc.setFont('Calibri', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setLineHeightFactor(1.4);

  const sections = [
    {
      num: '1',
      titre: 'Motif du signalement',
      contenu: data.motif || '—'
    },
    {
      num: '2',
      titre: 'Observations cliniques',
      contenu: data.observations || '—'
    },
    {
      num: '3',
      titre: 'Hypothèses de travail',
      contenu: data.hypotheses && data.hypotheses.length > 0
        ? data.hypotheses.map(h => `— ${h}`).join('\n')
        : '—'
    },
    {
      num: '4',
      titre: 'Préconisations',
      contenu: data.actions && data.actions.length > 0
        ? data.actions.map(a => `— ${a}`).join('\n')
        : '—'
    },
    {
      num: '5',
      titre: 'Suites envisagées',
      contenu: data.suites || '—'
    }
  ];

  sections.forEach((section) => {
    checkPageBreak(25);

    // Titre de section avec numérotation
    doc.setFont('Calibri', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(26, 51, 83);
    const sectionTitle = `${section.num}. ${section.titre}`;
    doc.text(sectionTitle, marginLeft, yPosition);
    yPosition += 6;

    // Contenu
    doc.setFont('Calibri', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Nettoyer le contenu des caractères parasites
    let cleanContent = section.contenu
      .replace(/[^\w\s\-À-ÿ«».,;:!?()]/g, '') // Supprime les caractères spéciaux
      .replace(/\s+/g, ' ') // Nettoie les espaces multiples
      .trim();

    const splitText = doc.splitTextToSize(cleanContent, contentWidth - 5);
    splitText.forEach((line) => {
      checkPageBreak(6);
      doc.text(line, marginLeft + 5, yPosition);
      yPosition += 5;
    });

    yPosition += 4;
  });

  // ──────────────────────────────────────────────────────
  // SIGNATURE (dernière page)
  // ──────────────────────────────────────────────────────
  
  checkPageBreak(60);
  yPosition += 15;

  doc.setFont('Calibri', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  doc.text(`Fait à La Possession, le ${formattedDate}`, marginLeft, yPosition);
  yPosition += 12;

  // Espace pour signature
  doc.setDrawColor(0, 0, 0);
  doc.line(marginLeft, yPosition, marginLeft + 50, yPosition);
  yPosition += 3;
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Signature', marginLeft, yPosition + 5);
  yPosition += 12;

  // Bloc identité signataire
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(fullName, marginLeft, yPosition);
  yPosition += 5;
  doc.text(officialTitle, marginLeft, yPosition);
  yPosition += 5;
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
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