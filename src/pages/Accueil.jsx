import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, ClipboardList, TreePine, BarChart2, BookOpen, Shield, Search, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";

const BG_IMAGE = "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80";
const ITEMS_PER_PAGE = 5;

export default function Accueil() {
  const navigate = useNavigate();
  const [notAuthenticated, setNotAuthenticated] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [eleves, setEleves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);

  // Redirect to register if no profession, or show login screen if not authenticated
  useEffect(() => {
    base44.auth.me().then(user => {
      if (user && !user.profession) setShowRegisterPopup(true);
    }).catch(() => {
      setNotAuthenticated(true);
    });
  }, []);

  const loadEleves = async () => {
    const [fiches, diagnostics] = await Promise.all([
      base44.entities.FicheEleve.list('-created_date', 100).catch(() => []),
      base44.entities.Diagnostic.list('-created_date', 200).catch(() => []),
    ]);
    
    // Nettoyer les diagnostics orphelins
    const ficheKeys = new Set(fiches.map(f => `${f.prenom}|${f.nom}`.toLowerCase()));
    const orphanedDiags = diagnostics.filter(
      d => !ficheKeys.has(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase())
    );
    for (const d of orphanedDiags) {
      await base44.entities.Diagnostic.delete(d.id).catch(() => {});
    }
    
    const map = new Map();
    fiches.forEach(f => {
      const key = `${f.prenom}|${f.nom}`.toLowerCase();
      map.set(key, { prenom: f.prenom, nom: f.nom, classe: f.classe, lastDate: f.date || f.created_date, profession: f.createdByProfession });
    });
    diagnostics.filter(d => ficheKeys.has(`${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase())).forEach(d => {
      const key = `${d.eleve_prenom}|${d.eleve_nom}`.toLowerCase();
      if (!map.has(key)) map.set(key, { prenom: d.eleve_prenom, nom: d.eleve_nom, lastDate: d.created_date });
      else if (!map.get(key).lastDate) map.get(key).lastDate = d.created_date;
    });
    setEleves([...map.values()]);
    setPage(1);
  };

  useEffect(() => {
    loadEleves();
    const unsubFiche = base44.entities.FicheEleve.subscribe(() => loadEleves());
    const unsubDiag = base44.entities.Diagnostic.subscribe(() => loadEleves());
    return () => {
      unsubFiche();
      unsubDiag();
    };
  }, []);

  const filtered = eleves.filter(e => {
    const nameMatch = `${e.prenom} ${e.nom}`.toLowerCase().includes(searchTerm.toLowerCase());
    const classMatch = !classFilter || e.classe === classFilter;
    return nameMatch && classMatch;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageEleves = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (showRegisterPopup) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm mx-4 text-center">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Bienvenue !</h2>
          <p className="text-sm text-[#0F172A]/70 mb-6 leading-relaxed">
            Pour finaliser votre inscription et accéder à l'application, rendez-vous dans la section <strong>Équipe RASED</strong> et complétez votre profil.
          </p>
          <button
            onClick={() => navigate('/equipe-rased')}
            className="w-full bg-[#0F172A] text-white font-semibold px-6 py-3 rounded-full hover:bg-[#1E293B] transition-all"
          >
            Aller dans Équipe RASED
          </button>
        </div>
      </div>
    );
  }

  if (notAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, rgba(10,30,80,1) 0%, rgba(8,20,70,1) 100%)' }}>
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#7EB8F7', fontFamily: 'serif' }}>Arbre décisionnel RASED</h1>
        <p className="text-white/60 text-sm mb-8">Connectez-vous pour accéder à l&apos;application</p>
        <button
          onClick={() => base44.auth.redirectToLogin()}
          className="bg-white text-[#0F172A] font-semibold px-8 py-3 rounded-full shadow-lg hover:bg-white/90 transition-all"
        >
          Se connecter
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-20">
      {/* Full-screen background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${BG_IMAGE})` }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 z-0" style={{ background: 'linear-gradient(180deg, rgba(10,30,80,0.88) 0%, rgba(15,50,120,0.75) 45%, rgba(8,20,70,0.92) 100%)' }} />

      <HamburgerMenu />

      <div className="relative z-10 flex flex-col items-center px-5 pt-14 pb-6 max-w-lg mx-auto w-full">

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }}
          className="text-center font-bold text-3xl mb-2 leading-tight"
          style={{ color: '#7EB8F7', fontFamily: 'serif' }}
        >
          Arbre décisionnel RASED
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-white/80 text-sm text-center mb-8 leading-snug">
          Outil d&apos;aide à la formulation d&apos;hypothèses diagnostiques
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col gap-3 w-full max-w-xs">
          <Link to="/fiche-eleve">
            <button className="w-full flex items-center justify-center gap-2 bg-white/90 hover:bg-white text-[#0F172A] font-semibold text-base rounded-full px-6 py-3.5 shadow-lg transition-all">
              <ClipboardList className="w-5 h-5" />
              Nouvelle observation
              <span className="ml-1 w-6 h-6 rounded-full border-2 border-[#0F172A]/30 flex items-center justify-center text-xs font-bold">+</span>
            </button>
          </Link>
          <Link to="/evaluation-domains">
            <button className="w-full flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 border border-white/50 text-white font-semibold text-base rounded-full px-6 py-3.5 backdrop-blur-sm shadow transition-all">
              <TreePine className="w-5 h-5" />
              Arbre décisionnel
            </button>
          </Link>
        </motion.div>

        {/* Cards section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full mt-10 grid grid-cols-2 gap-3 items-start"
        >
          {/* Elèves card - left */}
          <div
            className="rounded-2xl border border-[#3B82F6]/40 p-4 flex flex-col gap-2 cursor-pointer"
            style={{ background: 'rgba(10,18,40,0.65)', backdropFilter: 'blur(12px)' }}
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-base">Elèves</span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#3B82F6', color: '#fff' }}>Gestion</span>
            </div>
            <p className="text-white/60 text-[10px] leading-snug">Fiches et historique des diagnostics</p>

            {/* Search */}
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 mt-1"
              style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(59,130,246,0.3)' }}
              onClick={e => e.stopPropagation()}
            >
              <Search className="w-3.5 h-3.5 text-white/50 shrink-0" />
              <input
                type="text"
                placeholder="Chercher..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="bg-transparent text-white text-[11px] placeholder-white/40 outline-none flex-1 min-w-0"
              />
            </div>

            {/* List */}
            <div
              className="rounded-lg mt-1 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <div className="flex items-center gap-1.5 px-2 py-2 border-b border-white/10">
                <span className="text-[#7EB8F7] font-bold" style={{ fontFamily: 'serif', fontSize: 12 }}>&#936;</span>
                <span className="text-white text-[10px] font-semibold flex-1">Elèves /</span>
                <span className="text-white/50 text-[9px]">{filtered.length} élève{filtered.length !== 1 ? 's' : ''}</span>
              </div>
              {pageEleves.length === 0 ? (
                <p className="text-white/40 text-[10px] text-center py-3">Aucun élève trouvé</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {pageEleves.map((e, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2 py-2 cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={ev => { ev.stopPropagation(); navigate(`/historique?eleve=${encodeURIComponent(`${e.prenom} ${e.nom}`)}`); }}
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(59,130,246,0.25)' }}>
                        <span className="text-[8px] font-bold text-[#7EB8F7]">{e.prenom?.[0]}{e.nom?.[0]}</span>
                      </div>
                      <span className="text-white text-[10px] font-medium flex-1 truncate">{e.prenom} {e.nom}</span>
                      {e.lastDate && (
                        <span className="text-white/40 text-[8px] shrink-0">
                          {new Date(e.lastDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-1.5 border-t border-white/10">
                  <button onClick={ev => { ev.stopPropagation(); setPage(Math.max(1, page - 1)); }} disabled={page === 1} className="text-white/50 disabled:opacity-30 text-[9px] px-1.5 py-0.5 rounded">←</button>
                  <span className="text-white/50 text-[8px]">{page}/{totalPages}</span>
                  <button onClick={ev => { ev.stopPropagation(); setPage(Math.min(totalPages, page + 1)); }} disabled={page === totalPages} className="text-white/50 disabled:opacity-30 text-[9px] px-1.5 py-0.5 rounded">→</button>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-3">
            <p className="text-[#7EB8F7] font-bold text-sm" style={{ fontFamily: 'serif' }}>Autres sections</p>

            <Link to="/items-professionnels">
              <div
                className="rounded-2xl border border-[#3B82F6]/30 p-3 flex flex-col gap-2 hover:border-[#3B82F6]/60 transition-all"
                style={{ background: 'rgba(10,18,40,0.55)', backdropFilter: 'blur(10px)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <BookOpen className="w-5 h-5 text-[#7EB8F7]" />
                </div>
                <p className="font-bold text-white text-sm leading-tight">Ressources</p>
                <p className="text-white/55 text-[10px]">Guides professionnels</p>
              </div>
            </Link>

            <Link to="/politique-confidentialite">
              <div
                className="rounded-2xl border border-white/15 p-3 flex flex-col gap-2 hover:border-[#3B82F6]/40 transition-all"
                style={{ background: 'rgba(10,18,40,0.55)', backdropFilter: 'blur(10px)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Shield className="w-5 h-5 text-white/60" />
                </div>
                <p className="font-bold text-white text-sm leading-tight">Confidentialité</p>
                <p className="text-white/55 text-[10px]">RGPD compliant</p>
              </div>
            </Link>

            <Link to="/equipe-rased">
              <div
                className="rounded-2xl border border-white/15 p-3 flex flex-col gap-2 hover:border-[#3B82F6]/40 transition-all"
                style={{ background: 'rgba(10,18,40,0.55)', backdropFilter: 'blur(10px)' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Users className="w-5 h-5 text-white/60" />
                </div>
                <p className="font-bold text-white text-sm leading-tight">Equipe RASED</p>
                <p className="text-white/55 text-[10px]">Voir l&apos;équipe</p>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom nav bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around px-4 py-3 border-t border-white/10"
        style={{ background: 'rgba(8,15,35,0.92)', backdropFilter: 'blur(16px)' }}
      >
        {[
          { label: 'Accueil', icon: Home, to: '/', active: true },
          { label: 'Elèves', icon: Users, to: '/dashboard', active: false },
          { label: 'Arbre', icon: TreePine, to: '/evaluation-domains', active: false },
          { label: 'Stats', icon: BarChart2, to: '/stats-annuelles', active: false },
        ].map(({ label, icon: Icon, to, active }) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-1">
            <Icon className="w-5 h-5" style={{ color: active ? '#7EB8F7' : 'rgba(255,255,255,0.45)' }} />
            <span className="text-[10px] font-medium" style={{ color: active ? '#7EB8F7' : 'rgba(255,255,255,0.45)' }}>{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}