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
    const found = (domaines || []).find(x => x.name === d.name || (x.name === 'Développement' && d.name === 'Developpement'));
    return { name: d.name, value: found ? found.value : 0 };
  });

  const topItemsAll = topItems || [];
  const evolutionAll = evolution || [];

  const content = `
    <h1 style="color:#0C3B8C;font-size:22px;margin-bottom:4px;">Statistiques des Diagnostics RASED</h1>
    <p style="color:#666;font-size:11px;margin-bottom:20px;">
      Genere le ${new Date().toLocaleDateString('fr-FR')}
      ${selectedProfession ? ' — Filtre : ' + selectedProfession : ' — Ensemble de l\'equipe'}
    </p>

    <div style="display:flex;gap:20px;flex-wrap:wrap;margin-bottom:20px;">
      <div style="background:#f0f4ff;border-radius:8px;padding:12px 20px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#0C3B8C;">${nbEleves}</div>
        <div style="font-size:11px;color:#555;">Eleves suivis</div>
      </div>
      <div style="background:#f0f4ff;border-radius:8px;padding:12px 20px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#0C3B8C;">${nbDiagnostics}</div>
        <div style="font-size:11px;color:#555;">Diagnostics realises</div>
      </div>
      <div style="background:#f0f4ff;border-radius:8px;padding:12px 20px;text-align:center;">
        <div style="font-size:28px;font-weight:bold;color:#0C3B8C;">${nbItems}</div>
        <div style="font-size:11px;color:#555;">Items observes</div>
      </div>
    </div>

    <h2 style="color:#0C3B8C;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px;margin:20px 0 4px;">Repartition par domaine</h2>
    <p style="color:#555;font-size:11px;font-style:italic;margin-bottom:8px;padding:4px 8px;background:#f8f9ff;border-left:3px solid #b0c4e8;">
      Ce tableau indique, pour chaque grand domaine d'intervention, le nombre total d'items observes et leur part relative. Il permet d'identifier les domaines les plus sollicites par l'equipe RASED.
    </p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f0f4ff;"><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Domaine</th><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Observations</th><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Pourcentage</th></tr>
      ${allDomaines.map(d => `<tr><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${d.name}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${d.value}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${totalDomaines > 0 ? ((d.value / totalDomaines) * 100).toFixed(1) : 0}%</td></tr>`).join('')}
    </table>

    <h2 style="color:#0C3B8C;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px;margin:20px 0 4px;">Top 10 observations frequentes</h2>
    <p style="color:#555;font-size:11px;font-style:italic;margin-bottom:8px;padding:4px 8px;background:#f8f9ff;border-left:3px solid #b0c4e8;">
      Ce tableau liste les 10 items les plus souvent selectionnes lors des diagnostics. Il met en evidence les difficultes recurrentes et peut orienter les priorites d'action pedagogique ou d'accompagnement specialise.
    </p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f0f4ff;"><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">#</th><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Observation</th><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Occurrences</th></tr>
      ${topItemsAll.length > 0
        ? topItemsAll.map((item, i) => `<tr><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${i + 1}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${item.name}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;font-weight:bold;">${item.total}x</td></tr>`).join('')
        : '<tr><td colspan="3" style="padding:8px 10px;font-size:12px;color:#aaa;font-style:italic;">Aucune observation enregistree</td></tr>'
      }
    </table>

    <h2 style="color:#0C3B8C;font-size:15px;border-bottom:1px solid #ddd;padding-bottom:4px;margin:20px 0 4px;">Evolution mensuelle</h2>
    <p style="color:#555;font-size:11px;font-style:italic;margin-bottom:8px;padding:4px 8px;background:#f8f9ff;border-left:3px solid #b0c4e8;">
      Ce tableau retrace le nombre de diagnostics realises chaque mois sur les 12 derniers mois. Il permet de suivre l'activite de l'equipe dans le temps et de mesurer la progression du suivi des eleves au fil de l'annee scolaire.
    </p>
    <table style="width:100%;border-collapse:collapse;">
      <tr style="background:#f0f4ff;"><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Mois</th><th style="padding:6px 10px;text-align:left;font-size:12px;color:#0C3B8C;">Diagnostics</th></tr>
      ${evolutionAll.length > 0
        ? evolutionAll.map(m => `<tr><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${m.mois}</td><td style="padding:5px 10px;border-bottom:1px solid #eee;font-size:12px;">${m.total}</td></tr>`).join('')
        : '<tr><td colspan="2" style="padding:8px 10px;font-size:12px;color:#aaa;font-style:italic;">Aucune donnee mensuelle disponible</td></tr>'
      }
    </table>
  `;

  // Injecte le contenu dans la page courante et imprime
  const printDiv = document.createElement('div');
  printDiv.id = '__print_stats__';
  printDiv.style.display = 'none';
  printDiv.innerHTML = content;
  document.body.appendChild(printDiv);

  const style = document.createElement('style');
  style.id = '__print_style__';
  style.innerHTML = `
    @media print {
      body > *:not(#__print_stats__) { display: none !important; }
      #__print_stats__ { display: block !important; font-family: Arial, sans-serif; color: #111; margin: 16px; }
    }
  `;
  document.head.appendChild(style);

  window.print();

  // Nettoyage après impression
  setTimeout(() => {
    document.body.removeChild(printDiv);
    document.head.removeChild(style);
  }, 1000);
};