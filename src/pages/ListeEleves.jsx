import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ListeEleves() {
  const navigate = useNavigate();
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.FicheEleve.list("-created_date", 100)
      .then(setEleves)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="Élèves">
        <div className="max-w-md mx-auto space-y-4" style={{ padding: 20 }}>

          <Button
            onClick={() => navigate("/fiche-eleve-form")}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Nouvelle fiche élève
          </Button>

          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Chargement...</div>
          ) : eleves.length === 0 ? (
            <div className="text-center py-10 rounded-xl bg-secondary/30 border border-secondary">
              <p className="text-muted-foreground text-sm">Aucun élève enregistré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eleves.map((eleve, i) => (
                <motion.button
                  key={eleve.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/dashboard?id=${eleve.id}`)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-soft transition-all text-left"
                >
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {eleve.prenom} {eleve.nom}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Classe : {eleve.classe || "—"}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </ScreenLayout>
    </div>
  );
}