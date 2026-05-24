export const exportStatsPDF = (filteredDiagnostics, topItems, domaines, evolution, selectedProfession) => {
  const nbEleves = new Set(filteredDiagnostics.map(d => d.eleve_prenom + ' ' + d.eleve_nom)).size;
  const nbDiagnostics = filteredDiagnostics.length;
  let nbItems = 0;
  filteredDiagnostics.forEach(d => {
    ['apprentissages', 'comportement', 'developpement', 'contexte'].forEach(cat => {
      nbItems += (d.selections?.[cat] || []).length;
    });
  });

  const totalDomaines = (domaines || []).reduce((s, d) => s + d.value, 0);
  const allDomaines = [
    { name: 'Apprentissages' },
    { name: 'Comportement' },
    { name: 'Developpement' },
    { name: 'Contexte' },
  ].map(d => {
    const found = (domaines || []).find(x => x.name === d.name || x.name === 'Développement' && d.name === 'Developpement');
    return { name: d.name, value: found ? found.value : 0 };
  });

  const topItemsAll = (topItems || []).length > 0 ? topItems : [];
  const evolutionAll = (evolution || []).length > 0 ? evolution : [];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Statistiques RASED</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 32px; font-size: 13px; }
    h1 { color: #0C3B8C; font-size: 22px; margin-bottom: 4px; }
    h2 { color: #0C3B8C; font-size: 15px; margin: 24px 0 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    .meta { color: #666; font-size: 11px; margin-bottom: 24px; }
    .kpis { display: flex; gap: 24px; margin-bottom: 8px; flex-wrap: wrap; }
    .kpi { background: #f0f4ff; border-radius: 8px; padding: 12px 20px; text-align: center; }
    .kpi-val { font-size: 28px; font-weight: bold; color: #0C3B8C; }
    .kpi-label { font-size: 11px; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-top: 4px; }
    th { background: #f0f4ff; color: #0C3B8C; padding: 6px 10px; text-align: left; font-size: 12px; }
    td { padding: 5px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    .empty { color: #aaa; font-style: italic; font-size: 12px; padding: 8px 10px; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Statistiques des Diagnostics RASED</h1>
  <div class="meta">
    Genere le ${new Date().toLocaleDateString('fr-FR')}
    ${selectedProfession ? ' &mdash; Filtre : ' + selectedProfession : ''}
  </div>

  <div class="kpis">
    <div class="kpi"><div class="kpi-val">${nbEleves}</div><div class="kpi-label">Eleves suivis</div></div>
    <div class="kpi"><div class="kpi-val">${nbDiagnostics}</div><div class="kpi-label">Diagnostics</div></div>
    <div class="kpi"><div class="kpi-val">${nbItems}</div><div class="kpi-label">Items observes</div></div>
  </div>

  <h2>Repartition par domaine</h2>
  <table>
    <tr><th>Domaine</th><th>Observations</th><th>Pourcentage</th></tr>
    ${allDomaines.map(d => `<tr><td>${d.name}</td><td>${d.value}</td><td>${totalDomaines > 0 ? ((d.value / totalDomaines) * 100).toFixed(1) : 0}%</td></tr>`).join('')}
  </table>

  <h2>Top 10 observations frequentes</h2>
  <table>
    <tr><th>#</th><th>Observation</th><th>Occurrences</th></tr>
    ${topItemsAll.length > 0
      ? topItemsAll.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td><b>${item.total}x</b></td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">Aucune observation enregistree</td></tr>'
    }
  </table>

  <h2>Evolution mensuelle</h2>
  <table>
    <tr><th>Mois</th><th>Diagnostics</th></tr>
    ${evolutionAll.length > 0
      ? evolutionAll.map(m => `<tr><td>${m.mois}</td><td>${m.total}</td></tr>`).join('')
      : '<tr><td colspan="2" class="empty">Aucune donnee mensuelle</td></tr>'
    }
  </table>
</body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  document.body.appendChild(iframe);

  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();

  iframe.onload = () => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(() => document.body.removeChild(iframe), 2000);
  };
};