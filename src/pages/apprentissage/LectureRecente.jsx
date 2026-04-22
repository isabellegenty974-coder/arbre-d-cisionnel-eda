import ScreenLayout from "../../components/tree/ScreenLayout";
import InfoList from "../../components/tree/InfoList";

export default function LectureRecente() {
  return (
    <ScreenLayout title="Lecture – Difficulté récente">
      <p className="text-muted-foreground mb-5">
        Une difficulté récente peut être liée à des facteurs temporaires. Voici les pistes à explorer :
      </p>
      <InfoList
        type="action"
        items={[
          "Vérifier s'il y a un changement récent (familial, scolaire)",
          "Observer l'élève en situation de lecture",
          "Entretien avec l'enseignant sur les circonstances",
          "Adapter temporairement les exigences",
          "Réévaluer après quelques semaines",
        ]}
      />
    </ScreenLayout>
  );
}