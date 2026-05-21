import { Task, AgentResult, ActivityLog, OrchestratorPlan, Artifact, ControllerRunResponse } from "@/types";

export type { ControllerRunResponse };

export function generateControllerMockResponse(command: string): ControllerRunResponse {
  const now = () =>
    new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const orchestratorPlan: OrchestratorPlan = {
    intent: "multi_agent_controller_task",
    priority: "normal",
    controller: "gpt_orchestrator",
    tasks: [
      {
        id: "task_1",
        agent: "gpt_orchestrator",
        action: "parse_user_intent",
        status: "done",
      },
      {
        id: "task_2",
        agent: "gpt_orchestrator",
        action: "create_task_plan",
        status: "done",
      },
      {
        id: "task_3",
        agent: "kiro_dev_agent",
        action: "inspect_project_structure",
        status: "done",
      },
      {
        id: "task_4",
        agent: "claude_agent",
        action: "analyze_and_review",
        status: "done",
      },
      {
        id: "task_5",
        agent: "deepseek_agent",
        action: "summarize_findings",
        status: "done",
      },
      {
        id: "task_6",
        agent: "local_node_worker",
        action: "execute_safe_checks",
        status: "done",
      },
      {
        id: "task_7",
        agent: "artifact_renderer",
        action: "render_output",
        status: "done",
      },
      {
        id: "task_8",
        agent: "gpt_orchestrator",
        action: "generate_final_answer",
        status: "done",
      },
    ],
  };

  const tasks: Task[] = [
    {
      id: "task_1",
      title: "Parse user intent",
      assignedTo: "gpt_orchestrator",
      status: "done",
      progress: 100,
      dependsOn: [],
      outputPreview: "Intent parsed successfully",
    },
    {
      id: "task_2",
      title: "Create multi-agent task plan",
      assignedTo: "gpt_orchestrator",
      status: "done",
      progress: 100,
      dependsOn: ["task_1"],
      outputPreview: "Plan created with 6 sub-tasks",
    },
    {
      id: "task_3",
      title: "Inspect project structure",
      assignedTo: "kiro_dev_agent",
      status: "done",
      progress: 100,
      dependsOn: ["task_2"],
      outputPreview: "Project structure analyzed",
    },
    {
      id: "task_4",
      title: "Analyze and review",
      assignedTo: "claude_agent",
      status: "done",
      progress: 100,
      dependsOn: ["task_2"],
      outputPreview: "Analysis complete",
    },
    {
      id: "task_5",
      title: "Summarize findings",
      assignedTo: "deepseek_agent",
      status: "done",
      progress: 100,
      dependsOn: ["task_3", "task_4"],
      outputPreview: "Summary ready",
    },
    {
      id: "task_6",
      title: "Execute safe local checks",
      assignedTo: "local_node_worker",
      status: "done",
      progress: 100,
      dependsOn: ["task_2"],
      outputPreview: "All checks passed",
    },
    {
      id: "task_7",
      title: "Render output artifacts",
      assignedTo: "artifact_renderer",
      status: "done",
      progress: 100,
      dependsOn: ["task_5", "task_6"],
      outputPreview: "Artifacts rendered",
    },
    {
      id: "task_8",
      title: "Generate final answer",
      assignedTo: "gpt_orchestrator",
      status: "done",
      progress: 100,
      dependsOn: ["task_5", "task_6", "task_7"],
      outputPreview: "Final answer ready",
    },
  ];

  const agentResults: AgentResult[] = [
    {
      agentId: "gpt_orchestrator",
      title: "GPT Orchestrator - Intent & Planning",
      content: `Received command: "${command}". Intent classified as multi_agent_controller_task. Created execution plan with 8 sub-tasks distributed across 6 agents.`,
      timestamp: now(),
      status: "success",
    },
    {
      agentId: "kiro_dev_agent",
      title: "Kiro Dev Agent - Project Inspection",
      content:
        "Project structure analyzed. Found Next.js App Router setup with TypeScript, Tailwind CSS, Zustand store, and component-based architecture. All modules are properly connected.",
      timestamp: now(),
      status: "success",
    },
    {
      agentId: "claude_agent",
      title: "Claude Agent - Deep Analysis",
      content:
        "Architecture review complete. The controller-first pattern is well implemented. Recommendation: add error boundaries, implement retry logic for API calls, and consider WebSocket for real-time task updates.",
      timestamp: now(),
      status: "success",
    },
    {
      agentId: "deepseek_agent",
      title: "DeepSeek Agent - Summary",
      content:
        "Key findings: 1) Project structure is solid, 2) Mock flow works end-to-end, 3) API route layer is ready for real integration, 4) Frontend-backend separation is clean. Priority: connect real LLM endpoints next.",
      timestamp: now(),
      status: "success",
    },
    {
      agentId: "local_node_worker",
      title: "Local Node Worker - System Checks",
      content:
        "All checks passed in demo mode. No destructive commands executed. Build pipeline verified. Dependencies are consistent.",
      timestamp: now(),
      status: "success",
    },
    {
      agentId: "artifact_renderer",
      title: "Artifact Renderer - Output",
      content:
        "Generated orchestrator JSON plan, code structure preview, and analysis report. All artifacts ready for display.",
      timestamp: now(),
      status: "success",
    },
  ];

  const activityLogs: ActivityLog[] = [
    { id: "log_1", timestamp: now(), level: "info", message: "GPT Orchestrator received user command" },
    { id: "log_2", timestamp: now(), level: "info", message: `Command: "${command.substring(0, 60)}${command.length > 60 ? "..." : ""}"` },
    { id: "log_3", timestamp: now(), level: "success", message: "Intent parsed: multi_agent_controller_task" },
    { id: "log_4", timestamp: now(), level: "info", message: "Task plan generated with 8 sub-tasks" },
    { id: "log_5", timestamp: now(), level: "info", message: "Kiro Dev Agent started: inspect_project_structure" },
    { id: "log_6", timestamp: now(), level: "success", message: "Kiro Dev Agent completed" },
    { id: "log_7", timestamp: now(), level: "info", message: "Claude Agent started: analyze_and_review" },
    { id: "log_8", timestamp: now(), level: "success", message: "Claude Agent completed" },
    { id: "log_9", timestamp: now(), level: "info", message: "DeepSeek Agent started: summarize_findings" },
    { id: "log_10", timestamp: now(), level: "success", message: "DeepSeek Agent completed" },
    { id: "log_11", timestamp: now(), level: "info", message: "Local Node Worker started: execute_safe_checks" },
    { id: "log_12", timestamp: now(), level: "success", message: "Local Node Worker completed" },
    { id: "log_13", timestamp: now(), level: "info", message: "Artifact Renderer started: render_output" },
    { id: "log_14", timestamp: now(), level: "success", message: "Artifact Renderer completed" },
    { id: "log_15", timestamp: now(), level: "info", message: "Result aggregation complete" },
    { id: "log_16", timestamp: now(), level: "success", message: "Final answer generated by GPT Orchestrator" },
  ];

  const finalAnswer = `Bro, semua agent sudah selesai bekerja untuk command kamu.

**Summary:**
Command "${command.substring(0, 80)}${command.length > 80 ? "..." : ""}" telah diproses oleh 6 agent secara terkoordinasi.

**What GPT decided:**
- Membagi tugas ke semua available agents
- Kiro menganalisis struktur project
- Claude melakukan deep review arsitektur
- DeepSeek merangkum semua temuan
- Local Node menjalankan system checks
- Artifact Renderer menyiapkan output visual

**Assigned agents:**
GPT Orchestrator, Kiro Dev Agent, Claude Agent, DeepSeek Agent, Local Node Worker, Artifact Renderer

**Final recommendation:**
Semua proses berjalan lancar. Sistem multi-agent controller bekerja sesuai desain. Jalur frontend → API → mock response sudah terverifikasi.

**Next step:**
1. Sambungkan ke real GPT API untuk orchestration
2. Tambahkan WebSocket untuk real-time progress
3. Implementasi rate limiting dan auth
4. Deploy production-ready version`;

  const artifacts: Artifact[] = [
    {
      type: "json",
      title: "Orchestrator Execution Plan",
      content: JSON.stringify(orchestratorPlan, null, 2),
      language: "json",
    },
    {
      type: "code",
      title: "API Response Structure",
      content: `// POST /api/controller/run
// Request: { command: string }
// Response: ControllerRunResponse

interface ControllerRunResponse {
  status: "completed" | "error";
  controllerStatus: "completed" | "error";
  orchestratorPlan: OrchestratorPlan;
  tasks: Task[];
  agentResults: AgentResult[];
  activityLogs: ActivityLog[];
  finalAnswer: string;
  artifacts: Artifact[];
}`,
      language: "typescript",
    },
    {
      type: "report",
      title: "Execution Report",
      content: `## Controller Execution Report

**Status:** Completed
**Agents Used:** 6/6
**Tasks Completed:** 8/8
**Errors:** 0

### Agent Performance:
| Agent | Task | Status | Duration |
|-------|------|--------|----------|
| GPT Orchestrator | Parse & Plan | Done | 1.2s |
| Kiro Dev Agent | Inspect | Done | 2.4s |
| Claude Agent | Analyze | Done | 3.1s |
| DeepSeek Agent | Summarize | Done | 1.8s |
| Local Node Worker | Check | Done | 1.1s |
| Artifact Renderer | Render | Done | 0.8s |

### Total execution time: ~10.4s (simulated)`,
      language: "markdown",
    },
  ];

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan,
    tasks,
    agentResults,
    activityLogs,
    finalAnswer,
    artifacts,
  };
}
