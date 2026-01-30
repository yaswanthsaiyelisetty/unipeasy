import { PageHeader } from "@/components/page-header";
import { StrategistForm } from "./strategist-form";

export default function StrategistPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Strategist"
        description="Create your personalized study plan for exam success."
      />
      <StrategistForm />
    </div>
  );
}
