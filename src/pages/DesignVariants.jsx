import { Shield, Users, Search, Plus, Bell } from 'lucide-react';

export default function DesignVariants() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-12 text-center">Variantes de Design</h1>

      {/* Design 1: Minimal Clean */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Design 1: Minimal Clean</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="bg-gradient-to-b from-slate-100 to-white py-8 px-4 rounded-lg mb-6">
            <h1 className="text-3xl font-bold text-slate-900 text-center">Arbre décisionnel RASED</h1>
            <p className="text-center text-slate-600 text-sm mt-2">Outil d'aide diagnostique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 hover:border-slate-400 transition">
              <h3 className="font-bold text-slate-900">Élèves</h3>
              <p className="text-sm text-slate-600 mt-2">Gestion des fiches</p>
            </div>
            <div className="space-y-3">
              <div className="bg-white border-2 border-slate-200 rounded-lg p-4">📖 Ressources</div>
              <div className="bg-white border-2 border-slate-200 rounded-lg p-4">🛡️ Confidentialité</div>
              <div className="bg-white border-2 border-slate-200 rounded-lg p-4">👥 Équipe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Design 2: Colorful Gradient */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Design 2: Colorful Gradient</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 py-8 px-4 rounded-lg mb-6 text-white">
            <h1 className="text-3xl font-bold text-center">Arbre décisionnel RASED</h1>
            <p className="text-center text-purple-100 text-sm mt-2">Outil d'aide diagnostique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <h3 className="font-bold text-lg">Élèves</h3>
              <p className="text-sm text-purple-100 mt-2">Gestion des fiches</p>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-lg p-4">📖 Ressources</div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">🛡️ Confidentialité</div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-lg p-4">👥 Équipe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Design 3: Dark Modern */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Design 3: Dark Modern</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="bg-gray-900 py-8 px-4 rounded-lg mb-6 text-white">
            <h1 className="text-3xl font-bold text-center">Arbre décisionnel RASED</h1>
            <p className="text-center text-gray-400 text-sm mt-2">Outil d'aide diagnostique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900 p-4 rounded-lg">
            <div className="bg-gray-800 text-white rounded-lg p-6 border border-gray-700">
              <h3 className="font-bold text-lg">Élèves</h3>
              <p className="text-sm text-gray-300 mt-2">Gestion des fiches</p>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-800 text-white rounded-lg p-4 border border-gray-700">📖 Ressources</div>
              <div className="bg-gray-800 text-white rounded-lg p-4 border border-gray-700">🛡️ Confidentialité</div>
              <div className="bg-gray-800 text-white rounded-lg p-4 border border-gray-700">👥 Équipe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Design 4: Soft Pastel */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Design 4: Soft Pastel</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 py-8 px-4 rounded-lg mb-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Arbre décisionnel RASED</h1>
            <p className="text-center text-gray-700 text-sm mt-2">Outil d'aide diagnostique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-6">
              <h3 className="font-bold text-orange-900">Élèves</h3>
              <p className="text-sm text-orange-700 mt-2">Gestion des fiches</p>
            </div>
            <div className="space-y-3">
              <div className="bg-pink-100 border-2 border-pink-300 rounded-lg p-4 text-pink-900">📖 Ressources</div>
              <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-purple-900">🛡️ Confidentialité</div>
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-blue-900">👥 Équipe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Design 5: Glassmorphism */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Design 5: Glassmorphism</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="bg-gradient-to-b from-blue-400 to-blue-600 py-8 px-4 rounded-lg mb-6 relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-lg opacity-50"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-center text-white">Arbre décisionnel RASED</h1>
              <p className="text-center text-blue-100 text-sm mt-2">Outil d'aide diagnostique</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900">Élèves</h3>
              <p className="text-sm text-gray-700 mt-2">Gestion des fiches</p>
            </div>
            <div className="space-y-3">
              <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-lg p-4">📖 Ressources</div>
              <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-lg p-4">🛡️ Confidentialité</div>
              <div className="backdrop-blur-md bg-white/30 border border-white/50 rounded-lg p-4">👥 Équipe</div>
            </div>
          </div>
        </div>
      </div>

      {/* Design 6: Bold Monochrome */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Design 6: Bold Monochrome</h2>
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="bg-black py-8 px-4 rounded-lg mb-6">
            <h1 className="text-4xl font-black text-center text-white tracking-tight">Arbre décisionnel<br/>RASED</h1>
            <p className="text-center text-gray-400 text-sm mt-2 font-medium">Outil d'aide diagnostique</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-black text-white rounded-lg p-6 border-2 border-white">
              <h3 className="font-black text-xl">ÉLÈVES</h3>
              <p className="text-sm text-gray-300 mt-2">Gestion des fiches</p>
            </div>
            <div className="space-y-3">
              <div className="bg-black text-white rounded-lg p-4 border-2 border-white font-bold">📖 RESSOURCES</div>
              <div className="bg-black text-white rounded-lg p-4 border-2 border-white font-bold">🛡️ CONFIDENTIALITÉ</div>
              <div className="bg-black text-white rounded-lg p-4 border-2 border-white font-bold">👥 ÉQUIPE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200 max-w-2xl mx-auto">
        <h3 className="font-bold text-blue-900 mb-2">Quel design préférez-vous?</h3>
        <p className="text-blue-800 text-sm">Dites-moi le numéro (1-6) et je l'applique à votre page Accueil!</p>
      </div>
    </div>
  );
}