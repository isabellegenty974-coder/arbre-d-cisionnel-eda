import { motion } from "framer-motion";
import { Activity, MessageSquare, Eye, Users } from "lucide-react";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const FICHES = [
  {
    icon: Activity,
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    title: "Motricité",
    description: "Développement des habiletés motrices fines (écriture, découpage…) et globales (équilibre, coordination).",
    signes: [
      "Maladresse inhabituelle dans les gestes fins",
      "Difficultés à nouer ses lacets, découper, colorier",
      "Manque d'équilibre, chutes fréquentes",
      "Mauvaise coordination des membres",
    ],
    pistes: "Orienter vers un bilan en psychomotricité. Peut révéler une dyspraxie développementale (TDC).",
  },
  {
    icon: MessageSquare,
    color: "bg-cyan-50 border-cyan-200",
    iconColor: "text-cyan-600",
    title: "Langage oral",
    description: "Capacité à comprendre et à s'exprimer verbalement, en production et en réception.",
    signes: [
      "Vocabulaire pauvre pour l'âge",
      "Difficultés à construire des phrases complexes",
      "Compréhension limitée des consignes orales",
      "Trouble de l'articulation ou bégaiement",
    ],
    pistes: "Bilan orthophonique recommandé. Explorer la compréhension morphosyntaxique, le stock lexical et la mémoire phonologique.",
  },
  {
    icon: Eye,
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-500",
    title: "Attention",
    description: "Capacité à maintenir sa concentration, à filtrer les distracteurs et à planifier ses actions.",
    signes: [
      "Distraction rapide par l'environnement",
      "Perd le fil des consignes longues",
      "Oublie le matériel, désorganisation",
      "Travail inachevé sans effort supplémentaire",
    ],
    pistes: "Évaluer les fonctions attentionnelles soutenues et sélectives. Peut s'inscrire dans un TDAH ou une anxiété. Bilan neuropsychologique utile.",
  },
  {
    icon: Users,
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-500",
    title: "Interactions sociales",
    description: "Qualité des relations avec les pairs et les adultes, pragmatique du langage et cognition sociale.",
    signes: [
      "Difficultés à initier ou maintenir une conversation",
      "Incompréhension des règles sociales implicites",
      "Peu d'intérêt pour les jeux collectifs",
      "Rigidité, résistance aux changements de routine",
    ],
    pistes: "Explorer un profil TSA, une hypersensibilité ou des difficultés de pragmatique. Bilan pédopsychiatrique ou neuropsychologique conseillé.",
  },
];

export default function ItemsDeveloppement() {
  return (
    <div className="min-h-screen bg-background pb-16">
      <HamburgerMenu />
      <ScreenLayout title="🌱 Développement" subtitle="Fiches informatives sur les axes développementaux">
        <div className="space-y-5">
          {FICHES.map(({ icon: Icon, color, iconColor, title, description, signes, pistes }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`rounded-2xl border p-5 ${color}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl bg-white/70 ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground text-lg">{title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>

              <div className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Signes à observer</p>
                <ul className="space-y-1.5">
                  {signes.map((s, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-50" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-white/60">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pistes d'exploration</p>
                <p className="text-sm text-foreground">{pistes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </ScreenLayout>
    </div>
  );
}