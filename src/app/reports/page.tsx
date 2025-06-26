import { ReportsClient } from "@/components/reports-client";
import { PageHeader, PageHeaderTitle } from "@/components/page-header";

export default function ReportsPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderTitle>Your Reports</PageHeaderTitle>
      </PageHeader>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <ReportsClient />
      </div>
    </>
  );
}
