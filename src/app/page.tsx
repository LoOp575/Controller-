"use client";

import { AppHeader } from "@/components/AppHeader";
import { ControllerChat } from "@/components/ControllerChat";
import { ProviderStatusGrid } from "@/components/ProviderStatusGrid";
import { TaskQueue } from "@/components/TaskQueue";
import { AgentFlowTimeline } from "@/components/AgentFlowTimeline";
import { WorkResultPanel } from "@/components/WorkResultPanel";
import { FinalAnswerPanel } from "@/components/FinalAnswerPanel";
import { ActivityLogs } from "@/components/ActivityLogs";
import { ArtifactPreview } from "@/components/ArtifactPreview";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#EAF8F8]">
      <AppHeader />

      <main className="mx-auto max-w-6xl px-4 py-4">
        {/* Mobile: single column, Desktop: two columns */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Left Column - Controller & Nodes */}
          <div className="space-y-4 lg:col-span-5">
            <ControllerChat />
            <ProviderStatusGrid />
            <AgentFlowTimeline />
            <ActivityLogs />
          </div>

          {/* Right Column - Tasks, Results & Artifacts */}
          <div className="space-y-4 lg:col-span-7">
            <TaskQueue />
            <WorkResultPanel />
            <FinalAnswerPanel />
            <ArtifactPreview />
          </div>
        </div>
      </main>
    </div>
  );
}
