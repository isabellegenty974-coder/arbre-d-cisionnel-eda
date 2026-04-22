import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function ActionsLangageExpr() {
  return (
    <ScreenLayout title="Actions recommandées – Expression">
      <InfoList
        type="action"
        items={[
          "Modélisation",
          "Jeux de langage",
          "Orientation orthophonie",
        ]}
      />
    </ScreenLayout>
  );
}