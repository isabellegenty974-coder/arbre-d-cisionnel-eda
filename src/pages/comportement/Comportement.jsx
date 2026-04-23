import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Comportement() {
  return (
    <ScreenLayout title="Difficultés comportementales / émotionnelles">
      <NavCards
        items={[
          { label: "🔍 Questions diagnostiques", to: "/comportement/questions" },
          { label: "Inhibition", to: "/comportement/inhibition" },
          { label: "Impulsivité", to: "/comportement/impulsivite" },
          { label: "Anxiété", to: "/comportement/anxiete" },
          { label: "Opposition", to: "/comportement/opposition" },
        ]}
      />
    </ScreenLayout>
  );
}