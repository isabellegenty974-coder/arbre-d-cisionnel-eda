import React from 'react';
import { base44 } from '@/api/base44Client';

const UserNotRegisteredError = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center px-6 max-w-sm">
        <div className="text-4xl mb-2">🔒</div>
        <h2 className="text-white text-xl font-bold">Accès non autorisé</h2>
        <p className="text-white/60 text-sm leading-relaxed">
          Votre compte n&apos;est pas encore enregistré dans cette application. Contactez votre administrateur pour obtenir une invitation.
        </p>
        <button
          onClick={() => base44.auth.logout()}
          className="mt-4 bg-white text-[#0F172A] font-semibold px-6 py-2.5 rounded-full hover:bg-white/90 transition-all"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;