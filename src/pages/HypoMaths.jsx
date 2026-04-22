import ListPage from '@/components/ListPage';

export default function HypoMaths() {
  const items = [
    "Dyscalculie",
    "Difficultés logico-mathématiques",
    "Impact des domaines connexes (langage, mémoire)"
  ];

  return <ListPage title="Hypothèses – Mathématiques" items={items} />;
}