import ListPage from '@/components/ListPage';

export default function ActionsLangageCompr() {
  const items = [
    "Bilan orthophonique approfondi",
    "Aménagements en classe",
    "Exercices de stimulation du langage"
  ];

  return <ListPage title="Actions recommandées – Compréhension" items={items} />;
}