import { AgentResult, OrchestratorPlan, Artifact } from "@/types";

export const mockResults: AgentResult[] = [
  {
    agentId: "gpt_orchestrator",
    title: "GPT Orchestrator - Intent Analysis",
    content:
      "Intent detected: project_analysis_and_ui_review. Need codebase review, UI critique, and final improvement plan.",
    timestamp: "",
    status: "success",
  },
  {
    agentId: "kiro_dev_agent",
    title: "Kiro Dev Agent - Structure Analysis",
    content:
      "Found dashboard structure. Suggested components: AppHeader, ControllerChat, AgentStatus, TaskQueue, ResultPanel. File organization follows Next.js App Router conventions.",
    timestamp: "",
    status: "success",
  },
  {
    agentId: "claude_agent",
    title: "Claude Agent - UI Review",
    content:
      "UI should separate control input, execution queue, and final output. Avoid mixing all logs in one area. Consider progressive disclosure for task details.",
    timestamp: "",
    status: "success",
  },
  {
    agentId: "deepseek_agent",
    title: "DeepSeek Agent - Summary",
    content:
      "Summary: build simple controller-first layout, then connect real API later. Priority: mock flow > visual polish > API integration.",
    timestamp: "",
    status: "success",
  },
  {
    agentId: "local_node_worker",
    title: "Local Node Worker - Check",
    content: "Mock check complete. No real command executed in demo mode. All dependencies accounted for.",
    timestamp: "",
    status: "success",
  },
  {
    agentId: "artifact_renderer",
    title: "Artifact Renderer - Output",
    content: "Prepared result preview panel. Orchestrator JSON plan and code snippets ready for display.",
    timestamp: "",
    status: "success",
  },
];

export const mockOrchestratorPlan: OrchestratorPlan = {
  intent: "project_analysis_and_ui_review",
  priority: "normal",
  controller: "gpt_orchestrator",
  tasks: [
    {
      id: "task_1",
      agent: "kiro_dev_agent",
      action: "inspect_project_structure",
      status: "done",
    },
    {
      id: "task_2",
      agent: "claude_agent",
      action: "analyze_ui_and_architecture",
      status: "done",
    },
    {
      id: "task_3",
      agent: "deepseek_agent",
      action: "summarize_findings",
      status: "done",
    },
    {
      id: "task_4",
      agent: "gpt_orchestrator",
      action: "generate_final_answer",
      status: "done",
    },
  ],
};

export const mockArtifacts: Artifact[] = [
  {
    type: "json",
    title: "Orchestrator Task Plan",
    content: JSON.stringify(mockOrchestratorPlan, null, 2),
    language: "json",
  },
  {
    type: "code",
    title: "Suggested Component Structure",
    content: `// Recommended component hierarchy
export default function Dashboard() {
  return (
    <main>
      <AppHeader />
      <ControllerChat />
      <ProviderStatusGrid />
      <TaskQueue />
      <AgentFlowTimeline />
      <WorkResultPanel />
      <FinalAnswerPanel />
      <ActivityLogs />
      <ArtifactPreview />
    </main>
  );
}`,
    language: "typescript",
  },
  {
    type: "report",
    title: "Analysis Report",
    content: `## Project Analysis Summary

**Status:** Complete
**Agents Used:** 5/6
**Tasks Completed:** 7/7

### Key Findings:
1. Dashboard structure follows best practices
2. Controller-first pattern recommended
3. Mock data flow verified successfully
4. Ready for API integration phase

### Next Steps:
- Connect GPT API endpoint
- Add WebSocket for real-time updates
- Implement auth layer`,
    language: "markdown",
  },
];

export const mockFinalAnswer = `Bro, hasil kerja agent sudah selesai.

**Summary:**
Struktur dashboard paling aman adalah controller-first: chat input di atas, daftar node/AI di samping, task queue di tengah, dan result panel di bawah.

**What GPT decided:**
- Membagi tugas ke 4 agent berbeda
- Kiro menganalisis struktur project
- Claude me-review UI/UX
- DeepSeek merangkum semua temuan
- Local Node menjalankan pengecekan dasar

**Assigned agents:**
GPT Orchestrator, Kiro Dev Agent, Claude Agent, DeepSeek Agent, Local Node Worker

**Final recommendation:**
Untuk MVP, jangan sambungkan API dulu. Fokus ke mock flow supaya semua alur GPT → task queue → agent → result → final answer terlihat jelas.

**Next step:**
1. Finalisasi UI komponen
2. Tambahkan animasi transisi antar status
3. Siapkan API route untuk backend connector
4. Implementasi WebSocket untuk real-time update`;
