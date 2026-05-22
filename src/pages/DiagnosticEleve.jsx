import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp, FileText, X, Download } from "lucide-react";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  {
    key: "apprentissages",
    label: "📚 Apprentissages",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100 text-blue-800",
    items: [
      { label: "Décodage lent et laborieux", desc: "Lecture très lente, syllabique, hésitante, même pour des mots fréquents — peu d'automatisation malgré l'entraînement" },
      { label: "Confusions et inversions de lettres", desc: "Confusions visuelles (b/d, p/q, m/n) ou auditives (f/v, ch/j), inversions de syllabes (por→pro), omissions ou ajouts" },
      { label: "Conscience phonémique fragile", desc: "Difficulté à manipuler les sons des mots : segmenter, rimer, supprimer ou fusionner des phonèmes" },
      { label: "Lecture non fluide malgré la remédiation", desc: "Résistance aux apprentissages phonémiques même avec du soutien répété — signe d'alerte fort pour une dyslexie" },
      { label: "Difficultés de compréhension en lecture", desc: "Peine à saisir le sens d'un texte lu, repérer les personnages, la chronologie ou l'implicite" },
      { label: "Orthographe atteinte", desc: "Erreurs phonétiques massives, confusion de sons proches, mots outils jamais mémorisés, accords absents" },
      { label: "Omissions / substitutions à l'écrit", desc: "Lettres ou syllabes oubliées, remplacées ou déplacées dans les mots, même courants" },
      { label: "Graphisme illisible / douloureux", desc: "Tracé chaotique, lettres de tailles très irrégulières, espacement aléatoire, sortie fréquente des lignes" },
      { label: "Écriture lente et fatigante", desc: "Coût moteur élevé de l'écriture, fatigue rapide, plaintes physiques (main, bras), refus d'écrire" },
      { label: "Difficultés en calcul / numération", desc: "Compétences numériques très fragiles : dénombrement, comparaison, opérations élémentaires, sens des quantités" },
      { label: "Difficultés en résolution de problèmes", desc: "Incompréhension de l'énoncé, absence de stratégie, confusion entre les données numériques" },
      { label: "Lenteur généralisée dans les productions écrites", desc: "Travail rarement terminé, rythme très inférieur à la classe, coût cognitif global élevé" },
      { label: "Difficultés de mémorisation des apprentissages scolaires", desc: "Oubli rapide des leçons, tables non retenues, difficulté à consolider les automatismes" },
    ],
  },
  {
    key: "comportement",
    label: "💝 Comportement",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-100 text-rose-800",
    items: [
      { label: "Agitation motrice persistante", desc: "Se lève fréquemment, ne reste pas en place, besoin constant de bouger, agite mains ou pieds en permanence" },
      { label: "Impulsivité verbale et gestuelle", desc: "Parle sans lever le doigt, interrompt, agit avant de réfléchir, réponses précipitées, difficulté à attendre son tour" },
      { label: "Difficultés d'inhibition / contrôle", desc: "Peine à stopper une réaction automatique, persévère dans l'erreur, impulsions motrices ou verbales non filtrées" },
      { label: "Inattention et distractibilité", desc: "Décroche rapidement, oublie la consigne en cours de tâche, sensible aux stimuli extérieurs, rares moments de concentration soutenue" },
      { label: "Opposition systématique", desc: "Refuse de se soumettre aux règles ou aux demandes des adultes, contestation régulière, recherche de conflits" },
      { label: "Provocation et comportements défiants", desc: "Cherche à contrarier, énerve intentionnellement les autres, ne reconnaît pas ses torts, rend les autres responsables" },
      { label: "Anxiété généralisée ou scolaire", desc: "Inquiétudes excessives et récurrentes, peurs scolaires, somatisations (maux de ventre, tête), refus d'école" },
      { label: "Repli sur soi / affect plat", desc: "Isolé, peu communicatif, air triste ou absent de manière durable, perte d'intérêt pour les activités" },
      { label: "Réactions émotionnelles disproportionnées", desc: "Pleurs ou colères intenses pour des raisons mineures, durée de retour au calme très longue" },
      { label: "Difficulté à accepter les erreurs / perfectionnisme rigide", desc: "Réaction excessive face aux échecs, efface compulsivement, stratégies d'évitement, peur du jugement" },
    ],
  },
  {
    key: "developpement",
    label: "🌱 Développement",
    color: "bg-teal-50 border-teal-200",
    headerColor: "bg-teal-100 text-teal-800",
    items: [
      { label: "Retard ou difficultés de langage oral", desc: "Vocabulaire limité, phrases courtes ou syntaxe incorrecte pour l'âge, développement du langage tardif ou atypique" },
      { label: "Difficultés de compréhension orale", desc: "Peine à suivre des consignes à plusieurs étapes, demande souvent de répéter, interprétations littérales" },
      { label: "Maladresse globale / équilibre", desc: "Chutes fréquentes, difficultés en EPS (équilibre, coordination, saut), mouvements peu précis ou mal calibrés" },
      { label: "Difficultés motrices fines", desc: "Prise du crayon difficile, découpage imprécis, boutonnage lent, assemblage laborieux, activités manuelles évitantes" },
      { label: "Attention fragile et fluctuante", desc: "Distrait facilement, attention en éclairs, oublie la consigne en cours de tâche, travail irrégulier selon la stimulation" },
      { label: "Difficultés d'interactions sociales", desc: "Peu d'amis, jeux solitaires, ne comprend pas les codes sociaux implicites, regard fuyant, difficulté à décoder les émotions" },
      { label: "Comportements répétitifs / intérêts restreints", desc: "Rituels, routines rigides, intérêts très focalisés et exclusifs, résistance aux changements d'activité ou d'environnement" },
      { label: "Troubles sensoriels", desc: "Réactions excessives ou absentes au bruit, au toucher, aux odeurs, à la lumière ou aux textures vestimentaires" },
      { label: "Difficultés de mémoire de travail", desc: "Perd le fil en cours d'exercice, ne retient pas plusieurs informations simultanément, erreurs répétées par oubli" },
      { label: "Décalage global de développement", desc: "Décalage notable avec les attendus de l'âge dans plusieurs domaines simultanément : langage, moteur, cognitif, social" },
    ],
  },
  {
    key: "contexte",
    label: "🏠 Contexte",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-100 text-emerald-800",
    items: [
      { label: "Environnement familial difficile", desc: "Conflits parentaux, instabilité affective, manque de sécurité ou de suivi des apprentissages à la maison" },
      { label: "Changement récent majeur", desc: "Déménagement, séparation parentale, naissance d'un enfant, deuil récent dans la famille" },
      { label: "Absentéisme fréquent", desc: "Nombreuses absences non justifiées entraînant des lacunes importantes et une déscolarisation partielle" },
      { label: "Mauvais climat de classe", desc: "Moqueries, harcèlement, conflits de groupe, tensions relationnelles récurrentes affectant le bien-être" },
      { label: "Barrière linguistique", desc: "Langue parlée à la maison différente du français, scolarisation récente en France, bilinguisme non stabilisé" },
      { label: "Précarité sociale", desc: "Conditions de vie difficiles (logement, alimentation) impactant la disponibilité aux apprentissages" },
      { label: "Changement d'école ou d'enseignant", desc: "Rupture récente dans le suivi scolaire, adaptation difficile, perte des repères habituels" },
      { label: "Événement traumatisant récent", desc: "Accident, violence, deuil ou événement choquant ayant pu engendrer un état de stress ou de choc" },
      { label: "Manque de stimulation à la maison", desc: "Pas de soutien aux devoirs, peu de livres ou d'échanges verbaux, faible stimulation cognitive hors école" },
      { label: "Troubles de santé récurrents", desc: "Maladies fréquentes, problèmes auditifs ou visuels non corrigés, fatigabilité liée à un état de santé" },
    ],
  },
];

export default function DiagnosticEleve() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const eleveId = urlParams.get("id");

  const [eleve, setEleve] = useState(null);
  const [checked, setChecked] = useState({});
  const [openSections, setOpenSections] = useState({ apprentissages: true, comportement: true, developpement: true, contexte: true });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [rapport, setRapport] = useState(null);

  useEffect(() => {
    if (eleveId) {
      base44.entities.FicheEleve.get(eleveId).then(setEleve);
    } else {
      // Student info passed as query params (from Diagnostic entity)
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

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const totalChecked = Object.values(checked).reduce((acc, arr) => acc + arr.length, 0);

  const handleGenerateRapport = async () => {
    setGenerating(true);
    const lignes = [];
    CATEGORIES.forEach(cat => {
      const items = checked[cat.key] || [];
      if (items.length > 0) {
        lignes.push(`**${cat.label}** : ${items.join(" ; ")}`);
      }
    });
    const prompt = `Tu es un professionnel de l'éducation spécialisée. Un enseignant a observé les signes suivants chez un élève :

${lignes.join("\n")}

Génère un rapport clinique structuré en français avec :
1. Un résumé des observations
2. Les hypothèses diagnostiques prioritaires (avec leur nom clinique précis)
3. Les orientations recommandées (professionnels à consulter, aménagements pédagogiques)
4. Un message de vigilance à destination de l'enseignant

Sois professionnel, bienveillant et clair. Évite de poser un diagnostic définitif.`;

    const result = await base44.integrations.Core.InvokeLLM({ prompt });
    setRapport(result);
    setGenerating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const selections = {};
    CATEGORIES.forEach(cat => { selections[cat.key] = checked[cat.key] || []; });

    await base44.entities.Diagnostic.create({
      eleve_nom: eleve?.nom || "",
      eleve_prenom: eleve?.prenom || "",
      eleve_age: eleve?.age,
      eleve_classe: eleve?.classe || "",
      selections,
      statut: "complète",
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate(`/dashboard?ficheId=${eleveId}`), 1200);
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout
        title={`🔍 Hypothèse(s) diagnostique(s)`}
        subtitle={eleve ? `${eleve.prenom} ${eleve.nom}${eleve.classe ? ` — ${eleve.classe}` : ""}` : ""}
      >
        <div className="space-y-4">
          {CATEGORIES.map((cat) => {
            const catChecked = checked[cat.key] || [];
            const isOpen = openSections[cat.key];
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border overflow-hidden ${cat.color}`}
              >
                <button
                  onClick={() => toggleSection(cat.key)}
                  className={`w-full flex items-center justify-between px-5 py-3 font-semibold text-left ${cat.headerColor}`}
                >
                  <span>
                    {cat.label}
                    {catChecked.length > 0 && (
                      <span className="ml-2 text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">
                        {catChecked.length}
                      </span>
                    )}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="p-4 space-y-2">
                    {cat.items.map((item) => {
                      const isChecked = (checked[cat.key] || []).includes(item.label);
                      return (
                        <label
                          key={item.label}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            isChecked ? "bg-white/80 shadow-sm" : "bg-white/30 hover:bg-white/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(cat.key, item)}
                            className="mt-1 accent-current w-4 h-4 shrink-0"
                          />
                          <div>
                            <p className={`text-sm font-medium ${isChecked ? "text-foreground" : "text-foreground/90"}`}>
                              {item.label}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}

          <div className="pt-2 flex flex-col gap-3">
            <Button
              onClick={handleGenerateRapport}
              disabled={totalChecked === 0 || generating}
              variant="outline"
              className="w-full gap-2 border-primary/40 text-primary hover:bg-primary/5"
            >
              <FileText className="w-4 h-4" />
              {generating ? "Génération du rapport..." : `Générer le rapport (${totalChecked} item${totalChecked > 1 ? "s" : ""})`}
            </Button>
            <Button
              onClick={handleSave}
              disabled={totalChecked === 0 || saving || saved}
              className={`w-full gap-2 transition-all ${saved ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              <Save className="w-4 h-4" />
              {saved ? "✓ Enregistré !" : saving ? "Enregistrement..." : `Enregistrer`}
            </Button>
          </div>
        </div>
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
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{rapport}</div>
              </div>
              <div className="px-6 py-4 border-t border-border shrink-0">
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    const doc = new jsPDF();
                    const name = `${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim();
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Rapport - Hypothese(s) diagnostique(s)`, 15, 20);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'normal');
                    if (name) doc.text(`Eleve : ${name}`, 15, 30);
                    if (eleve?.classe) doc.text(`Classe : ${eleve.classe}`, 15, 37);
                    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 15, eleve?.classe ? 44 : 37);
                    const lines = doc.splitTextToSize(rapport, 180);
                    doc.setFontSize(10);
                    doc.text(lines, 15, eleve?.classe ? 54 : 47);
                    doc.save(`rapport_${(name || 'eleve').replace(/\s+/g, '_')}.pdf`);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Enregistrer en PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}