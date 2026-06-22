import { jsPDF } from 'jspdf';

const COLORS = {
  'Psy EN EDA': '#1A3353',
  'MaDR': '#1E7A52',
  'MaDP': '#B85C1A',
};

const TEXT_COLORS = {
  'Psy EN EDA': '#254D7A',
  'MaDR': '#1E7A52',
  'MaDP': '#B85C1A',
};

const BG_COLORS = {
  'Psy EN EDA': '#EAF2FB',
  'MaDR': '#E4F4ED',
  'MaDP': '#FEF0E4',
};

export async function generateRapportAnnuel(data) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Helper functions
  const addHeader = () => {
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Suivis RASED · Circonscription de La Possession · La Réunion', margin, 12);
    doc.text(`Rapport annuel ${data.annee_scolaire}`, pageWidth - margin, 12, { align: 'right' });
  };

  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('Document confidentiel · Usage interne RASED', margin, pageHeight - 8);
    doc.text(`Page ${pageNum} | ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  };

  const addKpiCard = (x, y, label, value, color) => {
    const boxWidth = 30;
    const boxHeight = 18;
    doc.setFillColor(...hexToRgb(color));
    doc.rect(x, y, boxWidth, boxHeight, 'F');
    doc.setFontSize(20);
    doc.setTextColor(26, 51, 83);
    doc.text(String(value), x + 15, y + 12, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(label, x + 15, y + 18, { align: 'center' });
  };

  // PAGE 1 - COUVERTURE
  doc.setFillColor(26, 51, 83);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  
  doc.setFontSize(48);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Suivis RASED', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(24);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport annuel d\'activité', pageWidth / 2, 70, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(200, 200, 200);
  doc.text(data.annee_scolaire, pageWidth / 2, 90, { align: 'center' });
  doc.text('Circonscription de La Possession · La Réunion', pageWidth / 2, 100, { align: 'center' });
  
  // Équipe
  const yTeam = 130;
  const teamWidth = (pageWidth - 40) / 3;
  data.membres.forEach((m, i) => {
    const xPos = 20 + i * (teamWidth + 5);
    const color = COLORS[m.profession] || '#1A3353';
    const bgColor = hexToRgb(color);
    
    doc.setFillColor(...bgColor);
    doc.rect(xPos, yTeam, teamWidth, 35, 'F');
    
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${m.prenom} ${m.nom}`, xPos + 3, yTeam + 10, { maxWidth: teamWidth - 6 });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(getTitleForProfession(m.profession), xPos + 3, yTeam + 22, { maxWidth: teamWidth - 6 });
  });
  
  // Signatures
  const ySig = 200;
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Signatures de l\'équipe RASED', pageWidth / 2, ySig, { align: 'center' });
  
  data.membres.forEach((m, i) => {
    const xPos = 30 + i * 60;
    doc.setFontSize(8);
    doc.text(`${m.prenom} ${m.nom}`, xPos, ySig + 50, { align: 'center' });
    doc.line(xPos - 20, ySig + 40, xPos + 20, ySig + 40);
  });
  
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  const genDate = new Date().toLocaleDateString('fr-FR', { day: 'long', month: 'long', year: 'numeric' });
  doc.text(`Généré le ${genDate}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

  // PAGE 2 - KPIs COMMUNS
  doc.addPage();
  addHeader();
  
  doc.setFontSize(22);
  doc.setTextColor(26, 51, 83);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs d\'activité commune', margin, 30);
  
  doc.setFont('helvetica', 'normal');
  const kpis = [
    { label: 'Élèves suivis', value: data.stats.totalEleves, color: '#1A3353' },
    { label: 'Écoles', value: data.stats.totalEcoles, color: '#1E7A52' },
    { label: 'Nouvelles demandes', value: data.stats.nouvellesdemandes, color: '#B85C1A' },
    { label: 'Suivis clôturés', value: data.stats.suivisClotures, color: '#5B4FA4' },
    { label: 'Analyses réalisées', value: data.stats.analysesRealisees, color: '#D4A574' },
    { label: 'Entretiens familles', value: data.stats.entretiensfamilles, color: '#3B82C4' },
    { label: 'Participations ESS', value: data.stats.participationsESS, color: '#10B981' },
    { label: 'Orientations ext.', value: data.stats.orientationsExt, color: '#F59E0B' },
  ];
  
  let xKpi = margin;
  let yKpi = 45;
  kpis.forEach((kpi, i) => {
    if (i % 4 === 0 && i > 0) {
      yKpi += 25;
      xKpi = margin;
    }
    addKpiCard(xKpi, yKpi, kpi.label, kpi.value, kpi.color);
    xKpi += 40;
  });
  
  addFooter(2);

  // PAGE 3 - PSY EN EDA
  doc.addPage();
  addHeader();
  
  doc.setFillColor(...hexToRgb('#1A3353'));
  doc.rect(margin, 25, pageWidth - 2 * margin, 12, 'F');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Psychologue de l\'Éducation Nationale · Spécialité EDA', margin + 5, 33);
  
  const psyKpis = [
    { label: 'Entretiens élèves', value: data.stats.psy.entretiensEleves },
    { label: 'Observations classe', value: data.stats.psy.observationsClasse },
    { label: 'Bilans psycho.', value: data.stats.psy.bilansPsycho },
    { label: 'Analyses de situation', value: data.stats.psy.analysesED },
    { label: 'Comptes-rendus', value: data.stats.psy.comptesrendus },
    { label: 'Entretiens familles', value: data.stats.psy.entretiensConjoint },
    { label: 'Participations ESS', value: data.stats.psy.participationsESS },
    { label: 'Orientations MDPH', value: data.stats.psy.orientationsMDPH },
  ];
  
  let xPsy = margin;
  let yPsy = 50;
  psyKpis.forEach((kpi, i) => {
    if (i % 4 === 0 && i > 0) {
      yPsy += 25;
      xPsy = margin;
    }
    addKpiCard(xPsy, yPsy, kpi.label, kpi.value, '#1A3353');
    xPsy += 40;
  });
  
  addFooter(3);

  // PAGE 4 - MaDR
  doc.addPage();
  addHeader();
  
  doc.setFillColor(...hexToRgb('#1E7A52'));
  doc.rect(margin, 25, pageWidth - 2 * margin, 12, 'F');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Maître à Dominante Relationnelle (MaDR)', margin + 5, 33);
  
  const madrKpis = [
    { label: 'Élèves pris en charge', value: data.stats.madr.elevesEnCharge },
    { label: 'Séances rééducation', value: data.stats.madr.seancesReeducation },
    { label: 'Suivis individuels', value: data.stats.madr.suivisIndividuels },
    { label: 'Suivis en groupe', value: data.stats.madr.suivisGroupe },
    { label: 'Prises en charge clôturées', value: data.stats.madr.clotureees },
    { label: 'Entretiens familles', value: data.stats.madr.entretiensConjoint },
    { label: 'Liaisons enseignants', value: data.stats.madr.liaisonsEnseignants },
    { label: 'Orientations extérieures', value: data.stats.madr.orientations },
  ];
  
  let xMadr = margin;
  let yMadr = 50;
  madrKpis.forEach((kpi, i) => {
    if (i % 4 === 0 && i > 0) {
      yMadr += 25;
      xMadr = margin;
    }
    addKpiCard(xMadr, yMadr, kpi.label, kpi.value, '#1E7A52');
    xMadr += 40;
  });
  
  addFooter(4);

  // PAGE 5 - MaDP
  doc.addPage();
  addHeader();
  
  doc.setFillColor(...hexToRgb('#B85C1A'));
  doc.rect(margin, 25, pageWidth - 2 * margin, 12, 'F');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Maître à Dominante Pédagogique (MaDP)', margin + 5, 33);
  
  const madpKpis = [
    { label: 'Élèves accompagnés', value: data.stats.madp.elevesAccompagnes },
    { label: 'Séances d\'aide', value: data.stats.madp.seancesAide },
    { label: 'Suivis individuels', value: data.stats.madp.suivisIndividuels },
    { label: 'Suivis en groupe', value: data.stats.madp.suivisGroupe },
    { label: 'Prises en charge clôturées', value: data.stats.madp.clotureees },
    { label: 'Liaisons enseignants', value: data.stats.madp.liaisonsEnseignants },
    { label: 'Entretiens familles', value: data.stats.madp.entretiensConjoint },
    { label: 'Orientations extérieures', value: data.stats.madp.orientations },
  ];
  
  let xMadp = margin;
  let yMadp = 50;
  madpKpis.forEach((kpi, i) => {
    if (i % 4 === 0 && i > 0) {
      yMadp += 25;
      xMadp = margin;
    }
    addKpiCard(xMadp, yMadp, kpi.label, kpi.value, '#B85C1A');
    xMadp += 40;
  });
  
  addFooter(5);

  // PAGE 6 - SYNTHÈSE
  doc.addPage();
  addHeader();
  
  doc.setFontSize(22);
  doc.setTextColor(26, 51, 83);
  doc.setFont('helvetica', 'bold');
  doc.text('Synthèse comparative de l\'équipe', margin, 30);
  
  // Bloc signatures
  const ySynthSig = 220;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Signatures', margin, ySynthSig);
  
  const sigWidth = (pageWidth - 40) / 3;
  data.membres.forEach((m, i) => {
    const xSig = 20 + i * (sigWidth + 5);
    const color = COLORS[m.profession] || '#1A3353';
    
    doc.setFontSize(9);
    doc.setTextColor(...hexToRgb(color));
    doc.setFont('helvetica', 'bold');
    doc.text(`${m.prenom} ${m.nom}`, xSig + sigWidth / 2, ySynthSig + 15, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(getTitleForProfession(m.profession), xSig + sigWidth / 2, ySynthSig + 22, { align: 'center', maxWidth: sigWidth - 5 });
    
    doc.line(xSig, ySynthSig + 30, xSig + sigWidth - 5, ySynthSig + 30);
  });
  
  addFooter(6);

  return doc;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0];
}

function getTitleForProfession(profession) {
  const titles = {
    'Psy EN EDA': 'Psychologue de l\'Éducation Nationale\nSpécialité EDA',
    'MaDR': 'Maître à Dominante\nRelationnelle',
    'MaDP': 'Maître à Dominante\nPédagogique',
  };
  return titles[profession] || profession;
}