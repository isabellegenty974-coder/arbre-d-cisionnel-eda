import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Phone, Mail, Check } from 'lucide-react';

const LIENS = ['Père', 'Mère', 'Tuteur', 'Autre responsable légal'];

const inputStyle = {
  width: '100%', padding: '8px 10px', borderRadius: 7,
  border: '1px solid #D8E1EE', fontSize: 13, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'Inter, sans-serif', height: 36,
};

const labelStyle = {
  fontSize: 11.5, fontWeight: 600, color: '#566880',
  display: 'block', marginBottom: 5,
};

function ResponsableForm({ label, data, onChange }) {
  const d = data || {};
  const set = (field, value) => onChange({ ...d, [field]: value });

  return (
    <div style={{ background: '#F8FAFD', borderRadius: 10, padding: 14, border: '1px solid #D8E1EE', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3353' }}>{label}</div>
      <div>
        <label style={labelStyle}>Lien avec l'élève</label>
        <select value={d.lien || ''} onChange={e => set('lien', e.target.value)} style={inputStyle}>
          <option value="">— Sélectionner —</option>
          {LIENS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Prénom et Nom</label>
        <input type="text" value={d.prenom_nom || ''} onChange={e => set('prenom_nom', e.target.value)} placeholder="Ex: Marie Dupont" style={inputStyle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Téléphone portable</label>
          <input type="tel" value={d.tel_portable || ''} onChange={e => set('tel_portable', e.target.value)} placeholder="0692 ..." style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Téléphone fixe (optionnel)</label>
          <input type="tel" value={d.tel_fixe || ''} onChange={e => set('tel_fixe', e.target.value)} placeholder="0262 ..." style={inputStyle} />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Email (optionnel)</label>
        <input type="email" value={d.email || ''} onChange={e => set('email', e.target.value)} placeholder="exemple@email.fr" style={inputStyle} />
      </div>
    </div>
  );
}

function ResponsableDisplay({ data }) {
  const d = data || {};
  const hasData = d.lien || d.prenom_nom || d.tel_portable || d.tel_fixe || d.email;
  if (!hasData) return <p style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic' }}>Aucun responsable renseigné</p>;

  return (
    <div style={{ background: '#FAFBFD', border: '1px solid #D8E1EE', borderRadius: 10, padding: 14 }}>
      {d.lien && <div style={{ fontSize: 11, fontWeight: 700, color: '#3B82C4', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>{d.lien}</div>}
      {d.prenom_nom && <div style={{ fontSize: 13.5, fontWeight: 600, color: '#182840', marginBottom: 10 }}>{d.prenom_nom}</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {d.tel_portable && (
          <a href={`tel:${d.tel_portable.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#182840', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, background: '#EAF2FB', border: '1px solid #D8E1EE' }}>
            <Phone size={14} color="#3B82C4" /> <span style={{ fontWeight: 600 }}>{d.tel_portable}</span>
          </a>
        )}
        {d.tel_fixe && (
          <a href={`tel:${d.tel_fixe.replace(/\s/g, '')}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#182840', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, background: '#F0F3F8', border: '1px solid #D8E1EE' }}>
            <Phone size={14} color="#566880" /> {d.tel_fixe}
          </a>
        )}
        {d.email && (
          <a href={`mailto:${d.email}`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#182840', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, background: '#E4F4ED', border: '1px solid #D8E1EE' }}>
            <Mail size={14} color="#1E7A52" /> {d.email}
          </a>
        )}
      </div>
    </div>
  );
}

export default function ResponsablesSection({ ficheId, responsable1, responsable2, langueMaison, autorisationParentale, dateAutorisation, onUpdate }) {
  const [r1, setR1] = useState(responsable1 || {});
  const [r2, setR2] = useState(responsable2 || {});
  const [langue, setLangue] = useState(langueMaison || '');
  const [auto, setAuto] = useState(autorisationParentale || false);
  const [dateAuto, setDateAuto] = useState(dateAutorisation || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.entities.FicheEleve.update(ficheId, {
        responsable1: r1,
        responsable2: r2,
        langue_maison: langue,
        autorisation_parentale: auto,
        date_autorisation: dateAuto,
      });
      onUpdate?.({
        responsable1: r1, responsable2: r2,
        langue_maison: langue, autorisation_parentale: auto, date_autorisation: dateAuto,
      });
      setEditing(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 1800);
    } catch (e) {
      console.error('Erreur sauvegarde responsables:', e);
    } finally {
      setSaving(false);
    }
  };

  const hasResp1 = (responsable1 && (responsable1.lien || responsable1.prenom_nom || responsable1.tel_portable));
  const hasResp2 = (responsable2 && (responsable2.lien || responsable2.prenom_nom || responsable2.tel_portable));

  if (!editing) {
    return (
      <div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ResponsableDisplay data={responsable1} />
          <ResponsableDisplay data={responsable2} />

          <div style={{ background: '#F8FAFD', border: '1px solid #D8E1EE', borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#566880', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 10 }}>Informations complémentaires</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 12.5, color: '#566880', minWidth: 110 }}>Langue à la maison :</span>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#182840' }}>{langueMaison || '—'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 12.5, color: '#566880', minWidth: 110 }}>Autorisation RASED :</span>
                {autorisationParentale ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#1E7A52', background: '#E4F4ED', padding: '2px 9px', borderRadius: 10 }}>
                    <Check size={12} /> Oui {dateAutorisation && `· ${new Date(dateAutorisation).toLocaleDateString('fr-FR')}`}
                  </span>
                ) : (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#B85C1A', background: '#FEF0E4', padding: '2px 9px', borderRadius: 10 }}>Non</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setEditing(true)} style={{ fontSize: 12.5, color: '#3B82C4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            ✏️ Modifier
          </button>
          {flash && <span style={{ fontSize: 11, fontWeight: 600, color: '#1E7A52' }}>✅ Enregistré</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ResponsableForm label="Responsable 1" data={r1} onChange={setR1} />
        <ResponsableForm label="Responsable 2 (optionnel)" data={r2} onChange={setR2} />

        <div style={{ background: '#F8FAFD', borderRadius: 10, padding: 14, border: '1px solid #D8E1EE', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1A3353' }}>Informations complémentaires</div>
          <div>
            <label style={labelStyle}>Langue parlée à la maison (optionnel)</label>
            <input type="text" value={langue} onChange={e => setLangue(e.target.value)} placeholder="Ex: créole, français..." style={inputStyle} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: '#182840', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={auto} onChange={e => setAuto(e.target.checked)} style={{ width: 18, height: 18 }} />
              Autorisation parentale obtenue pour le suivi RASED
            </label>
          </div>
          {auto && (
            <div>
              <label style={labelStyle}>Date de l'autorisation</label>
              <input type="date" value={dateAuto} onChange={e => setDateAuto(e.target.value)} style={inputStyle} />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
        <button onClick={() => setEditing(false)} disabled={saving} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: 'transparent', border: '1px solid #D8E1EE', cursor: 'pointer', color: '#566880' }}>
          Annuler
        </button>
        <button onClick={handleSave} disabled={saving} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 7, background: '#1A3353', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}