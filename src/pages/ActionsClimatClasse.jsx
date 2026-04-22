import ListPage from '@/components/ListPage';

export default function ActionsClimatClasse() {
  const items = [
    "Interventions collectives au sein de la classe",
    "Amélioration de la dynamique relationnelle",
    "Soutien à l'enseignant et à la classe"
  ];

  return <ListPage title="Actions recommandées – Climat de classe" items={items} />;
}