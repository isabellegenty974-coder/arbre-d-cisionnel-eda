import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

const ECOLES = ['Célimène', 'Malraux', 'Lacaussade élémentaire', 'Lacaussade maternelle', 'Lorraine', 'Vergès', 'Julenon', 'Joron', 'Jamin', 'Langevin'];
const MONTHS = [
  { v: '1', l: 'Janvier' }, { v: '2', l: 'Février' }, { v: '3', l: 'Mars' },
  { v: '4', l: 'Avril' }, { v: '5', l: 'Mai' }, { v: '6', l: 'Juin' },
  { v: '7', l: 'Juillet' }, { v: '8', l: 'Août' }, { v: '9', l: 'Septembre' },
  { v: '10', l: 'Octobre' }, { v: '11', l: 'Novembre' }, { v: '12', l: 'Décembre' },
];

function computeAge(isoDate) {
  if (!isoDate) return null;
  const today = new Date();
  const birth = new Date(isoDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

function daysInMonth(mois, annee) {
  if (!mois || !annee) return 31;
  return new Date(Number(annee), Number(mois), 0).getDate();
}

export default function EditEleve() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const [form, setForm] = useState({ nom: "", prenom: "", ecole: "", classe: "" });
  const [jour, setJour] = useState("");
  const [mois, setMois] = useState("");
  const [anneeNaiss, setAnneeNaiss] = useState("");
  const [dateNaissance, setDateNaissance] = useState("");
  const [ageCalcule, setAgeCalcule] = useState(null);
  const [anneeScolaire, setAnneeScolaire] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    base44.entities.FicheEleve.filter({ id }).then((results) => {
      const rec = results[0];
      if (rec) {
        setForm({
          nom: rec.nom || "",
          prenom: rec.prenom || "",
          ecole: rec.ecole || "",
          classe: rec.classe || "",
        });
        setAnneeScolaire(rec.annee_scolaire || "");
        if (rec.date_naissance) {
          const d = new Date(rec.date_naissance);
          setJour(String(d.getDate()));
          setMois(String(d.getMonth() + 1));
          setAnneeNaiss(String(d.getFullYear()));
          setDateNaissance(rec.date_naissance);
          setAgeCalcule(computeAge(rec.date_naissance));
        }
      }
      setLoading(false);
    });
  }, [id]);

  const handleDateNaissance = (j, m, a) => {
    setJour(j); setMois(m); setAnneeNaiss(a);
    if (!j || !m || !a) { setDateNaissance(""); setAgeCalcule(null); return; }
    const iso = `${a}-${m.padStart(2, '0')}-${j.padStart(2, '0')}`;
    setDateNaissance(iso);
    setAgeCalcule(computeAge(iso));
  };

  const handleSave = async () => {
    setSaving(true);
    // annee_scolaire est immuable : on ne la renvoie jamais (rattachement permanent à l'année de création).
    await base44.entities.FicheEleve.update(id, {
      nom: form.nom,
      prenom: form.prenom,
      date_naissance: dateNaissance || undefined,
      age: ageCalcule ?? undefined,
      ecole: form.ecole,
      classe: form.classe,
    });
    navigate(`/detail-fiche?id=${id}`);
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - 3 - i);
  const ecoleOptions = [...new Set([...ECOLES, form.ecole].filter(Boolean))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <HamburgerMenu />
      <ScreenLayout title="Modifier élève">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md mx-auto space-y-5"
          style={{ padding: 20 }}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Nom</label>
              <Input type="text" value={form.nom} onChange={set("nom")} placeholder="Nom" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Prénom</label>
              <Input type="text" value={form.prenom} onChange={set("prenom")} placeholder="Prénom" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Date de naissance</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={jour}
                  onChange={e => handleDateNaissance(e.target.value, mois, anneeNaiss)}
                  className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Jour</option>
                  {Array.from({ length: daysInMonth(mois, anneeNaiss) }, (_, i) => i + 1).map(d => (
                    <option key={d} value={String(d)}>{d}</option>
                  ))}
                </select>
                <select
                  value={mois}
                  onChange={e => handleDateNaissance(jour, e.target.value, anneeNaiss)}
                  className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Mois</option>
                  {MONTHS.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                </select>
                <select
                  value={anneeNaiss}
                  onChange={e => handleDateNaissance(jour, mois, e.target.value)}
                  className="h-10 rounded-lg border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Année</option>
                  {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Âge</label>
              <div className="h-10 flex items-center px-3 rounded-lg border border-input bg-gray-50 text-sm font-semibold text-foreground">
                {ageCalcule !== null ? `${ageCalcule} ans` : '—'}
              </div>
              <p className="text-xs text-gray-400 mt-1">Calculé automatiquement à partir de la date de naissance</p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">École</label>
              <select
                value={form.ecole}
                onChange={set("ecole")}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">-- Sélectionner une école --</option>
                {ecoleOptions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Classe</label>
              <Input type="text" value={form.classe} onChange={set("classe")} placeholder="Ex : CM2" />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Année scolaire <span className="text-xs text-gray-400">🔒 immuable</span>
              </label>
              <select
                value={anneeScolaire}
                disabled
                className="w-full h-10 rounded-lg border border-input bg-gray-50 px-3 text-sm text-gray-700 font-medium cursor-not-allowed"
              >
                {anneeScolaire && <option value={anneeScolaire}>{anneeScolaire}</option>}
              </select>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gap-2 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4" />
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>

          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => navigate(`/detail-fiche?id=${id}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
        </motion.div>
      </ScreenLayout>
    </div>
  );
}