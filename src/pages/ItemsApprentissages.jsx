import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { useDiagnostic } from "@/lib/DiagnosticContext";
import { motion } from "framer-motion";

const TOGGLES = [
  { id: "lec_confusions",    label: "Confusions phonologiques" },
  { id: "lec_lenteur",       label: "Lenteur importante en lecture" },
  { id: "lec_comprehension", label: "Difficultés de compréhension" },
  { id: "ecr_lenteur",       label: "Lenteur d'écriture" },
  { id: "ecr_desorganisation", label: "Écriture désorganisée / illisible" },
  { id: "math_num",          label: "Difficultés en numération" },
  { id: "math_problemes",    label: "Difficultés dans la résolution de problèmes" },
];

export default function ItemsApprentissages() {
  const navigate = useNavigate();
  const { addSelection } = useDiagnostic();
  const [active, setActive] = useState({});
  const [observations, setObservations] = useState("");

  const toggle = (id) => setActive(prev => ({ ...prev, [id]: !prev[id] }));

  const score = Object.values(active).filter(Boolean).length;

  const handleValidate = () => {
    TOGGLES.forEach(({ id, label }) => {
      if (active[id]) {
        addSelection("apprentissage", { label, analysisType: "Item apprentissage", timestamp: Date.now() });
      }
    });
    if (observations.trim()) {
      addSelection("apprentissage", { label: `Obs: ${observations.trim()}`, analysisType: "Observation", timestamp: Date.now() });
    }
    navigate("/evaluation-domains");
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="Apprentissages">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-4"
          style={{ padding: 20 }}
        >
          <p className="text-base font-semibold text-foreground">
            Sélectionnez les items observés
          </p>

          {/* Score badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Score :</span>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              {score} / {TOGGLES.length}
            </span>
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            {TOGGLES.map(({ id, label }, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => toggle(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                  active[id]
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/40 text-foreground"
                }`}
              >
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                  active[id] ? "bg-primary-foreground border-primary-foreground" : "border-muted-foreground"
                }`}>
                  {active[id] && <Check className="w-3 h-3 text-primary" />}
                </div>
                <span className="text-sm font-medium">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* Textarea */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              Observations complémentaires
            </label>
            <Textarea
              value={observations}
              onChange={e => setObservations(e.target.value)}
              placeholder="Observations complémentaires"
              rows={3}
              className="resize-none"
            />
          </div>

          <Button
            onClick={handleValidate}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
            Valider ce domaine
          </Button>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}