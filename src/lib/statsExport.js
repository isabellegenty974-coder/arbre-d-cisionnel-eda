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
  const allDomaines = ['Apprentissages', 'Comportement', 'Développement', 'Contexte'].map(name => {
    const found = (domaines || []).find(x => x.name === name);
    return { name, value: found ? found.value : 0 };
  });

  const topItemsAll = topItems || [];
  const evolutionAll = evolution || [];

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Statistiques RASED</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 32px; font-size: 13px; }
    h1 { color: #0C3B8C; font-size: 22px; margin-bottom: 4px; }
    h2 { color: #0C3B8C; font-size: 15px; margin: 24px 0 4px; border-bottom: 2px solid #dde3f5; padding-bottom: 4px; }
    .meta { color: #666; font-size: 11px; margin-bottom: 20px; }
    .comment { color: #444; font-size: 11px; font-style: italic; margin-bottom: 10px; padding: 6px 10px; background: #f4f7ff; border-left: 3px solid #7fa8e8; border-radius: 2px; }
    .kpis { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
    .kpi { background: #f0f4ff; border-radius: 8px; padding: 12px 20px; text-align: center; border: 1px solid #dde3f5; }
    .kpi-val { font-size: 28px; font-weight: bold; color: #0C3B8C; }
    .kpi-label { font-size: 11px; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
    th { background: #eef2ff; color: #0C3B8C; padding: 7px 10px; text-align: left; font-size: 12px; border-bottom: 2px solid #c7d4f0; }
    td { padding: 6px 10px; border-bottom: 1px solid #eee; font-size: 12px; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #fafbff; }
    .empty { color: #aaa; font-style: italic; }
  </style>
</head>
<body>
  <h1>Statistiques des Diagnostics RASED</h1>
  <p class="meta">
    Généré le ${new Date().toLocaleDateString('fr-FR')}
    ${selectedProfession ? ' — Filtre : ' + selectedProfession : ' — Ensemble de l\'équipe'}
  </p>

  <div class="kpis">
    <div class="kpi"><div class="kpi-val">${nbEleves}</div><div class="kpi-label">Élèves suivis</div></div>
    <div class="kpi"><div class="kpi-val">${nbDiagnostics}</div><div class="kpi-label">Diagnostics réalisés</div></div>
    <div class="kpi"><div class="kpi-val">${nbItems}</div><div class="kpi-label">Items observés</div></div>
  </div>

  <h2>Répartition par domaine</h2>
  <p class="comment">Ce tableau indique, pour chaque grand domaine d'intervention (Apprentissages, Comportement, Développement, Contexte), le nombre total d'items observés et leur part relative. Il permet d'identifier les domaines les plus sollicités par l'équipe RASED sur la période analysée.</p>
  <table>
    <tr><th>Domaine</th><th>Observations</th><th>Pourcentage</th></tr>
    ${allDomaines.map(d => `<tr><td>${d.name}</td><td>${d.value}</td><td>${totalDomaines > 0 ? ((d.value / totalDomaines) * 100).toFixed(1) : 0}%</td></tr>`).join('')}
  </table>

  <h2>Top 10 des observations fréquentes</h2>
  <p class="comment">Ce tableau liste les 10 items les plus souvent sélectionnés lors des diagnostics. Il met en évidence les difficultés récurrentes rencontrées par les élèves suivis et peut orienter les priorités d'action pédagogique ou d'accompagnement spécialisé.</p>
  <table>
    <tr><th>#</th><th>Observation</th><th>Occurrences</th></tr>
    ${topItemsAll.length > 0
      ? topItemsAll.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td><b>${item.total}×</b></td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">Aucune observation enregistrée</td></tr>'
    }
  </table>

  <h2>Évolution mensuelle</h2>
  <p class="comment">Ce tableau retrace le nombre de diagnostics réalisés chaque mois sur les 12 derniers mois. Il permet de suivre l'activité de l'équipe dans le temps, d'identifier les périodes de forte mobilisation et de mesurer la progression du suivi des élèves au fil de l'année scolaire.</p>
  <table>
    <tr><th>Mois</th><th>Diagnostics réalisés</th></tr>
    ${evolutionAll.length > 0
      ? evolutionAll.map(m => `<tr><td>${m.mois}</td><td>${m.total}</td></tr>`).join('')
      : '<tr><td colspan="2" class="empty">Aucune donnée mensuelle disponible</td></tr>'
    }
  </table>

  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const newWin = window.open('', '_blank');
  if (newWin) {
    newWin.document.write(html);
    newWin.document.close();
  } else {
    alert("Veuillez autoriser les popups pour exporter le PDF.");
  }
};