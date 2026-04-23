import ScreenLayout from "../../../components/tree/ScreenLayout";
import QuestionOptions from "../../../components/tree/QuestionOptions";

export default function EcritureQ13() {
  return (
    <ScreenLayout title="✍️ Écriture – Question 13" subtitle='Un élève refuse d&apos;écrire car « ça fait mal ».'>
      <QuestionOptions
        question="Quelle hypothèse vous semble la plus probable ?"
        options={[
          { label: "Dysgraphie", to: "/apprentissage/ecriture/questions/q13/a" },
          { label: "Opposition", to: "/apprentissage/ecriture/questions/q13/b" },
          { label: "Anxiété", to: "/apprentissage/ecriture/questions/q13/c" },
          { label: "TDAH", to: "/apprentissage/ecriture/questions/q13/d" },
        ]}
      />
    </ScreenLayout>
  );
}