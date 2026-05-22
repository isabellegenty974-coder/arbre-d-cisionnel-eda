import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, ClipboardList, TreePine, BarChart2, BookOpen, Shield, ChevronRight, Menu, User } from "lucide-react";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

export default function Accueil() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] pb-24">
      <HamburgerMenu />

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1565C0] to-[#1E88E5] px-5 pt-12 pb-6">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow">
            <span className="text-[#1565C0] text-2xl font-bold" style={{ fontFamily: 'serif' }}>Ψ</span>
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg leading-tight">Arbre décisionnel EDA</h1>
            <p className="text-blue-100 text-xs leading-snug mt-0.5">Outil d'aide à la formulation d'hypothèses diagnostiques</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* 2-col grid: Arbre + Nouvelle observation */}
        <div className="grid grid-cols-2 gap-4">
          {/* Arbre décisionnel */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Link to="/evaluation-domains" className="group block h-full">
              <div className="bg-white rounded-2xl border-2 border-[#F97316] p-4 h-full flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center mb-3 shadow">
                  <TreePine className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold text-foreground text-sm leading-tight mb-1">Arbre décisionnel</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 mb-2">Analyse</span>
                <p className="text-xs text-muted-foreground leading-snug flex-1">Analyse approfondie par domaine</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-2 group-hover:text-orange-500 transition-colors" />
              </div>
            </Link>
          </motion.div>

          {/* Nouvelle observation */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/fiche-eleve" className="group block h-full">
              <div className="bg-white rounded-2xl border-2 border-[#00897B] p-4 h-full flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00897B] to-[#00695C] flex items-center justify-center mb-3 shadow">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <p className="font-bold text-foreground text-sm leading-tight mb-1">Nouvelle observation</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 mb-2">Créer</span>
                <p className="text-xs text-muted-foreground leading-snug flex-1">Créer une fiche élève et observer</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 mt-2 group-hover:text-teal-600 transition-colors" />
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Mes élèves — full width */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Link to="/dashboard" className="group block">
            <div className="bg-white rounded-2xl border-2 border-[#1565C0] shadow-sm hover:shadow-md transition-all overflow-hidden">
              {/* Top row */}
              <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1565C0] to-[#1E88E5] flex items-center justify-center shadow shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">Mes élèves</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Gestion</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Fiches et historique des diagnostics</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-blue-600 transition-colors shrink-0" />
              </div>
              {/* Preview strip */}
              <div className="mx-4 mb-4 rounded-xl bg-[#F0F4F8] border border-blue-100 p-3">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-100">
                  <div className="w-5 h-5 rounded bg-[#1565C0] flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">Ψ</span>
                  </div>
                  <span className="text-xs font-semibold text-foreground">Mes élèves</span>
                </div>
                <div className="space-y-1.5">
                  {["Dernières fiches", "Élèves à suivre", "Activités récentes"].map((label) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-blue-200 shrink-0" />
                      <div className="flex-1 h-2 bg-blue-100 rounded-full" />
                      <div className="w-10 h-2 bg-blue-50 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Divider */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground font-medium">Autres sections</span>
          <div className="flex-1 h-px bg-border" />
        </motion.div>

        {/* Secondary 3-col grid */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid grid-cols-3 gap-3">
          <Link to="/stats-annuelles" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-blue-300 transition-colors">
              <BarChart2 className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Statistiques</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Suivi annuel</p>
          </Link>
          <Link to="/items-professionnels" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-teal-300 transition-colors">
              <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-teal-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Ressources</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Guides & professionnels</p>
          </Link>
          <Link to="/politique-confidentialite" className="group bg-white rounded-2xl border border-border p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-[#F0F4F8] border border-border flex items-center justify-center mb-2 group-hover:border-gray-400 transition-colors">
              <Shield className="w-5 h-5 text-muted-foreground group-hover:text-gray-600 transition-colors" />
            </div>
            <p className="font-bold text-foreground text-xs mb-1">Confidentialité</p>
            <p className="text-[10px] text-muted-foreground leading-tight">RGPD compliant</p>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}