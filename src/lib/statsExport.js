export const exportStatsPDF = (filteredDiagnostics, topItems, domaines, evolution, selectedProfession, profBreakdown, ecoleBreakdown, parEcoleStats) => {
  const nbEleves = new Set(filteredDiagnostics.map(d => d.eleve_prenom + ' ' + d.eleve_nom)).size;
  const nbInterventions = filteredDiagnostics.length;
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
  const profData = profBreakdown || [];
  const ecoleData = ecoleBreakdown || [];
  const ecoleStats = parEcoleStats || [];
  const totalProf = profData.reduce((s, p) => s + p.value, 0);

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Bilan d'activité RASED</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; margin: 32px; font-size: 13px; }
    h1 { color: #0C3B8C; font-size: 22px; margin-bottom: 4px; }
    h2 { color: #0C3B8C; font-size: 15px; margin: 28px 0 4px; border-bottom: 2px solid #dde3f5; padding-bottom: 4px; }
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
    .school-block { margin-bottom: 16px; padding: 10px 14px; border: 1px solid #dde3f5; border-radius: 6px; background: #fafbff; }
    .school-title { font-weight: bold; color: #0C3B8C; font-size: 13px; margin-bottom: 6px; }
    .school-table th { background: #e8edf8; }
    @media print { body { margin: 16px; } }
  </style>
</head>
<body>
  <h1>Bilan d'activité RASED</h1>
  <p class="meta">
    Généré le ${new Date().toLocaleDateString('fr-FR')}
    ${selectedProfession ? ' — Professionnel : ' + selectedProfession : ' — Ensemble de l\'équipe'}
  </p>

  <div class="kpis">
    <div class="kpi"><div class="kpi-val">${nbEleves}</div><div class="kpi-label">Élèves accompagnés</div></div>
    <div class="kpi"><div class="kpi-val">${nbInterventions}</div><div class="kpi-label">Interventions réalisées</div></div>
    <div class="kpi"><div class="kpi-val">${nbItems}</div><div class="kpi-label">Difficultés repérées</div></div>
  </div>

  <h2>Domaines de difficultés des élèves</h2>
  <p class="comment">Ce tableau présente la répartition des difficultés repérées par domaine d'intervention RASED. Il permet d'identifier quelles catégories de besoins sont les plus fréquentes chez les élèves accompagnés sur la période, et d'orienter les priorités de l'équipe.</p>
  <table>
    <tr><th>Domaine</th><th>Difficultés repérées</th><th>Part (%)</th></tr>
    ${allDomaines.map(d => `<tr><td>${d.name}</td><td>${d.value}</td><td>${totalDomaines > 0 ? ((d.value / totalDomaines) * 100).toFixed(1) : 0}%</td></tr>`).join('')}
  </table>

  <h2>Activité par professionnel RASED</h2>
  <p class="comment">Ce tableau indique le nombre d'interventions réalisées par chaque catégorie de professionnel RASED (MaDP, MaDR, Psy EN EDA). Il permet de visualiser la contribution de chaque membre de l'équipe et d'évaluer l'équilibre de la charge d'accompagnement.</p>
  <table>
    <tr><th>Profession</th><th>Interventions</th><th>Part (%)</th></tr>
    ${profData.length > 0
      ? [...profData].sort((a,b) => b.value - a.value).map(p => `<tr><td>${p.name}</td><td>${p.value}</td><td>${totalProf > 0 ? ((p.value / totalProf) * 100).toFixed(1) : 0}%</td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">Aucune donnée disponible</td></tr>'
    }
  </table>

  <h2>Élèves accompagnés par école</h2>
  <p class="comment">Ce tableau présente le nombre d'élèves accompagnés par le RASED dans chaque établissement scolaire. Il offre une vue d'ensemble de la couverture territoriale de l'équipe et permet d'identifier les écoles les plus demandeuses d'accompagnement.</p>
  <table>
    <tr><th>École</th><th>Élèves accompagnés</th></tr>
    ${ecoleData.length > 0
      ? ecoleData.map(e => `<tr><td>${e.name}</td><td>${e.value}</td></tr>`).join('')
      : '<tr><td colspan="2" class="empty">Aucune école renseignée</td></tr>'
    }
  </table>

  <h2>Détail de l'activité RASED par école</h2>
  <p class="comment">Pour chaque école, ce tableau détaille les types de difficultés identifiées chez les élèves accompagnés, ainsi que les interventions réalisées par chaque professionnel RASED. Il permet de croiser les besoins de chaque établissement avec les ressources mobilisées sur le terrain.</p>
  ${ecoleStats.length > 0
    ? ecoleStats.map(({ ecole, nbEleves: nb, domaines: doms, profs }) => `
      <div class="school-block">
        <div class="school-title">📍 ${ecole} — ${nb} élève${nb > 1 ? 's' : ''} accompagné${nb > 1 ? 's' : ''}</div>
        <table class="school-table">
          <tr><th>Domaine de difficulté</th><th>Élèves concernés</th></tr>
          ${doms.map(d => `<tr><td>${d.name}</td><td>${d.value}</td></tr>`).join('')}
        </table>
        ${profs.length > 0 ? `
        <table class="school-table" style="margin-top:8px;">
          <tr><th>Intervenant RASED</th><th>Élèves suivis</th></tr>
          ${profs.map(p => `<tr><td>${p.prof}</td><td>${p.nb}</td></tr>`).join('')}
        </table>` : ''}
      </div>
    `).join('')
    : '<p class="empty">Aucune donnée disponible</p>'
  }

  <h2>Difficultés les plus fréquemment repérées</h2>
  <p class="comment">Ce tableau liste les 10 indicateurs de difficulté les plus souvent relevés lors des accompagnements. Il met en lumière les problématiques récurrentes chez les élèves suivis et peut guider les actions de prévention ou de remédiation de l'équipe RASED.</p>
  <table>
    <tr><th>#</th><th>Difficulté repérée</th><th>Fréquence</th></tr>
    ${topItemsAll.length > 0
      ? topItemsAll.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td><b>${item.total}×</b></td></tr>`).join('')
      : '<tr><td colspan="3" class="empty">Aucune observation enregistrée</td></tr>'
    }
  </table>

  <h2>Évolution mensuelle de l'activité</h2>
  <p class="comment">Ce tableau retrace le nombre d'interventions réalisées chaque mois sur les 12 derniers mois. Il permet de suivre la dynamique d'activité de l'équipe RASED, d'identifier les périodes de forte sollicitation et d'analyser l'évolution du volume d'accompagnement au fil de l'année scolaire.</p>
  <table>
    <tr><th>Mois</th><th>Interventions réalisées</th></tr>
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