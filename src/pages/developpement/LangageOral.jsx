import ScreenLayout from "../../components/tree/ScreenLayout";
import QuestionOptions from "../../components/tree/QuestionOptions";

export default function LangageOral() {
  return (
    <ScreenLayout title="🗣️ Langage oral">
      <QuestionOptions
        question="Compréhension ou expression ?"
        options={[
          { label: "🧩 Compréhension", to: "/developpement/langage-oral/comprehension" },
          { label: "💬 Expression", to: "/developpement/langage-oral/expression" },
        ]}
      />
    </ScreenLayout>
  );
}