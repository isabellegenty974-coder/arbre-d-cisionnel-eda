import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Save, FileText, X, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import RapportContent from "@/components/RapportContent";
import SaveDiagnosticButton from "@/components/SaveDiagnosticButton";

const CATEGORIES = [
  {
    key: "apprentissages",
    label: "📚 Apprentissages",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100 text-blue-800",
    groups: [
      {
        label: "Lecture",
        items: [
          { label: "Décodage lent et laborieux", desc: "Lecture très lente, peu d'automatisation malgré l'entraînement" },
          { label: "Confusions et inversions de lettres", desc: "Confusions visuelles (b/d, p/q) ou auditives (f/v, ch/j)" },
          { label: "Lecture non fluide", desc: "Résistance aux apprentissages phonémiques, signe d'alerte fort" },
          { label: "Difficultés de compréhension", desc: "Peine à saisir le sens d'un texte, la chronologie ou l'implicite" },
        ],
      },
      {
        label: "Écriture",
        items: [
          { label: "Graphisme illisible", desc: "Tracé chaotique, lettres irrégulières, perte de lisibilité" },
          { label: "Écriture lente et fatigante", desc: "Coût moteur élevé, fatigue rapide, plaintes physiques" },
          { label: "Orthographe très atteinte", desc: "Erreurs massives, mots outils jamais mémorisés" },
        ],
      },
      {
        label: "Mathématiques",
        items: [
          { label: "Difficultés en calcul / numération", desc: "Compétences numériques fragiles, opérations élémentaires" },
          { label: "Difficultés en résolution de problèmes", desc: "Incompréhension de l'énoncé, absence de stratégie" },
        ],
      },
      {
        label: "Transversal",
        items: [
          { label: "Lenteur généralisée", desc: "Travail rarement terminé, rythme très inférieur à la classe" },
          { label: "Difficultés de mémorisation", desc: "Oubli rapide des leçons, tables non retenues" },
        ],
      },
    ],
  },
  {
    key: "comportement",
    label: "💝 Comportement",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-100 text-rose-800",
    groups: [
      {
        label: "Attention / Inhibition",
        items: [
          { label: "Décrochage attentionnel rapide", desc: "Perd le fil après quelques minutes, déconnexion fréquente" },
          { label: "Hypersensibilité aux distracteurs", desc: "Tout stimulus extérieur (bruit, mouvement) capte l'attention" },
          { label: "Oubli des consignes en cours de tâche", desc: "Oublie ce qu'il devait faire après 2-3 étapes" },
          { label: "Déficit d'inhibition", desc: "Peine à stopper une réponse automatique, difficultés à respecter les règles" },
        ],
      },
      {
        label: "Impulsivité / Hyperactivité",
        items: [
          { label: "Agitation motrice permanente", desc: "Se lève sans permission, besoin constant de bouger" },
          { label: "Impulsivité verbale", desc: "Répond avant la fin de la question, coupe la parole" },
          { label: "Impulsivité motrice", desc: "Agit avant de réfléchir, touche les affaires des autres" },
          { label: "Incapacité à attendre son tour", desc: "Frustration immédiate, tensions en jeux collectifs" },
        ],
      },
      {
        label: "Anxiété / Émotions",
        items: [
          { label: "Anxiété scolaire", desc: "Peurs des évaluations, exposés oraux, panique en performance" },
          { label: "Somatisations régulières", desc: "Maux de ventre ou de tête le matin ou avant un contrôle" },
          { label: "Refus ou évitement scolaire", desc: "Résistance à l'école, pleurs le matin" },
          { label: "Crises de colère disproportionnées", desc: "Explosions de rage pour frustration minime, durée longue" },
          { label: "Opposition aux règles", desc: "Refuse régulièrement les consignes, résistance active" },
        ],
      },
      {
        label: "Estime de soi",
        items: [
          { label: "Manque de confiance en soi", desc: "Auto-dénigrement : \"je suis nul(le)\", \"j'y arriverai pas\"" },
          { label: "Hypersensibilité au jugement", desc: "Rougit, se fige, refuse l'oral par peur d'être jugé" },
          { label: "Évitement des mises en valeur", desc: "Ne lève jamais la main même en connaissant la réponse" },
          { label: "Découragement rapide", desc: "Abandonne dès le premier obstacle, résignation apprise" },
        ],
      },
    ],
  },
  {
    key: "developpement",
    label: "🌱 Développement",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-100 text-emerald-800",
    groups: [
      {
        label: "Langage oral",
        items: [
          { label: "Retard de langage oral", desc: "Vocabulaire limité, phrases courtes, syntaxe incorrecte" },
          { label: "Difficultés de compréhension orale", desc: "Peine à suivre les consignes, demande souvent de répéter" },
        ],
      },
      {
        label: "Motricité",
        items: [
          { label: "Maladresse globale / équilibre", desc: "Chutes fréquentes, difficultés d'équilibre en EPS" },
          { label: "Difficultés motrices fines", desc: "Prise du crayon difficile, découpage imprécis" },
        ],
      },
      {
        label: "Interactions sociales",
        items: [
          { label: "Difficultés d'interactions sociales", desc: "Peu d'amis, jeux solitaires, ne comprend pas les codes sociaux" },
          { label: "Comportements répétitifs / routines rigides", desc: "Rituels, intérêts très focalisés, résistance aux changements" },
        ],
      },
      {
        label: "Fonctions cognitives",
        items: [
          { label: "Mémoire de travail fragile", desc: "Oublie en cours d'exercice, ne retient pas plusieurs infos" },
          { label: "Troubles sensoriels", desc: "Réactions excessives au bruit, toucher, lumière ou odeurs" },
        ],
      },
    ],
  },
  {
    key: "contexte",
    label: "🏠 Contexte",
    color: "bg-amber-50 border-amber-200",
    headerColor: "bg-amber-100 text-amber-800",
    groups: [
      {
        label: "Famille",
        items: [
          { label: "Environnement familial difficile", desc: "Conflits parentaux, instabilité affective, manque de suivi" },
          { label: "Changement récent majeur", desc: "Déménagement, séparation parentale, deuil récent" },
          { label: "Événement traumatisant", desc: "Accident, violence, deuil engendrant stress émotionnel" },
          { label: "Précarité sociale", desc: "Conditions de vie difficiles impactant la disponibilité" },
        ],
      },
      {
        label: "Environnement scolaire",
        items: [
          { label: "Mauvais climat de classe", desc: "Moqueries, harcèlement, tensions relationnelles" },
          { label: "Absentéisme fréquent", desc: "Nombreuses absences entraînant des lacunes importantes" },
          { label: "Changement d'école ou d'enseignant", desc: "Rupture récente, adaptation difficile" },
        ],
      },
      {
        label: "Autres facteurs",
        items: [
          { label: "Barrière linguistique", desc: "Langue de la maison différente du français" },
          { label: "Manque de stimulation", desc: "Pas de soutien aux devoirs, peu d'échanges verbaux" },
          { label: "Troubles de santé récurrents", desc: "Maladies fréquentes, problèmes auditifs/visuels non corrigés" },
        ],
      },
    ],
  },
];

export default function DiagnosticEleve() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const eleveId = urlParams.get("id");

  const [eleve, setEleve] = useState(null);
  const [checked, setChecked] = useState({});
  const [activeTab, setActiveTab] = useState('apprentissages');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rapport, setRapport] = useState(null);
  const [generatedRapport, setGeneratedRapport] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && rapport) {
        setRapport(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rapport]);

  useEffect(() => {
    if (eleveId) {
      base44.entities.FicheEleve.get(eleveId).then(data => {
        setEleve(data);
        // Stocker le ficheId dans le contexte pour SaveDiagnosticButton
        // On enrichit l'objet eleve avec ficheId via DiagnosticContext si disponible
      });
    } else {
      const prenom = urlParams.get('prenom') || '';
      const nom = urlParams.get('nom') || '';
      const age = urlParams.get('age');
      const classe = urlParams.get('classe') || '';
      if (prenom || nom) setEleve({ prenom, nom, age: age ? Number(age) : undefined, classe });
    }
  }, [eleveId]);

  const toggle = (catKey, item) => {
    setChecked(prev => {
      const current = prev[catKey] || [];
      const exists = current.includes(item.label);
      return { ...prev, [catKey]: exists ? current.filter(i => i !== item.label) : [...current, item.label] };
    });
  };

  const totalItems = Object.values(checked).reduce((acc, arr) => acc + arr.length, 0);
  const totalDomains = Object.values(checked).filter(arr => arr && arr.length > 0).length;
  const hasSelections = totalItems > 0;

  const handleGenerateRapport = async () => {
    setGenerating(true);
    try {
      let examinerName = 'N/A';
      try {
        const user = await base44.auth.me();
        examinerName = user?.full_name || 'N/A';
      } catch (e) {}

      const dateStr = new Date().toLocaleDateString('fr-FR');
      const lignes = [];
      CATEGORIES.forEach(cat => {
        const items = checked[cat.key] || [];
        if (items.length > 0) {
          lignes.push(`- ${cat.label} : ${items.join(' ; ')}`);
        }
      });

      const prompt = [
        "Tu es un psychologue scolaire spécialisé (RASED). Rédige un rapport d'observation clinique structuré, professionnel et bienveillant.",
        "",
        `ÉLÈVE : ${eleve?.prenom || 'N/A'} ${eleve?.nom || 'N/A'} | Âge : ${eleve?.age || 'N/A'} ans | Classe : ${eleve?.classe || 'N/A'}`,
        `Date : ${dateStr} | Examinateur : ${examinerName}`,
        "",
        "OBSERVATIONS RECUEILLIES :",
        ...lignes,
        "",
        "Rédige le rapport en 4 parties avec ces titres exacts en gras :",
        "",
        "**1. Synthèse clinique des observations**",
        "Articule les observations de manière fluide et professionnelle. Montre les liens entre les domaines si plusieurs sont concernés. Utilise 'l'élève' (jamais 'le patient'). Sois précis mais non stigmatisant.",
        "",
        "**2. Hypothèses de travail**",
        "Propose 2 à 4 hypothèses hiérarchisées (de la plus probable à la moins probable). Pour chaque hypothèse : nom clinique précis, justification courte basée sur les observations, niveau de probabilité (élevée / modérée / à explorer). Ne pose pas de diagnostic définitif.",
        "",
        "**3. Orientations d'évaluation complémentaire**",
        "Propose des bilans spécifiques à réaliser (orthophonique, psychomoteur, neuropsychologique, ophtalmologique, ORL, médical…) directement justifiés par les hypothèses. Sois précis et actionnable.",
        "",
        "**4. Préconisations et aménagements**",
        "Liste les aménagements pédagogiques, adaptations en classe et accompagnements à mettre en place à court et moyen terme (enseignant, famille, équipe RASED). Formule des préconisations concrètes et réalistes.",
      ].join('\n');

      const result = await base44.integrations.Core.InvokeLLM({ prompt, model: 'claude_sonnet_4_6' });
      setRapport(result);
      setGeneratedRapport(result);

      if (eleveId) {
        try {
          await base44.entities.FicheEleve.update(eleveId, { rapport: result });
        } catch (err) {
          console.error('Erreur sauvegarde rapport FicheEleve:', err);
        }
      }
    } catch (err) {
      console.error(err);
      setRapport("Une erreur est survenue lors de la génération du rapport.");
    } finally {
      setGenerating(false);
    }
  };

  const generatePdf = async () => {
    const norm = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const doc = new jsPDF();
    const name = norm(`${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim());
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Rapport - Hypothèses de travail', 15, 20);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    if (name) doc.text(`Eleve : ${name}`, 15, 30);
    if (eleve?.classe) doc.text(`Classe : ${norm(eleve.classe)}`, 15, 37);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 15, eleve?.classe ? 44 : 37);
    const lines = doc.splitTextToSize(norm(rapport), 180);
    doc.setFontSize(10);
    doc.text(lines, 15, eleve?.classe ? 54 : 47);
    return doc.output('arraybuffer');
  };

  const handleSave = async () => {
    setSaving(true);
    const selections = {};
    CATEGORIES.forEach(cat => { selections[cat.key] = checked[cat.key] || []; });

    let rapportPdfUrl = '';
    if (rapport) {
      try {
        const pdfBuffer = await generatePdf();
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
        const file = new File([blob], `rapport_${eleve?.nom || 'eleve'}.pdf`, { type: 'application/pdf' });
        const result = await base44.integrations.Core.UploadFile({ file });
        rapportPdfUrl = result.file_url;
      } catch (err) {
        console.error('Erreur upload PDF:', err);
      }
    }

    await base44.entities.Diagnostic.create({
      eleve_nom: eleve?.nom || "",
      eleve_prenom: eleve?.prenom || "",
      eleve_age: eleve?.age,
      eleve_classe: eleve?.classe || "",
      selections,
      rapport: generatedRapport || "",
      rapport_pdf_url: rapportPdfUrl,
      statut: "complète",
    });

    if (eleveId && generatedRapport) {
      try {
        await base44.entities.FicheEleve.update(eleveId, { rapport: generatedRapport });
      } catch (err) {
        console.error('Erreur mise à jour fiche élève:', err);
      }
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate(`/dashboard?ficheId=${eleveId}`), 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAFAF8] to-[#F5F0E8] pb-20">
      <HamburgerMenu />
      <ScreenLayout
        title={`Suivi de l'élève`}
        subtitle={eleve ? `${eleve.prenom} ${eleve.nom}${eleve.classe ? ` — ${eleve.classe}` : ""}` : ""}
      >
        {/* Barre de progression */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-white border border-[#D4A574]/20 shadow-soft"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-[#0F172A]">Observation</p>
            <p className="text-sm font-bold text-[#D4A574]">
              {hasSelections ? "1 observation" : "0 observation"}
              {totalItems > 0 && <span className="text-[#D4A574]/70 font-normal"> — {totalItems} item{totalItems > 1 ? "s" : ""} dans {totalDomains} domaine{totalDomains > 1 ? "s" : ""}</span>}
            </p>
          </div>
          <div className="w-full bg-[#D4A574]/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-[#D4A574] to-[#D4A574]/70 h-2 rounded-full transition-all" style={{width: hasSelections ? '100%' : '0%'}}></div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Onglets */}
          <div className="flex gap-2 overflow-x-auto pb-3 border-b-2 border-[#D4A574]/10">
            {CATEGORIES.map(cat => {
              const catChecked = checked[cat.key] || [];
              const isActive = activeTab === cat.key;
              return (
                <motion.button
                  key={cat.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(cat.key)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? `${cat.headerColor} shadow-soft scale-105`
                      : "bg-white/40 hover:bg-white/60 text-foreground border border-transparent"
                  }`}
                >
                  {cat.label}
                  {catChecked.length > 0 && (
                    <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/30" : "bg-[#D4A574]/20 text-[#D4A574]"
                    }`}>
                      {catChecked.length}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Contenu de l'onglet actif */}
          <AnimatePresence mode="wait">
            {CATEGORIES.map((cat) => {
              if (activeTab !== cat.key) return null;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {cat.groups.map((group, gIdx) => (
                    <div key={group.label}>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">{group.label}</p>
                      <div className="space-y-2">
                        {group.items.map((item, idx) => {
                          const isChecked = (checked[cat.key] || []).includes(item.label);
                          return (
                            <motion.label
                              key={item.label}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (gIdx * 0.05) + idx * 0.03 }}
                              className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer border transition-all ${
                                isChecked
                                  ? "bg-white border-[#D4A574]/40 shadow-soft"
                                  : "bg-white/50 border-transparent hover:bg-white hover:border-[#D4A574]/20"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggle(cat.key, item)}
                                className="mt-1 w-5 h-5 rounded shrink-0 cursor-pointer accent-[#D4A574]"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold leading-snug ${
                                  isChecked ? "text-[#0F172A]" : "text-foreground/80"
                                }`}>
                                  {item.label}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                              {isChecked && (
                                <div className="shrink-0 w-5 h-5 rounded-full bg-[#D4A574]/20 flex items-center justify-center mt-0.5">
                                  <span className="text-xs font-bold text-[#D4A574]">✓</span>
                                </div>
                              )}
                            </motion.label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-3 sticky bottom-0 pt-6 bg-gradient-to-t from-[#F5F0E8] from-80% to-transparent -mx-6 px-6 pb-4"
        >
          <Button
            onClick={handleGenerateRapport}
            disabled={!hasSelections || generating}
            variant="outline"
            className="w-full h-11 gap-2 border-2 border-[#D4A574] text-[#D4A574] hover:bg-[#D4A574]/5 font-semibold rounded-lg"
          >
            <FileText className="w-5 h-5" />
            {generating ? (
              <><span className="animate-spin">⟳</span> Génération en cours...</>
            ) : (
              "Générer le rapport"
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasSelections || saving || saved}
            className={`w-full h-11 gap-2 font-semibold rounded-lg shadow-soft transition-all ${
              saved 
                ? "bg-chart-2 hover:bg-chart-2/90" 
                : "bg-[#D4A574] hover:bg-[#C49464]"
            }`}
          >
            <Save className="w-5 h-5" />
            {saved ? "✓ Hypothèses enregistrées !" : saving ? "Enregistrement..." : `Enregistrer les hypothèses`}
          </Button>
        </motion.div>
      </ScreenLayout>

      {/* Rapport Modal */}
      <AnimatePresence>
        {rapport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setRapport(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[85vh] flex flex-col shadow-soft-lg"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                <h2 className="font-display font-semibold text-lg">📋 Rapport — {eleve?.prenom} {eleve?.nom}</h2>
                <button onClick={() => setRapport(null)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto px-6 py-5 flex-1">
                <RapportContent text={rapport} />
              </div>
              <div className="px-6 py-4 border-t border-border shrink-0 space-y-2">
                {eleveId && (
                  <SaveDiagnosticButton
                    ficheId={eleveId}
                    prenomEleve={eleve?.prenom}
                    domaine="hypothèses de travail"
                    sousDomaine=""
                    hypotheses={rapport ? [rapport.substring(0, 150) + '…'] : []}
                    actions={[]}
                  />
                )}
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const pdfBuffer = await generatePdf();
                      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
                      const name = (eleve?.nom || 'eleve').replace(/\s+/g, '_');
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = `rapport_${name}.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    } catch (err) {
                      console.error('Erreur téléchargement PDF:', err);
                    }
                  }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger le PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}