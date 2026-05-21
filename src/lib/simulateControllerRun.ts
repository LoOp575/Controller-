import { useControllerStore } from "@/store/useControllerStore";
import { generateMockTasks } from "@/lib/mockTasks";
import {
  mockResults,
  mockOrchestratorPlan,
  mockArtifacts,
  mockFinalAnswer,
} from "@/lib/mockResults";
import { formatTime } from "@/lib/utils";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function simulateControllerRun() {
  const store = useControllerStore.getState();
  const {
    setControllerStatus,
    setTasks,
    updateTask,
    updateAgentStatus,
    addResult,
    addLog,
    setFinalAnswer,
    setOrchestratorPlan,
    setArtifacts,
    setIsRunning,
    setActiveTaskId,
  } = store;

  setIsRunning(true);
  const now = () => formatTime(new Date());

  // Phase 1: Planning
  setControllerStatus("planning");
  addLog({ timestamp: now(), level: "info", message: "GPT Orchestrator received user command" });
  updateAgentStatus("gpt_orchestrator", "running");
  await delay(1000);

  // Generate tasks
  const tasks = generateMockTasks();
  setTasks(tasks);
  addLog({ timestamp: now(), level: "info", message: "Task plan generated" });
  await delay(800);

  // Task 1: Understand request
  setControllerStatus("routing");
  setActiveTaskId("task_1");
  updateTask("task_1", { status: "running", progress: 50 });
  await delay(600);
  updateTask("task_1", { status: "done", progress: 100, outputPreview: "Intent parsed" });
  addLog({ timestamp: now(), level: "success", message: "Task 1 complete: User request understood" });
  await delay(400);

  // Task 2: Create plan
  setActiveTaskId("task_2");
  updateTask("task_2", { status: "running", progress: 30 });
  await delay(800);
  updateTask("task_2", { status: "running", progress: 70 });
  await delay(600);
  updateTask("task_2", { status: "done", progress: 100, outputPreview: "Plan created" });
  addLog({ timestamp: now(), level: "success", message: "Task 2 complete: Multi-agent task plan created" });

  // Add GPT result
  addResult({
    ...mockResults[0],
    timestamp: now(),
  });
  updateAgentStatus("gpt_orchestrator", "done");
  await delay(500);

  // Phase 2: Executing
  setControllerStatus("executing");

  // Task 3: Kiro analyzes
  setActiveTaskId("task_3");
  updateAgentStatus("kiro_dev_agent", "running");
  updateTask("task_3", { status: "running", progress: 0 });
  addLog({ timestamp: now(), level: "info", message: "Kiro Dev Agent started" });
  await delay(500);
  updateTask("task_3", { status: "running", progress: 30 });
  await delay(700);
  updateTask("task_3", { status: "running", progress: 60 });
  await delay(700);
  updateTask("task_3", { status: "running", progress: 90 });
  await delay(500);
  updateTask("task_3", { status: "done", progress: 100, outputPreview: "Structure analyzed" });
  updateAgentStatus("kiro_dev_agent", "done");
  addResult({ ...mockResults[1], timestamp: now() });
  addLog({ timestamp: now(), level: "success", message: "Task 3 complete: Project structure analyzed" });
  await delay(400);

  // Task 4: Claude reviews
  setActiveTaskId("task_4");
  updateAgentStatus("claude_agent", "running");
  updateTask("task_4", { status: "running", progress: 0 });
  addLog({ timestamp: now(), level: "info", message: "Claude Agent started" });
  await delay(600);
  updateTask("task_4", { status: "running", progress: 40 });
  await delay(800);
  updateTask("task_4", { status: "running", progress: 80 });
  await delay(600);
  updateTask("task_4", { status: "done", progress: 100, outputPreview: "UI reviewed" });
  updateAgentStatus("claude_agent", "done");
  addResult({ ...mockResults[2], timestamp: now() });
  addLog({ timestamp: now(), level: "success", message: "Task 4 complete: UI/UX review done" });
  await delay(400);

  // Task 5: DeepSeek summarizes
  setActiveTaskId("task_5");
  updateAgentStatus("deepseek_agent", "running");
  updateTask("task_5", { status: "running", progress: 0 });
  addLog({ timestamp: now(), level: "info", message: "DeepSeek Agent started" });
  await delay(500);
  updateTask("task_5", { status: "running", progress: 50 });
  await delay(800);
  updateTask("task_5", { status: "done", progress: 100, outputPreview: "Summary ready" });
  updateAgentStatus("deepseek_agent", "done");
  addResult({ ...mockResults[3], timestamp: now() });
  addLog({ timestamp: now(), level: "success", message: "Task 5 complete: Findings summarized" });
  await delay(400);

  // Task 6: Local Node
  setActiveTaskId("task_6");
  updateAgentStatus("local_node_worker", "running");
  updateTask("task_6", { status: "running", progress: 0 });
  addLog({ timestamp: now(), level: "info", message: "Local Node Worker started" });
  await delay(600);
  updateTask("task_6", { status: "running", progress: 60 });
  await delay(600);
  updateTask("task_6", { status: "done", progress: 100, outputPreview: "Checks passed" });
  updateAgentStatus("local_node_worker", "done");
  addResult({ ...mockResults[4], timestamp: now() });
  addLog({ timestamp: now(), level: "success", message: "Task 6 complete: Local checks passed" });
  await delay(400);

  // Phase 3: Aggregating
  setControllerStatus("aggregating");
  setActiveTaskId("task_7");
  updateAgentStatus("gpt_orchestrator", "running");
  updateTask("task_7", { status: "running", progress: 0 });
  addLog({ timestamp: now(), level: "info", message: "Result aggregator updated" });
  await delay(600);
  updateTask("task_7", { status: "running", progress: 50 });
  await delay(800);
  updateTask("task_7", { status: "done", progress: 100, outputPreview: "Final answer ready" });

  // Artifact renderer
  updateAgentStatus("artifact_renderer", "running");
  await delay(400);
  addResult({ ...mockResults[5], timestamp: now() });
  updateAgentStatus("artifact_renderer", "done");

  // Set orchestrator plan and artifacts
  setOrchestratorPlan(mockOrchestratorPlan);
  setArtifacts(mockArtifacts);
  await delay(500);

  // Phase 4: Complete
  setFinalAnswer(mockFinalAnswer);
  updateAgentStatus("gpt_orchestrator", "done");
  setControllerStatus("completed");
  setActiveTaskId(null);
  addLog({ timestamp: now(), level: "success", message: "Final answer generated" });
  setIsRunning(false);
}
