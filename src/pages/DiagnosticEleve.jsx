import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Save, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    key: "apprentissages",
    label: "📚 Apprentissages",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-100 text-blue-800",
    items: [
      "Difficultés en lecture (décodage, fluidité)",
      "Difficultés de compréhension en lecture",
      "Difficultés en écriture / graphisme",
      "Difficultés en orthographe",
      "Difficultés en calcul",
      "Difficultés en résolution de problèmes",
      "Difficultés en numération",
      "Lenteur dans les productions écrites",
    ],
  },
  {
    key: "comportement",
    label: "💝 Comportement",
    color: "bg-rose-50 border-rose-200",
    headerColor: "bg-rose-100 text-rose-800",
    items: [
      "Agitation motrice excessive",
      "Impulsivité (parole, gestes)",
      "Difficultés d'inhibition / contrôle",
      "Anxiété / peurs scolaires",
      "Opposition et refus",
      "Repli sur soi / tristesse",
      "Troubles du comportement en groupe",
      "Réactions émotionnelles disproportionnées",
    ],
  },
  {
    key: "developpement",
    label: "🌱 Développement",
    color: "bg-teal-50 border-teal-200",
    headerColor: "bg-teal-100 text-teal-800",
    items: [
      "Retard ou difficultés de langage oral",
      "Difficultés de compréhension orale",
      "Difficultés motrices globales",
      "Difficultés motrices fines / graphomotrices",
      "Difficultés d'attention et de concentration",
      "Difficultés d'interactions sociales",
      "Troubles sensoriels (hyper/hyposensibilité)",
      "Fatigue ou régulation du tonus",
    ],
  },
  {
    key: "contexte",
    label: "🏠 Contexte",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-100 text-emerald-800",
    items: [
      "Environnement familial difficile",
      "Changement récent (déménagement, séparation...)",
      "Absentéisme fréquent",
      "Mauvais climat de classe",
      "Barrière linguistique",
      "Précarité sociale",
      "Changement d'école ou d'enseignant",
      "Événement traumatisant récent",
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
      const exists = current.includes(item);
      return { ...prev, [catKey]: exists ? current.filter(i => i !== item) : [...current, item] };
    });
  };

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const totalChecked = Object.values(checked).reduce((acc, arr) => acc + arr.length, 0);

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
        title={`🔍 Diagnostic`}
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
                      const isChecked = (checked[cat.key] || []).includes(item);
                      return (
                        <label
                          key={item}
                          className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                            isChecked ? "bg-white/80 shadow-sm" : "bg-white/30 hover:bg-white/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggle(cat.key, item)}
                            className="mt-0.5 accent-current w-4 h-4 shrink-0"
                          />
                          <span className={`text-sm ${isChecked ? "font-medium text-foreground" : "text-foreground/80"}`}>
                            {item}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}

          <div className="pt-2">
            <Button
              onClick={handleSave}
              disabled={totalChecked === 0 || saving || saved}
              className={`w-full gap-2 transition-all ${saved ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              <Save className="w-4 h-4" />
              {saved ? "✓ Enregistré !" : saving ? "Enregistrement..." : `Enregistrer le diagnostic (${totalChecked} item${totalChecked > 1 ? "s" : ""})`}
            </Button>
          </div>
        </div>
      </ScreenLayout>
    </div>
  );
}