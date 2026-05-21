import { create } from "zustand";
import {
  AIProvider,
  Task,
  AgentResult,
  ActivityLog,
  OrchestratorPlan,
  Artifact,
  ControllerStatus,
  ControllerRunResponse,
} from "@/types";
import { mockAgents } from "@/lib/mockAgents";

interface ControllerState {
  commandText: string;
  controllerStatus: ControllerStatus;
  agents: AIProvider[];
  tasks: Task[];
  activeTaskId: string | null;
  results: AgentResult[];
  logs: ActivityLog[];
  finalAnswer: string;
  orchestratorPlan: OrchestratorPlan | null;
  artifacts: Artifact[];
  isRunning: boolean;
  selectedResultAgent: string | null;
  error: string | null;
  apiMode: "live" | "mock" | null;
  fallbackReason: string | null;

  // Actions
  setCommandText: (text: string) => void;
  setControllerStatus: (status: ControllerStatus) => void;
  setAgents: (agents: AIProvider[]) => void;
  updateAgentStatus: (agentId: string, status: AIProvider["status"]) => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  setActiveTaskId: (id: string | null) => void;
  addResult: (result: AgentResult) => void;
  addLog: (log: Omit<ActivityLog, "id">) => void;
  setFinalAnswer: (answer: string) => void;
  setOrchestratorPlan: (plan: OrchestratorPlan | null) => void;
  setArtifacts: (artifacts: Artifact[]) => void;
  setIsRunning: (running: boolean) => void;
  setSelectedResultAgent: (agentId: string | null) => void;
  setError: (error: string | null) => void;
  resetController: () => void;
  applyApiResponse: (response: ControllerRunResponse) => void;
  runController: (command: string) => Promise<void>;
}

const initialState = {
  commandText: "",
  controllerStatus: "idle" as ControllerStatus,
  agents: mockAgents,
  tasks: [],
  activeTaskId: null,
  results: [],
  logs: [],
  finalAnswer: "",
  orchestratorPlan: null,
  artifacts: [],
  isRunning: false,
  selectedResultAgent: null,
  error: null,
  apiMode: null as "live" | "mock" | null,
  fallbackReason: null as string | null,
};

export const useControllerStore = create<ControllerState>((set, get) => ({
  ...initialState,

  setCommandText: (text) => set({ commandText: text }),
  setControllerStatus: (status) => set({ controllerStatus: status }),
  setAgents: (agents) => set({ agents }),
  updateAgentStatus: (agentId, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === agentId ? { ...a, status, lastActive: new Date().toISOString() } : a
      ),
    })),
  setTasks: (tasks) => set({ tasks }),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),
  setActiveTaskId: (id) => set({ activeTaskId: id }),
  addResult: (result) =>
    set((state) => ({ results: [...state.results, result] })),
  addLog: (log) =>
    set((state) => ({
      logs: [
        ...state.logs,
        { ...log, id: Math.random().toString(36).substring(2, 11) },
      ],
    })),
  setFinalAnswer: (answer) => set({ finalAnswer: answer }),
  setOrchestratorPlan: (plan) => set({ orchestratorPlan: plan }),
  setArtifacts: (artifacts) => set({ artifacts }),
  setIsRunning: (running) => set({ isRunning: running }),
  setSelectedResultAgent: (agentId) => set({ selectedResultAgent: agentId }),
  setError: (error) => set({ error }),
  resetController: () =>
    set({
      ...initialState,
      agents: mockAgents,
    }),

  applyApiResponse: (response: ControllerRunResponse) => {
    const state = get();

    // Extract meta info
    const mode = response._meta?.mode || "mock";
    const fallbackReason = response._meta?.fallbackReason || null;

    // Update agent statuses based on task assignments and results
    const assignedAgentIds = new Set(response.tasks.map((t) => t.assignedTo));
    const resultAgentIds = new Set(response.agentResults.map((r) => r.agentId));

    const updatedAgents = state.agents.map((agent) => {
      if (resultAgentIds.has(agent.id)) {
        return { ...agent, status: "done" as const, lastActive: new Date().toISOString() };
      }
      if (assignedAgentIds.has(agent.id)) {
        return { ...agent, status: "queued" as const, lastActive: new Date().toISOString() };
      }
      return agent;
    });

    set({
      controllerStatus: response.controllerStatus as ControllerStatus,
      orchestratorPlan: response.orchestratorPlan,
      tasks: response.tasks,
      results: response.agentResults,
      logs: response.activityLogs,
      finalAnswer: response.finalAnswer,
      artifacts: response.artifacts,
      agents: updatedAgents,
      activeTaskId: null,
      isRunning: false,
      error: null,
      apiMode: mode,
      fallbackReason,
    });
  },

  runController: async (command: string) => {
    const { resetController, setIsRunning, setControllerStatus, addLog, setError, applyApiResponse } = get();

    // Reset and start
    resetController();
    set({ commandText: command });
    setIsRunning(true);
    setControllerStatus("planning");
    setError(null);

    const now = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    addLog({ timestamp: now, level: "info", message: "Sending command to GPT Controller API..." });
    addLog({ timestamp: now, level: "info", message: `Command: "${command.substring(0, 60)}${command.length > 60 ? "..." : ""}"` });

    try {
      const res = await fetch("/api/controller/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `API error: ${res.status}`);
      }

      const data: ControllerRunResponse = await res.json();

      // Apply the full response to the store
      applyApiResponse(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      setControllerStatus("error");
      setIsRunning(false);
      addLog({
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        level: "error",
        message: `Controller error: ${errorMessage}`,
      });
    }
  },
}));
