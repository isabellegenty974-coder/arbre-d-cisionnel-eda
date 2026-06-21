import { Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Téléverser' },
  { n: 2, label: 'Analyser' },
  { n: 3, label: 'Vérifier' },
  { n: 4, label: 'Importer' },
];

export default function ImportStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-between max-w-lg mx-auto">
      {STEPS.map((s, i) => {
        const done = currentStep > s.n;
        const active = currentStep === s.n;
        return (
          <div key={s.n} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? 'bg-green-500 text-white' :
                active ? 'bg-[#3B82F6] text-white shadow-lg shadow-blue-200' :
                'bg-gray-200 text-gray-400'
              }`}>
                {done ? <Check className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${
                active ? 'text-[#3B82F6]' : done ? 'text-green-600' : 'text-gray-400'
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}