import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, User, Database, Target, Eye, Server, Clock, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

const sections = [
  {
    icon: User,
    color: "#4A90E2",
    light: "#E8F0FB",
    title: "Qui traite ces données",
    content: [
      { type: "text", value: "L'application « Suivis RASED » est utilisée par l'équipe RASED de la circonscription de La Possession pour le suivi des élèves des écoles du secteur. Elle a été développée par Isabelle Genty, psychologue de l'Éducation nationale, membre de cette équipe." },
      { type: "text", value: "Une démarche de déclaration est en cours auprès du délégué à la protection des données de l'académie de La Réunion." },
    ],
  },
  {
    icon: Database,
    color: "#8B5CF6",
    light: "#F0EBFD",
    title: "Quelles données",
    content: [
      { type: "list", items: [
        "Pour l'ensemble des élèves du secteur : nom, prénom, date de naissance, école et classe, importés depuis les listes fournies par les écoles.",
        "Pour les élèves faisant l'objet d'un suivi RASED : difficultés repérées, interventions réalisées, observations professionnelles, coordonnées des responsables légaux, documents joints.",
      ]},
    ],
  },
  {
    icon: Target,
    color: "#34C48A",
    light: "#E4F8F0",
    title: "Pourquoi",
    content: [
      { type: "text", value: "Suivre les accompagnements conduits par l'équipe RASED, et produire le bilan annuel d'activité transmis à l'inspection. Aucune donnée n'est utilisée à d'autres fins, ni transmise à des tiers." },
    ],
  },
  {
    icon: Eye,
    color: "#F59E0B",
    light: "#FEF3DC",
    title: "Qui y a accès",
    content: [
      { type: "text", value: "Les trois membres de l'équipe RASED, sur authentification. Chacun accède à l'ensemble des dossiers du secteur, ce qui correspond au travail en équipe pluricatégorielle." },
      { type: "text", value: "Les observations professionnelles sont couvertes par le secret professionnel." },
    ],
  },
  {
    icon: Server,
    color: "#22D3EE",
    light: "#E0FBFE",
    title: "Où sont hébergées les données",
    content: [
      { type: "text", value: "Sur la plateforme Base44. L'application n'est pas accessible publiquement." },
    ],
  },
  {
    icon: Clock,
    color: "#EC6B8A",
    light: "#FCE8EE",
    title: "Combien de temps",
    content: [
      { type: "text", value: "Les données sont conservées le temps du suivi de l'élève dans le secteur. La durée de conservation définitive est en cours de définition avec le délégué à la protection des données de l'académie." },
    ],
  },
  {
    icon: UserCheck,
    color: "#D4A574",
    light: "#F8EEE0",
    title: "Vos droits",
    content: [
      { type: "text", value: "Les responsables légaux peuvent demander l'accès aux données concernant leur enfant, leur rectification ou leur effacement, et s'opposer au traitement. Ces demandes s'adressent à Isabelle Genty, psychologue de l'Éducation nationale, [ton adresse professionnelle], ou au délégué à la protection des données de l'académie de La Réunion : dpd@ac-reunion.fr." },
      { type: "text", value: "En cas de difficulté, une réclamation peut être adressée à la CNIL (cnil.fr)." },
    ],
  },
];

export default function PolitiqueConfidentialite() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24">
      <HamburgerMenu />

      {/* Header */}
      <div className="bg-[#0F172A] px-5 pt-12 pb-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#D4A574]/20 border border-[#D4A574]/30 flex items-center justify-center shrink-0">
              <Shield className="w-7 h-7 text-[#D4A574]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl leading-tight">Information sur le traitement des données personnelles</h1>
              <p className="text-white/50 text-sm mt-1">
                Mise à jour le 21 août 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {sections.map(({ icon: Icon, color, light, title, content }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            className="bg-white rounded-3xl border-2 border-[#E8DCC8] overflow-hidden shadow-sm"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F0E8DA]">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: light }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <h2 className="font-bold text-[#0F172A] text-sm">
                <span className="text-[#0F172A]/40 mr-2 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                {title}
              </h2>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 space-y-3">
              {content.map((block, j) => {
                if (block.type === 'text') return (
                  <p key={j} className="text-sm text-[#0F172A]/75 leading-relaxed">{block.value}</p>
                );
                if (block.type === 'list') return (
                  <ul key={j} className="space-y-2">
                    {block.items.map((item, k) => (
                      <li key={k} className="flex items-start gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ background: color }} />
                        <span className="text-sm text-[#0F172A]/80 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                );
                return null;
              })}
            </div>
          </motion.div>
        ))}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-2"
        >
          <p className="text-xs text-[#0F172A]/40">Outil RASED · Usage interne · Données protégées</p>
        </motion.div>
      </div>
    </div>
  );
}
