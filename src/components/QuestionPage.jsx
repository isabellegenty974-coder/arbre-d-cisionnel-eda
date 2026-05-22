import { useParams } from "react-router-dom";
import ScreenLayout from "./tree/ScreenLayout";
import QuestionOptions from "./tree/QuestionOptions";
import { getQuestion } from "@/lib/questionsConfig";

export default function QuestionPage() {
  const { domain, questionNum } = useParams();
  const questionId = `q${questionNum}`;
  const question = getQuestion(domain, questionId);

  if (!question) {
    return (
      <ScreenLayout title="Question non trouvée">
        <p className="text-muted-foreground">La question demandée n'existe pas.</p>
      </ScreenLayout>
    );
  }

  const options = question.options.map((opt) => ({
    label: opt.label,
    to: `/${question.domain}/${question.category.toLowerCase()}/questions/${questionId}/${opt.label.charAt(0).toLowerCase()}`,
  }));

  return (
    <ScreenLayout title={question.title} subtitle={question.subtitle}>
      <QuestionOptions question="Quelle hypothèse vous semble la plus probable ?" options={options} />
    </ScreenLayout>
  );
}