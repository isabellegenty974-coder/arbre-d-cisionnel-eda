import jsPDF from 'jspdf';
import { titleCase } from './utils';

const PROFESSION_LABEL = {
  'Psy EN EDA': "Psychologue de l'Éducation Nationale · Spécialité EDA",
  'MaDR': 'Maître à Dominante Relationnelle (MaDR)',
  'MaDP': 'Maître à Dominante Pédagogique (MaDP)',
};

function stripMd(text) {
  if (!text) return '';
  return String(text)
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^---+$/gm, '')
    .replace(/`/g, '')
    .replace(/[^\w\s\-À-ÿ«».,;:!?()'%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanClassName(c) {
  return c ? c.replace(/\s*Salle\s+\S+/gi, '').replace(/\s+/g, ' ').trim() : '';
}

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt)) return '—';
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const PT = 0.352778; // pt -> mm

export async function generateRapportSuivi({ fiche, user, enseignant, membres = [] }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const M = 20; // marges 2cm
  const contentWidth = pageWidth - M * 2;
  const bottomLimit = pageHeight - 18;

  let y = M;
  let pageNum = 1;

  // ── Rédacteur ──
  let redacteurNom = user?.full_name || fiche.createdByName || 'Non renseigné';
  let redacteurProf = user?.profession || fiche.createdByProfession || '';
  if (user?.email && membres.length) {
    const me = membres.find(m => m.email && m.email.toLowerCase() === user.email.toLowerCase());
    if (me) {
      redacteurNom = `${me.prenom} ${me.nom}`.trim() || redacteurNom;
      redacteurProf = me.profession || redacteurProf;
    }
  }
  const redacteurTitre = PROFESSION_LABEL[redacteurProf] || redacteurProf || 'Membre de l\'équipe RASED';

  const now = new Date();
  const dateGeneration = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Helpers ──
  const footerBase = () => {
    doc.setFont('Calibri', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.2);
    doc.line(M, pageHeight - 14, pageWidth - M, pageHeight - 14);
    doc.text('Suivis RASED · Circonscription de La Possession', M, pageHeight - 9);
    doc.text('Document confidentiel', pageWidth / 2, pageHeight - 9, { align: 'center' });
  };

  const ensure = (h) => {
    if (y + h > bottomLimit) {
      footerBase();
      doc.addPage();
      pageNum += 1;
      y = M;
    }
  };

  const space = (mm = 4) => { y += mm; };

  const para = (text, opts = {}) => {
    const { size = 10.5, bold = false, indent = 0, lh = 1.4, color = [0, 0, 0] } = opts;
    doc.setFont('Calibri', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lhmm = size * lh * PT;
    const lines = doc.splitTextToSize(String(text ?? '—'), contentWidth - indent);
    lines.forEach((line) => {
      ensure(lhmm);
      doc.text(line, M + indent, y);
      y += lhmm;
    });
  };

  const kvRow = (label, value) => {
    doc.setFont('Calibri', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(90, 104, 128);
    const lhmm = 10 * 1.4 * PT;
    const lines = doc.splitTextToSize(String(value ?? '—'), contentWidth - 50);
    lines.forEach((line, i) => {
      ensure(lhmm);
      if (i === 0) doc.text(label + ' :', M, y);
      doc.setFont('Calibri', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(line, M + 50, y);
      y += lhmm;
    });
  };

  const sectionTitle = (num, title) => {
    ensure(14);
    doc.setFont('Calibri', 'bold');
    doc.setFontSize(12.5);
    doc.setTextColor(26, 51, 83);
    doc.text(`${num}. ${title}`, M, y);
    y += 2;
    doc.setDrawColor(26, 51, 83);
    doc.setLineWidth(0.3);
    doc.line(M, y, pageWidth - M, y);
    y += 7;
    doc.setTextColor(0, 0, 0);
  };

  // ── EN-TÊTE (bandeau) ──
  doc.setFillColor(26, 51, 83);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFont('Calibri', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('Suivis RASED · Circonscription de La Possession', pageWidth / 2, 10, { align: 'center' });
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(9.5);
  doc.text('Rapport de suivi de l\'élève', pageWidth / 2, 16.5, { align: 'center' });
  y = 30;

  // Date de génération (le rédacteur apparaît dans la section Signature)
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Généré le ${dateGeneration}`, M, y);
  y += 6;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(M, y, pageWidth - M, y);
  y += 7;

  // ── 1. IDENTITÉ DE L'ÉLÈVE ──
  sectionTitle('1', 'Identité de l\'élève');
  kvRow('Nom', (fiche.nom || '—').toUpperCase());
  kvRow('Prénom', fiche.prenom || '—');
  kvRow('Date de naissance', fiche.date_naissance ? fmtDate(fiche.date_naissance) : '—');
  kvRow('Âge', fiche.age ? `${fiche.age} ans` : '—');
  kvRow('École', titleCase(fiche.ecole) || '—');
  kvRow('Classe', cleanClassName(fiche.classe) || '—');
  kvRow('Enseignant·e', enseignant || '—');
  kvRow('Année scolaire', fiche.annee_scolaire || '—');
  space(5);

  // ── 2. INTERVENANTS RASED ──
  sectionTitle('2', 'Intervenants RASED');
  const intervenants = [...(fiche.intervenants || [])];
  if (fiche.createdByName && !intervenants.some(i => i.nom === fiche.createdByName)) {
    intervenants.unshift({ nom: fiche.createdByName, profession: fiche.createdByProfession });
  }
  if (intervenants.length === 0) {
    para('Aucun intervenant renseigné.', { indent: 2, color: [120, 120, 120] });
  } else {
    intervenants.forEach((iv, idx) => {
      const nom = iv.nom || '—';
      const profLabel = PROFESSION_LABEL[iv.profession] || iv.profession || 'Rôle non renseigné';
      para(`${idx + 1}. ${nom} — ${profLabel}`, { size: 10.5, indent: 2 });
    });
  }
  space(5);

  // ── 3. MOTIF DE LA DEMANDE ──
  sectionTitle('3', 'Motif de la demande');
  const motifText = stripMd(fiche.observations || fiche.motif_signalement) || 'Aucun motif renseigné.';
  para(motifText, { indent: 2 });
  space(3);

  doc.setFont('Calibri', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(26, 51, 83);
  ensure(6);
  doc.text('Problématiques identifiées :', M, y);
  y += 6;

  const probs = fiche.problematiques || {};
  const cats = [
    ['Apprentissages', probs.apprentissages],
    ['Comportement', probs.comportement],
    ['Développement', probs.developpement],
    ['Contexte', probs.contexte],
    ['Autre', probs.autre],
  ];
  let anyProb = false;
  cats.forEach(([cat, items]) => {
    if (items && items.length > 0) {
      anyProb = true;
      ensure(8);
      doc.setFont('Calibri', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(90, 104, 128);
      doc.text(cat + ' :', M + 2, y);
      y += 5.5;
      items.forEach((item) => {
        para(`— ${stripMd(item)}`, { size: 10, indent: 8 });
      });
      space(2);
    }
  });
  if (probs.autre_detail) {
    anyProb = true;
    ensure(8);
    doc.setFont('Calibri', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(90, 104, 128);
    doc.text('Précisions (Autre) :', M + 2, y);
    y += 5.5;
    para(stripMd(probs.autre_detail), { size: 10, indent: 8 });
    space(2);
  }
  if (!anyProb) {
    para('Aucune problématique cochée.', { size: 10, indent: 4, color: [120, 120, 120] });
  }
  space(5);

  // ── 4. HISTORIQUE DES SÉANCES ET INTERVENTIONS ──
  sectionTitle('4', 'Historique des séances et interventions');
  const seances = (fiche.interventions || [])
    .filter(iv => !iv.commentaire || !iv.commentaire.startsWith('[hypothèses de travail]'))
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (seances.length === 0) {
    para('Aucune séance enregistrée.', { indent: 2, color: [120, 120, 120] });
  } else {
    seances.forEach((iv, idx) => {
      if (idx > 0) {
        ensure(4);
        doc.setDrawColor(225, 225, 225);
        doc.setLineWidth(0.2);
        doc.line(M, y, pageWidth - M, y);
        y += 4;
      }
      ensure(18);
      doc.setFont('Calibri', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 51, 83);
      doc.text(`Séance ${idx + 1} — ${fmtDate(iv.date)}`, M, y);
      y += 6;
      const profLabel = PROFESSION_LABEL[iv.profession] || iv.profession || 'Rôle non renseigné';
      para(`Professionnel : ${iv.nom || '—'} — ${profLabel}`, { size: 10, indent: 2 });
      para(`Acte accompli : ${iv.description || '—'}`, { size: 10, indent: 2 });
      const cmt = stripMd(iv.commentaire || '');
      para(`Commentaire : ${cmt || '—'}`, { size: 10, indent: 2, color: cmt ? [0, 0, 0] : [120, 120, 120] });
      space(3);
    });
  }
  space(5);

  // ── 5. SYNTHÈSES EE/ESS ──
  sectionTitle('5', 'Synthèses d\'Équipe Éducative (EE / ESS)');
  const syntheses = fiche.syntheses_ee || [];
  if (syntheses.length === 0) {
    para('Aucune synthèse enregistrée.', { indent: 2, color: [120, 120, 120] });
  } else {
    syntheses.forEach((syn, idx) => {
      if (idx > 0) {
        ensure(4);
        doc.setDrawColor(225, 225, 225);
        doc.setLineWidth(0.2);
        doc.line(M, y, pageWidth - M, y);
        y += 4;
      }
      ensure(16);
      doc.setFont('Calibri', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(26, 51, 83);
      doc.text(`Synthèse ${idx + 1} — ${fmtDate(syn.date)}`, M, y);
      y += 6;
      para(`Membres présents : ${stripMd(syn.membres) || '—'}`, { size: 10, indent: 2 });
      para(`Décisions prises : ${stripMd(syn.decisions) || '—'}`, { size: 10, indent: 2 });
      space(3);
    });
  }
  space(5);

  // ── 6. STATUT ACTUEL DU SUIVI ──
  sectionTitle('6', 'Statut actuel du suivi');
  kvRow('Statut', fiche.statut || 'Nouveau');
  kvRow('Dernière mise à jour', fiche.updated_date ? fmtDate(fiche.updated_date) : (fiche.created_date ? fmtDate(fiche.created_date) : '—'));
  space(5);

  // ── 7. SIGNATURE ──
  sectionTitle('7', 'Signature');
  ensure(30);
  para(`Fait à La Possession, le ${dateGeneration}`, { size: 11 });
  space(6);
  para(redacteurNom, { size: 11, bold: true });
  para(redacteurTitre, { size: 10 });
  space(14);
  ensure(15);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(M, y, M + 60, y);
  doc.setFont('Calibri', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text('Signature manuscrite', M, y + 5);

  // ── Pieds de page finaux (toutes les pages) ──
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    footerBase();
    doc.setFont('Calibri', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} / ${total}`, pageWidth - M, pageHeight - 9, { align: 'right' });
  }

  return doc;
}