import { Link } from "react-router-dom";
import { Book, Smile, Baby, Home, ArrowRight, ChevronRight } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { motion } from "framer-motion";

const DOMAINS = [
  {
    label: "Apprentissages",
    desc: "Lecture, écriture, mathématiques, mémorisation",
    icon: Book,
    to: "/items-apprentissages",
    color: "from-blue-500/15 to-blue-400/5",
    border: "border-blue-200",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-600",
    dot: "bg-blue-500",
  },
  {
    label: "Comportement",
    desc: "Attention, émotions, impulsivité, anxiété",
    icon: Smile,
    to: "/items-comportement",
    color: "from-rose-500/15 to-rose-400/5",
    border: "border-rose-200",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600",
    dot: "bg-rose-500",
  },
  {
    label: "Développement",
    desc: "Langage oral, motricité, interactions sociales",
    icon: Baby,
    to: "/items-developpement",
    color: "from-emerald-500/15 to-emerald-400/5",
    border: "border-emerald-200",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    label: "Contexte",
    desc: "Famille, environnement scolaire, changements",
    icon: Home,
    to: "/items-contexte",
    color: "from-amber-500/15 to-amber-400/5",
    border: "border-amber-200",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600",
    dot: "bg-amber-500",
  },
];

export default function EvaluationDomains() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <ScreenLayout
        title="Domaines d'évaluation"
        subtitle="Explorez chaque domaine pour identifier les signes d'alerte"
      >
        <div className="space-y-3 max-w-lg mx-auto">
          {DOMAINS.map(({ label, desc, icon: Icon, to, color, border, iconBg, iconColor, dot }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
            >
              <Link to={to} className="group block">
                <div className={`relative flex items-center gap-4 p-4 rounded-2xl border ${border} bg-gradient-to-r ${color} hover:shadow-soft-md transition-all duration-200 hover:scale-[1.01]`}>
                  {/* Dot accent */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${dot}`} />

                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}