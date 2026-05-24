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
        title="🎯 Domaines d'évaluation"
        subtitle="Cliquez sur un domaine pour explorer les signes et ressources"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {DOMAINS.map(({ label, desc, icon: Icon, to, color, border, iconBg, iconColor, dot }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.35 }}
            >
              <Link to={to} className="group block h-full">
                <div className={`relative flex flex-col items-start gap-4 p-6 rounded-2xl border ${border} bg-gradient-to-br ${color} hover:shadow-soft-lg transition-all duration-250 hover:scale-[1.03] h-full overflow-hidden`}>
                  {/* Background accent */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${iconBg} opacity-40 blur-2xl`} />
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${dot}`} />

                  {/* Icon */}
                  <div className={`relative z-10 w-14 h-14 rounded-xl ${iconBg} flex items-center justify-center shadow-soft`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                  </div>

                  {/* Text */}
                  <div className="relative z-10 flex-1">
                    <h3 className="font-bold text-lg text-foreground">{label}</h3>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{desc}</p>
                  </div>

                  {/* Footer */}
                  <div className="relative z-10 flex items-center gap-2 text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                    <span>Explorer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}