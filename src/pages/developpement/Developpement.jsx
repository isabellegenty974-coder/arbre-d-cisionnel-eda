import ScreenLayout from "../../components/tree/ScreenLayout";
import NavCards from "../../components/tree/NavCards";

export default function Developpement() {
  return (
    <ScreenLayout title="Difficultés liées au développement">
      <NavCards
        items={[
          { label: "Langage oral", to: "/developpement/langage-oral" },
          { label: "Motricité", to: "/developpement/motricite" },
          { label: "Attention", to: "/developpement/attention" },
          { label: "Interactions sociales", to: "/developpement/interactions" },
        ]}
      />
    </ScreenLayout>
  );
}