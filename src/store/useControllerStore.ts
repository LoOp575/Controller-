import { create } from "zustand";
import {
  AIProvider,
  Task,
  AgentResult,
  ActivityLog,
  OrchestratorPlan,
  Artifact,
  ControllerStatus,
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
  resetController: () => void;
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
};

export const useControllerStore = create<ControllerState>((set) => ({
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
  resetController: () =>
    set({
      ...initialState,
      agents: mockAgents,
    }),
}));
