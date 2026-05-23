import { Home, Users, TreePine, BarChart2, Search, Bell, Shield, Plus } from 'lucide-react';

export default function ModelsPreview() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Variantes de Layout</h1>

      {/* Modèle 1: 2 Colonnes Classique */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Modèle 1: 2 Colonnes (Actuel)</h2>
        <div className="bg-blue-900 rounded-lg p-6 min-h-96 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Élèves */}
          <div className="bg-blue-950 text-white rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-2">Élèves</h3>
            <p className="text-sm text-blue-200 mb-4">Fiches et historique</p>
            <div className="bg-blue-900 rounded-lg p-3">Liste élèves</div>
          </div>
          {/* Cartes droite */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-medium">sections</p>
            <div className="bg-blue-950 text-white rounded-2xl p-4">📖 Ressources</div>
            <div className="bg-blue-950 text-white rounded-2xl p-4">🛡️ Confidentialité</div>
            <div className="bg-blue-950 text-white rounded-2xl p-4">👥 Équipe</div>
          </div>
        </div>
      </div>

      {/* Modèle 2: 3 Colonnes */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Modèle 2: 3 Colonnes</h2>
        <div className="bg-blue-900 rounded-lg p-6 min-h-96 grid grid-cols-3 gap-4">
          <div className="bg-blue-950 text-white rounded-2xl p-4">📖 Ressources</div>
          <div className="bg-blue-950 text-white rounded-2xl p-4">Élèves Grande</div>
          <div className="bg-blue-950 text-white rounded-2xl p-4">🛡️ Confidentialité</div>
        </div>
      </div>

      {/* Modèle 3: Asymétrique (Grand à droite) */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Modèle 3: Élèves à droite (Grand)</h2>
        <div className="bg-blue-900 rounded-lg p-6 min-h-96 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <div className="bg-blue-950 text-white rounded-2xl p-4">📖 Ressources</div>
            <div className="bg-blue-950 text-white rounded-2xl p-4">🛡️ Confidentialité</div>
            <div className="bg-blue-950 text-white rounded-2xl p-4">👥 Équipe</div>
          </div>
          <div className="bg-blue-950 text-white rounded-2xl p-6">Élèves</div>
        </div>
      </div>

      {/* Modèle 4: Stack Vertical (Mobile-First) */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Modèle 4: Stack Vertical Complet</h2>
        <div className="bg-blue-900 rounded-lg p-6 min-h-96 flex flex-col gap-4 max-w-md">
          <div className="bg-blue-950 text-white rounded-2xl p-6">Élèves Grand</div>
          <div className="bg-blue-950 text-white rounded-2xl p-4">📖 Ressources</div>
          <div className="bg-blue-950 text-white rounded-2xl p-4">🛡️ Confidentialité</div>
          <div className="bg-blue-950 text-white rounded-2xl p-4">👥 Équipe</div>
        </div>
      </div>

      {/* Modèle 5: Grille 2x2 */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Modèle 5: Grille 2x2 Équilibrée</h2>
        <div className="bg-blue-900 rounded-lg p-6 min-h-96 grid grid-cols-2 gap-4">
          <div className="bg-blue-950 text-white rounded-2xl p-4">📖 Ressources</div>
          <div className="bg-blue-950 text-white rounded-2xl p-4">🛡️ Confidentialité</div>
          <div className="col-span-2 bg-blue-950 text-white rounded-2xl p-6">Élèves</div>
        </div>
      </div>

      {/* Modèle 6: Carousel/Tabs */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">Modèle 6: Onglets/Tabs</h2>
        <div className="bg-blue-900 rounded-lg p-6 min-h-96">
          <div className="flex gap-2 mb-4 border-b border-blue-800">
            <button className="px-4 py-2 border-b-2 border-blue-400 text-white">Élèves</button>
            <button className="px-4 py-2 text-blue-300">Ressources</button>
            <button className="px-4 py-2 text-blue-300">Confidentialité</button>
          </div>
          <div className="bg-blue-950 text-white rounded-2xl p-6">Contenu Élèves</div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">Quel modèle préférez-vous?</h3>
        <p className="text-blue-800 text-sm">Dites-moi le numéro (1-6) et je l'implémente immédiatement!</p>
      </div>
    </div>
  );
}