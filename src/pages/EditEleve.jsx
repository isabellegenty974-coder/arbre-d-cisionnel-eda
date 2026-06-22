import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import ScreenLayout from "@/components/tree/ScreenLayout";
import HamburgerMenu from "@/components/Navigation/HamburgerMenu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Check, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function EditEleve() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  const [form, setForm] = useState({ nom: "", prenom: "", classe: "", age: "", observations: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState(null);

  const getAnneeFromDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth();
    return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  useEffect(() => {
    if (!id) return;
    base44.entities.FicheEleve.filter({ id }).then((results) => {
      const rec = results[0];
      if (rec) {
        setRecord(rec);
        setForm({
          nom: rec.nom || "",
          prenom: rec.prenom || "",
          classe: rec.classe || "",
          age: rec.age || "",
          observations: rec.observations || "",
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const annee_scolaire = getAnneeFromDate(record?.created_date);
    await base44.entities.FicheEleve.update(id, {
      nom: form.nom,
      prenom: form.prenom,
      classe: form.classe,
      age: form.age ? Number(form.age) : undefined,
      observations: form.observations,
      annee_scolaire: annee_scolaire || undefined,
    });
    navigate(`/detail-fiche?id=${id}`);
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

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
            {[
              { id: "nom", label: "Nom", type: "text" },
              { id: "prenom", label: "Prénom", type: "text" },
              { id: "classe", label: "Classe", type: "text" },
              { id: "age", label: "Âge", type: "number" },
            ].map(({ id: field, label, type }) => (
              <div key={field}>
                <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
                <Input
                  type={type}
                  value={form[field]}
                  onChange={set(field)}
                  placeholder={label}
                />
              </div>
            ))}

            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Observations</label>
              <Textarea
                value={form.observations}
                onChange={set("observations")}
                placeholder="Observations complémentaires"
                rows={4}
                className="resize-none"
              />
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