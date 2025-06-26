import { DoctorVisitClient } from "@/components/doctor-visit-client";
import { PageHeader, PageHeaderTitle } from "@/components/page-header";
import { generateDoctorVisitPrompt } from "@/ai/flows/generate-doctor-visit-prompt";


export default function DoctorVisitPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Ferramenta de Visita ao Médico</PageHeaderTitle>
      </PageHeader>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <DoctorVisitClient generatePromptAction={generateDoctorVisitPrompt} />
      </div>
    </>
  );
}
