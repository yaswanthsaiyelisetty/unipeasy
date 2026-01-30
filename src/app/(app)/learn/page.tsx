import { PageHeader } from "@/components/page-header";
import { LearnForm } from "./learn-form";

export default function LearnPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Learn"
        description="AI-powered explanations that make complex topics simple."
      />
      <LearnForm />
    </div>
  );
}
