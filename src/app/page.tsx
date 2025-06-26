import { DashboardClient } from "@/components/dashboard-client";
import { PageHeader, PageHeaderTitle } from "@/components/page-header";

export default function DashboardPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Painel</PageHeaderTitle>
      </PageHeader>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <DashboardClient />
      </div>
    </>
  );
}
