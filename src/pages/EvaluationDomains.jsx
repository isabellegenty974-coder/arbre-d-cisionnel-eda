import { Link } from "react-router-dom";
import { Book, Smile, Baby, Home, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { motion } from "framer-motion";

const DOMAINS = [
  { label: "Apprentissages",            icon: Book,    to: "/items-apprentissages", style: "primary" },
  { label: "Comportement / Émotionnel", icon: Smile,   to: "/items-comportement",   style: "primary" },
  { label: "Développement",             icon: Baby,    to: "/items-developpement",  style: "primary" },
  { label: "Contexte",                  icon: Home,    to: "/items-contexte",       style: "primary" },
];

export default function EvaluationDomains() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="Domaines d'évaluation">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-4"
          style={{ padding: 20 }}
        >
          <p className="text-base font-semibold text-foreground mb-2">
            Sélectionnez un domaine à évaluer
          </p>

          <div className="space-y-4">
            {DOMAINS.map(({ label, icon: Icon, to }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link to={to}>
                  <Button className="w-full justify-start gap-3 h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Icon className="w-5 h-5" />
                    {label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="pt-2">
            <Link to="/analyse-eda">
              <Button variant="outline" className="w-full justify-start gap-3 h-12">
                <ArrowRight className="w-5 h-5" />
                Passer à l'analyse
              </Button>
            </Link>
          </div>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}