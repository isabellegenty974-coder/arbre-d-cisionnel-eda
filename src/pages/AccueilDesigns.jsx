import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, TreePine, BarChart2, Plus, Bell, Shield, ArrowRight } from 'lucide-react';

export default function AccueilDesigns() {
  const [selected, setSelected] = useState(null);

  // Design 1: Flat Modern
  const Design1 = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black mb-2">Arbre Décisionnel</h1>
          <h2 className="text-4xl font-bold text-slate-300 mb-4">RASED</h2>
          <p className="text-slate-400 text-lg">Diagnostic et recommandations pour les élèves</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button className="bg-white text-slate-900 font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-slate-100 transition transform hover:scale-105">
            <Plus className="w-6 h-6" />
            Nouvelle observation
          </button>
          <button className="border-2 border-white text-white font-bold py-4 px-6 rounded-full flex items-center justify-center gap-3 hover:bg-white/10 transition">
            <TreePine className="w-6 h-6" />
            Arbre décisionnel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-700/50 backdrop-blur rounded-2xl p-8 border border-slate-600">
            <h3 className="text-2xl font-bold mb-4">Élèves</h3>
            <p className="text-slate-300 text-sm mb-6">Gestion des fiches et historiques diagnostiques</p>
            <div className="bg-slate-600/50 rounded-lg p-4 text-slate-200 text-sm mb-4">0 élève</div>
            <button className="w-full bg-slate-600 hover:bg-slate-500 py-2 rounded-lg transition font-semibold">
              Voir tous les élèves
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-600/80 backdrop-blur rounded-2xl p-6 hover:bg-emerald-500 transition cursor-pointer">
              <div className="text-3xl mb-2">📖</div>
              <h4 className="font-bold text-lg">Ressources</h4>
              <p className="text-emerald-100 text-sm">Guides professionnels</p>
            </div>
            <div className="bg-blue-600/80 backdrop-blur rounded-2xl p-6 hover:bg-blue-500 transition cursor-pointer">
              <Shield className="w-8 h-8 mb-2" />
              <h4 className="font-bold text-lg">Confidentialité</h4>
              <p className="text-blue-100 text-sm">Conforme au RGPD</p>
            </div>
            <div className="bg-purple-600/80 backdrop-blur rounded-2xl p-6 hover:bg-purple-500 transition cursor-pointer">
              <Users className="w-8 h-8 mb-2" />
              <h4 className="font-bold text-lg">Équipe</h4>
              <p className="text-purple-100 text-sm">Voir l'équipe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Design 2: Neumorphic
  const Design2 = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-full px-6 py-2 text-sm font-bold mb-4">
            RASED Tool
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-2">Arbre Décisionnel</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">Outil intelligent d'aide à la formulation d'hypothèses diagnostiques pour les élèves</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <button className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl transition transform hover:-translate-y-1 shadow-lg">
            <Plus className="w-6 h-6" />
            Nouvelle observation
          </button>
          <button className="bg-white text-blue-600 font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition">
            <TreePine className="w-6 h-6" />
            Arbre décisionnel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition border-2 border-gray-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Élèves</h3>
            <p className="text-gray-600 mb-6">Gestion complète des fiches et historiques</p>
            <div className="text-3xl font-bold text-blue-600 mb-4">0</div>
            <button className="w-full bg-blue-50 text-blue-600 hover:bg-blue-100 py-3 rounded-lg font-semibold transition">
              Consulter
            </button>
          </div>

          <div className="md:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer transform hover:scale-105">
              <div className="text-4xl mb-2">📖</div>
              <h4 className="font-bold text-lg">Ressources</h4>
              <p className="text-emerald-100 text-sm">Guides pro</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer transform hover:scale-105">
              <Shield className="w-8 h-8 mb-2" />
              <h4 className="font-bold text-lg">Sécurité</h4>
              <p className="text-blue-100 text-sm">RGPD compliant</p>
            </div>
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer transform hover:scale-105 col-span-2">
              <Users className="w-8 h-8 mb-2" />
              <h4 className="font-bold text-lg">Équipe RASED</h4>
              <p className="text-purple-100 text-sm">Collaborez avec votre équipe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Design 3: Card Heavy
  const Design3 = () => (
    <div className="min-h-screen bg-white pb-24">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black mb-3">Arbre RASED</h1>
          <p className="text-lg text-white/90">Plateforme collaborative d'analyse diagnostique</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-indigo-600 hover:shadow-2xl transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Nouvelle observation</h3>
            </div>
            <p className="text-gray-600 text-sm">Créer une fiche diagnostic pour un élève</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-purple-600 hover:shadow-2xl transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TreePine className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Arbre décisionnel</h3>
            </div>
            <p className="text-gray-600 text-sm">Naviguer l'arbre d'analyse diagnostic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Élèves</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">Gérez et suivez les fiches diagnostiques de tous vos élèves en un seul endroit</p>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-gray-900">0</span>
              <span className="text-gray-600">élève(s) enregistré(s)</span>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition">
              Voir les élèves <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer">
              <div className="text-4xl mb-3">📖</div>
              <h4 className="font-bold text-lg">Ressources</h4>
              <p className="text-white/90 text-sm">Accédez aux guides et documents</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer">
              <Shield className="w-8 h-8 mb-3" />
              <h4 className="font-bold text-lg">Confidentialité</h4>
              <p className="text-white/90 text-sm">Données sécurisées et RGPD</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition cursor-pointer">
              <Users className="w-8 h-8 mb-3" />
              <h4 className="font-bold text-lg">Équipe RASED</h4>
              <p className="text-white/90 text-sm">Collaborez avec vos collègues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Design 4: Minimalist
  const Design4 = () => (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-200 px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-black text-gray-900 mb-2 tracking-tight">Arbre Décisionnel</h1>
          <h2 className="text-3xl font-light text-gray-600">RASED</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <button className="bg-gray-900 text-white font-semibold py-4 px-8 rounded text-lg hover:bg-gray-800 transition flex items-center justify-center gap-3">
            <Plus className="w-5 h-5" />
            Nouvelle observation
          </button>
          <button className="bg-white text-gray-900 font-semibold py-4 px-8 rounded text-lg border-2 border-gray-900 hover:bg-gray-50 transition flex items-center justify-center gap-3">
            <TreePine className="w-5 h-5" />
            Arbre décisionnel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="border-l-4 border-gray-900 pl-8">
            <h3 className="text-4xl font-black text-gray-900 mb-2">Élèves</h3>
            <p className="text-gray-600 text-lg mb-8">Gestion des fiches et historiques</p>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900">0 élève enregistré</p>
              </div>
              <button className="text-gray-900 font-semibold hover:text-gray-600 transition flex items-center gap-2">
                Consulter les élèves <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-emerald-600 pl-6">
              <h4 className="text-xl font-black text-gray-900">📖 Ressources</h4>
              <p className="text-gray-600 mt-1">Guides professionnels</p>
            </div>
            <div className="border-l-4 border-blue-600 pl-6">
              <h4 className="text-xl font-black text-gray-900">🛡️ Confidentialité</h4>
              <p className="text-gray-600 mt-1">Conforme au RGPD</p>
            </div>
            <div className="border-l-4 border-purple-600 pl-6">
              <h4 className="text-xl font-black text-gray-900">👥 Équipe</h4>
              <p className="text-gray-600 mt-1">Voir l'équipe RASED</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-gray-900 mb-2 text-center">Modèles pour l'Accueil</h1>
        <p className="text-gray-600 text-center mb-8">Cliquez sur un design pour le voir en détail</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {[
            { id: 1, name: 'Design 1: Modern Dark', component: Design1 },
            { id: 2, name: 'Design 2: Neumorphic', component: Design2 },
            { id: 3, name: 'Design 3: Gradient Cards', component: Design3 },
            { id: 4, name: 'Design 4: Minimalist', component: Design4 },
          ].map((design) => (
            <button
              key={design.id}
              onClick={() => setSelected(design.id)}
              className={`p-6 rounded-lg border-2 transition text-left font-semibold ${
                selected === design.id
                  ? 'bg-blue-50 border-blue-500 text-blue-900'
                  : 'bg-white border-gray-200 text-gray-900 hover:border-gray-400'
              }`}
            >
              {design.name}
            </button>
          ))}
        </div>

        {selected && (
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="h-screen overflow-auto">
              {selected === 1 && <Design1 />}
              {selected === 2 && <Design2 />}
              {selected === 3 && <Design3 />}
              {selected === 4 && <Design4 />}
            </div>
          </div>
        )}

        {!selected && (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">Sélectionnez un design pour l'aperçu</p>
          </div>
        )}
      </div>
    </div>
  );
}