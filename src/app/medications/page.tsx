import { MedicationsClient } from "@/components/medications-client";
import { PageHeader, PageHeaderTitle } from "@/components/page-header";

export default function MedicationsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Seus Medicamentos</PageHeaderTitle>
      </PageHeader>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <MedicationsClient />
      </div>
    </>
  );
}
