import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Lock, Eye, UserCheck, Phone, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import HamburgerMenu from '@/components/Navigation/HamburgerMenu';

const sections = [
  {
    icon: Database,
    color: "#4A90E2",
    light: "#E8F0FB",
    title: "Données collectées",
    content: [
      { type: "text", value: "L'application collecte uniquement les informations nécessaires à l'usage diagnostique :" },
      { type: "list", items: [
        "Données de profil professionnel (nom, prénom, fonction)",
        "Données relatives aux élèves (prénom, nom, âge, classe)",
        "Sélections diagnostiques et hypothèses générées",
        "Notes libres et observations saisies par le praticien",
      ]},
    ],
  },
  {
    icon: Eye,
    color: "#8B5CF6",
    light: "#F0EBFD",
    title: "Utilisation des données",
    content: [
      { type: "text", value: "Les données collectées ont pour unique finalité :" },
      { type: "list", items: [
        "Fournir un outil d'aide à la formulation d'hypothèses diagnostiques",
        "Générer des rapports et recommandations personnalisés",
        "Conserver l'historique des interventions RASED",
        "Produire des statistiques anonymisées à usage interne",
      ]},
    ],
  },
  {
    icon: Lock,
    color: "#34C48A",
    light: "#E4F8F0",
    title: "Stockage et sécurité",
    content: [
      { type: "text", value: "La sécurité de vos données est une priorité absolue :" },
      { type: "list", items: [
        "Données hébergées sur des serveurs sécurisés conformes au RGPD",
        "Accès restreint aux seuls membres de votre équipe RASED",
        "Aucun partage avec des tiers sans consentement explicite",
        "Chiffrement des données en transit et au repos",
      ]},
    ],
  },
  {
    icon: Camera,
    color: "#F59E0B",
    light: "#FEF3DC",
    title: "Autorisations requises",
    content: [
      { type: "text", value: "L'application peut solliciter les autorisations suivantes :" },
      { type: "list", items: [
        "Accès à la caméra : pour photographier les évaluations EDA",
        "Accès aux fichiers : pour importer et exporter des documents PDF",
      ]},
      { type: "text", value: "Ces autorisations sont facultatives et n'affectent pas les fonctionnalités principales." },
    ],
  },
  {
    icon: UserCheck,
    color: "#EC6B8A",
    light: "#FCE8EE",
    title: "Vos droits (RGPD)",
    content: [
      { type: "text", value: "Conformément au Règlement Général sur la Protection des Données, vous disposez des droits suivants :" },
      { type: "list", items: [
        "Droit d'accès à l'ensemble de vos données personnelles",
        "Droit de rectification en cas d'informations inexactes",
        "Droit à l'effacement (« droit à l'oubli »)",
        "Droit à la portabilité de vos données",
        "Droit d'opposition au traitement de vos données",
      ]},
    ],
  },
  {
    icon: Phone,
    color: "#D4A574",
    light: "#F8EEE0",
    title: "Contact & exercice des droits",
    content: [
      { type: "text", value: "Pour exercer vos droits ou pour toute question relative à cette politique, contactez l'administrateur de votre équipe RASED." },
      { type: "text", value: "Vous pouvez également contacter la CNIL (Commission Nationale de l'Informatique et des Libertés) sur cnil.fr en cas de litige." },
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
              <h1 className="text-white font-bold text-2xl leading-tight">Politique de confidentialité</h1>
              <p className="text-white/50 text-sm mt-1">
                Mise à jour le {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Badge RGPD */}
          <div className="mt-5 flex items-center gap-2 bg-[#D4A574]/10 border border-[#D4A574]/20 rounded-xl px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-[#34C48A] animate-pulse shrink-0" />
            <p className="text-white/80 text-xs leading-snug">
              Cette application est <span className="text-[#D4A574] font-semibold">conforme au RGPD</span> — vos données et celles des élèves sont traitées dans le respect de la réglementation européenne.
            </p>
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