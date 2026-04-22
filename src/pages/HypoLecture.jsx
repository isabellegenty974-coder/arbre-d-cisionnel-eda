import ListPage from '@/components/ListPage';

export default function HypoLecture() {
  const items = [
    "Difficulté d'apprentissage spécifique",
    "Trouble du langage écrit (hypothèse à explorer)",
    "Manque d'automatisation des procédures",
    "Impact attentionnel",
    "Facteur émotionnel (anxiété de performance)"
  ];

  return <ListPage title="Hypothèses – Lecture" items={items} />;
}