import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp, FileText, X, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import RapportContent from "@/components/RapportContent";

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
      // --- Agitation / Hyperactivité ---
      { label: "Agitation motrice permanente", desc: "Se lève sans permission, se tortille sur sa chaise, besoin constant de bouger, incapable de rester assis même brièvement" },
      { label: "Mouvements parasites incessants", desc: "Agite les jambes, tapote, manipule des objets, fait du bruit avec la bouche ou le matériel en permanence" },
      { label: "Agitation non liée au contexte", desc: "Hyperactivité présente dans tous les contextes (classe, récré, maison) et pas seulement lors de transitions ou d'ennui" },
      // --- Impulsivité ---
      { label: "Impulsivité verbale", desc: "Répond avant la fin de la question, coupe la parole, crie la réponse, parle sans lever le doigt de façon systématique" },
      { label: "Impulsivité motrice", desc: "Agit avant de réfléchir, touche les affaires des autres, se lève sans autorisation, réponses gestuelles précipitées" },
      { label: "Incapacité à attendre son tour", desc: "Tensions en jeux collectifs, files d'attente insupportables, frustration immédiate si délai même court" },
      { label: "Passage à l'acte impulsif avec regrets", desc: "L'enfant regrette souvent après coup, reconnaît avoir agi trop vite, mais répète le comportement" },
      // --- Inhibition / Contrôle ---
      { label: "Déficit d'inhibition comportementale", desc: "Peine à stopper une réponse automatique, difficultés à respecter une règle lorsque le contexte change" },
      { label: "Persévération dans l'erreur", desc: "Répète la même réponse ou stratégie malgré le feedback négatif, difficulté à changer de procédure" },
      { label: "Rires ou réactions inadaptés", desc: "Rit au mauvais moment, réponses émotionnelles décalées par rapport au contexte social" },
      // --- Attention ---
      { label: "Décrochage attentionnel rapide", desc: "Perd le fil après quelques minutes, déconnecte en cours de consigne, regard dans le vide fréquent" },
      { label: "Hypersensibilité aux distracteurs", desc: "Toute stimulation extérieure (bruit, mouvement, lumière) capte son attention et interrompt la tâche" },
      { label: "Oubli des consignes en cours de tâche", desc: "Commence un exercice mais ne sait plus ce qu'il devait faire après 2 ou 3 étapes" },
      { label: "Attention en éclairs uniquement", desc: "Ne concentre son attention que sur les activités qui le passionnent, jamais sur les tâches imposées" },
      // --- Anxiété ---
      { label: "Anxiété scolaire spécifique", desc: "Peurs liées aux évaluations, aux exposés oraux, à la lecture à voix haute, panique en situation de performance" },
      { label: "Anxiété généralisée", desc: "Inquiétudes excessives dans de nombreux domaines (famille, santé, avenir), difficultés à déconnecter" },
      { label: "Somatisations régulières", desc: "Maux de ventre, de tête ou nausées récurrents le matin ou avant un contrôle, sans cause médicale identifiée" },
      { label: "Refus ou évitement scolaire", desc: "Résistance à aller à l'école, pleurs le matin, demandes répétées de rester à la maison, fugues de classe" },
      { label: "Comportements de réassurance", desc: "Demande sans cesse si c'est bien, cherche la validation de l'adulte, vérifie ses réponses compulsivement" },
      // --- Opposition ---
      { label: "Opposition aux règles scolaires", desc: "Refuse régulièrement de suivre les consignes, conteste les règles de classe, résistance passive ou active" },
      { label: "Provocations ciblées", desc: "Cherche à agacer intentionnellement des pairs ou l'adulte, sourit quand il transgresse, semble y trouver du plaisir" },
      { label: "Non-reconnaissance de ses torts", desc: "Reporte systématiquement la faute sur les autres, nie les faits même évidents, discours victimaire ancré" },
      { label: "Crises de colère disproportionnées", desc: "Explosions de rage pour un refus ou une frustration minime, durée longue, récupération difficile" },
      // --- Régulation émotionnelle ---
      { label: "Labilité émotionnelle marquée", desc: "Passe d'une émotion à l'autre très rapidement, humeur imprévisible, pleurs ou rires sans raison apparente" },
      { label: "Repli affectif / affect plat", desc: "Visage inexpressif, peu de réactions émotionnelles, isolement, regard vide, indifférence aux activités" },
      { label: "Difficulté à tolérer la frustration", desc: "Réagit fortement à tout obstacle, toute limite, tout échec même mineur déclenche une réaction intense" },
      { label: "Perfectionnisme rigide avec évitement", desc: "Refuse de commencer si risque d'erreur, efface compulsivement, abandonne rapidement face à la difficulté" },
      // --- Estime de soi / Confiance ---
      { label: "Manque de confiance en soi", desc: "Dit souvent \"je suis nul(le)\", \"je sais pas\", \"j'y arriverai pas\" avant même d'essayer, se sous-estime de façon systématique" },
      { label: "Sentiment d'incompétence scolaire", desc: "Convaincu(e) de ne pas être capable d'apprendre, perçoit ses difficultés comme permanentes et inhérentes à sa personne" },
      { label: "Autodépréciation verbale", desc: "Tient des propos négatifs sur lui/elle-même : \"je suis bête\", \"tout le monde est meilleur que moi\", \"j'ai jamais rien\"" },
      { label: "Hypersensibilité au regard des autres", desc: "Rougit, se fige ou refuse de participer à l'oral par peur d'être jugé(e), très affecté(e) par les moqueries même légères" },
      { label: "Évitement des situations de mise en valeur", desc: "Refuse de montrer son travail, se cache quand félicité(e), ne lève jamais la main même quand il/elle connaît la réponse" },
      { label: "Découragement rapide face à la difficulté", desc: "Abandonne dès le premier obstacle, ne persévère pas, expression de résignation apprise (\"ça sert à rien\")" },
      { label: "Dépendance excessive au regard de l'adulte", desc: "A besoin d'être rassuré(e) en permanence pour agir, n'ose pas décider seul(e), attend une validation pour chaque étape" },
      { label: "Repli identitaire scolaire", desc: "Se définit uniquement par ses échecs, a intégré une identité de \"mauvais élève\", désinvestissement global de la scolarité" },
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
  const [rapport, setRapport] = useState(null); // rapport affiché dans la modale
  const [generatedRapport, setGeneratedRapport] = useState(''); // rapport persistant pour la sauvegarde

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
    try {
      // Récupérer le nom de l'examinateur
      let examinerName = 'N/A';
      try {
        const user = await base44.auth.me();
        examinerName = user?.full_name || 'N/A';
      } catch (e) {
        // Silencieusement échouer
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const lignes = [];
      CATEGORIES.forEach(cat => {
        const items = checked[cat.key] || [];
        if (items.length > 0) {
          lignes.push(`**${cat.label}** : ${items.join(" ; ")}`);
        }
      });
      const prompt = `Élève : ${eleve?.prenom || 'N/A'} ${eleve?.nom || 'N/A'}
Âge : ${eleve?.age || 'N/A'} ans
Classe : ${eleve?.classe || 'N/A'}
Examinateur : ${examinerName}
Date : ${dateStr}

Tu es un clinicien spécialisé dans l'évaluation et le diagnostic. Tu dois analyser les observations suivantes chez cet élève :\n\n${lignes.join("\n")}\n\nGénère un rapport clinique structuré en français avec :\n1. Un résumé synthétique des observations\n2. Les hypothèses diagnostiques prioritaires (avec leur nom clinique précis)\n3. Les orientations d'évaluation complémentaire recommandées\n4. Les recommandations d'accompagnement et d'aménagements\n\nRemplace chaque occurrence de "Patient" par "L'élève" ou "l'élève". Sois professionnel, rigoureux et clair. Évite de poser un diagnostic définitif.`;

      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      const texte = result || "Le rapport n'a pas pu être généré.";
      setRapport(texte);
      setGeneratedRapport(texte);
    } catch (err) {
      console.error(err);
      setRapport("Une erreur est survenue lors de la génération du rapport.");
    } finally {
      setGenerating(false);
    }
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
      rapport: generatedRapport || "",
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
        title={`🔍 Construire une hypothèse diagnostique`}
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
                <RapportContent text={rapport} />
              </div>
              <div className="px-6 py-4 border-t border-border shrink-0">
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    const norm = (str) => (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    const doc = new jsPDF();
                    const name = norm(`${eleve?.prenom || ''} ${eleve?.nom || ''}`.trim());
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Rapport - Hypothese(s) diagnostique(s)', 15, 20);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'normal');
                    if (name) doc.text(`Eleve : ${name}`, 15, 30);
                    if (eleve?.classe) doc.text(`Classe : ${norm(eleve.classe)}`, 15, 37);
                    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 15, eleve?.classe ? 44 : 37);
                    const lines = doc.splitTextToSize(norm(rapport), 180);
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