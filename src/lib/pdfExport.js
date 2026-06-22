import jsPDF from 'jspdf';
import { analyseEDA } from './analyseEDA';

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeDoc() {
  const doc = new jsPDF();
  let y = 20;
  const margin = 15;
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const maxW = pageW - 2 * margin;

  const checkBreak = (h = 20) => {
    if (y + h > pageH - 15) { doc.addPage(); y = 20; }
  };

  const section = (title) => {
    checkBreak(18);
    // Accent bar
    doc.setFillColor(74, 144, 226);
    doc.rect(margin, y - 1, 3, 8, 'F');
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(26, 26, 26);
    doc.text(title, margin + 6, y + 6);
    y += 14;
  };

  const line = (text, indent = 0, size = 9, bold = false) => {
    checkBreak(8);
    doc.setFontSize(size);
    doc.setFont(undefined, bold ? 'bold' : 'normal');
    doc.setTextColor(60, 60, 60);
    const wrapped = doc.splitTextToSize(text, maxW - indent);
    doc.text(wrapped, margin + indent, y);
    y += wrapped.length * (size * 0.45) + 2;
  };

  const bullet = (text, indent = 5) => {
    checkBreak(8);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(60, 60, 60);
    const wrapped = doc.splitTextToSize(`• ${text}`, maxW - indent - 4);
    doc.text(wrapped, margin + indent, y);
    y += wrapped.length * 4.5 + 2;
  };

  const divider = () => {
    checkBreak(6);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  };

  const getY = () => y;
  const setY = (val) => { y = val; };

  return { doc, section, line, bullet, divider, checkBreak, getY, setY, margin, maxW };
}

// ─── Header ────────────────────────────────────────────────────────────────

function addHeader(ctx, title) {
  const { doc, margin } = ctx;
  // Top banner
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 28, 'F');
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(title, margin, 18);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, margin, 24);
  ctx.setY(38);
}

// ─── Exports ───────────────────────────────────────────────────────────────

/** Export complet : hypothèses + recommandations + stats annuelles */
export function exportFullPDF(eleve, selections, crossRecommendations, diagnosticsAll = []) {
  const ctx = makeDoc();
  const { doc, section, line, bullet, divider } = ctx;

  addHeader(ctx, 'SUIVIS RASED — RAPPORT COMPLET');

  // 1. Infos élève
  if (eleve?.nom || eleve?.prenom) {
    section('Informations élève');
    if (eleve.prenom || eleve.nom) line(`${eleve.prenom || ''} ${eleve.nom || ''}`.trim(), 0, 10, true);
    if (eleve.age)    line(`Âge : ${eleve.age} ans`);
    if (eleve.classe) line(`Classe : ${eleve.classe}`);
    divider();
  }

  // 2. Hypothèses (analyseEDA automatique)
  const reponsesQCM = {};
  Object.values(selections).forEach((items) => {
    items.forEach((item) => {
      if (item.questionId) {
        const m = item.questionId.match(/^(q\d+)([a-d])$/);
        if (m) reponsesQCM[m[1]] = m[2];
      }
    });
  });
  const { hypotheses, scores } = analyseEDA(reponsesQCM);

  section('Hypothèses diagnostiques');
  if (hypotheses.length === 0) {
    line('Aucune hypothèse automatique générée.', 5);
  } else {
    hypotheses.forEach((h) => bullet(h));
  }
  divider();

  // 3. Sélections manuelles
  const hasSelections = Object.values(selections).some(a => a.length > 0);
  if (hasSelections) {
    section('Sélections diagnostiques');
    Object.entries(selections).forEach(([cat, items]) => {
      if (!items.length) return;
      line(cat.charAt(0).toUpperCase() + cat.slice(1), 0, 9, true);
      items.forEach((item) => bullet(item.label, 8));
    });
    divider();
  }

  // 4. Recommandations croisées
  if (Object.keys(crossRecommendations).length > 0) {
    section('Recommandations croisées');
    Object.entries(crossRecommendations).forEach(([qId, reason]) => {
      line(qId.toUpperCase(), 0, 9, true);
      bullet(reason, 8);
    });
    divider();
  }

  // 5. Scores par domaine
  if (Object.keys(scores).length > 0) {
    section('Scores par domaine');
    Object.entries(scores).forEach(([cat, score]) => {
      line(`${cat.charAt(0).toUpperCase() + cat.slice(1)} : ${score} point${score > 1 ? 's' : ''}`, 5);
    });
    divider();
  }

  // 6. Stats annuelles (si fourni)
  if (diagnosticsAll.length > 0) {
    section('Statistiques annuelles');
    line(`Total diagnostics : ${diagnosticsAll.length}`, 5);

    // Comptage par catégorie
    const catCounts = {};
    diagnosticsAll.forEach((d) => {
      Object.entries(d.selections || {}).forEach(([cat, items]) => {
        if (Array.isArray(items) && items.length) {
          catCounts[cat] = (catCounts[cat] || 0) + items.length;
        }
      });
    });
    if (Object.keys(catCounts).length > 0) {
      line('Hypothèses par catégorie :', 5, 9, true);
      Object.entries(catCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, count]) => bullet(`${cat} : ${count}`, 8));
    }
    divider();
  }

  doc.save(`rapport_EDA_${eleve?.nom || 'eleve'}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/** Export résumé simple (rétrocompatible) */
export const exportResumePDF = (eleve, selections, crossRecommendations) => {
  exportFullPDF(eleve, selections, crossRecommendations, []);
};

/** Export rapport annuel EDA depuis HistoriqueEDA */
export function exportAnnuelPDF({ data, nbEleves, hypCounts, monthly }) {
  const ctx = makeDoc();
  const { doc, section, line, bullet, divider } = ctx;

  addHeader(ctx, 'SUIVIS RASED — RAPPORT ANNUEL');

  // 1. Vue d'ensemble
  section('Vue d\'ensemble');
  line(`Nombre d'élèves évalués : ${nbEleves}`, 5);
  line(`Total d'évaluations : ${data.length}`, 5);
  divider();

  // 2. Stats hypothèses
  section('Répartition des hypothèses');
  const sortedHyp = Object.entries(hypCounts).sort((a, b) => b[1] - a[1]);
  if (sortedHyp.length === 0) {
    line('Aucune hypothèse enregistrée.', 5);
  } else {
    sortedHyp.forEach(([h, count]) => bullet(`${h} : ${count} fois`, 5));
  }
  divider();

  // 3. Stats mensuelles
  section('Évaluations mensuelles');
  const sortedMonths = Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
  if (sortedMonths.length === 0) {
    line('Aucune donnée mensuelle.', 5);
  } else {
    sortedMonths.forEach(([m, count]) => bullet(`${m} : ${count} évaluation${count > 1 ? 's' : ''}`, 5));
  }
  divider();

  doc.save(`rapport_annuel_EDA_${new Date().toISOString().split('T')[0]}.pdf`);
}