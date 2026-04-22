import ListPage from '@/components/ListPage';

export default function AnalyseEcriture() {
  const items = [
    "Observation de la prégraphisme et graphomotricité",
    "Qualité de la production écrite",
    "Vitesse et endurance de l'écriture"
  ];

  return <ListPage title="Analyse graphomotrice – Écriture" items={items} />;
}