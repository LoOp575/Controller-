export type AgentStatus =
  | "offline"
  | "online"
  | "standby"
  | "queued"
  | "running"
  | "done"
  | "error";

export type ControllerStatus =
  | "idle"
  | "planning"
  | "routing"
  | "executing"
  | "aggregating"
  | "completed"
  | "error";

export type TaskStatus = "queued" | "running" | "done" | "error";

export interface AIProvider {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  capabilities: string[];
  lastActive: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  status: TaskStatus;
  progress: number;
  dependsOn: string[];
  outputPreview: string;
}

export interface AgentResult {
  agentId: string;
  title: string;
  content: string;
  timestamp: string;
  status: "success" | "error" | "pending";
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  message: string;
}

export interface OrchestratorPlanTask {
  id: string;
  agent: string;
  action: string;
  status: string;
}

export interface OrchestratorPlan {
  intent: string;
  priority: string;
  controller: string;
  tasks: OrchestratorPlanTask[];
}

export interface Artifact {
  type: "json" | "code" | "report" | "chart";
  title: string;
  content: string;
  language?: string;
}

export interface ControllerRunResponse {
  status: "completed" | "error";
  controllerStatus: "completed" | "error";
  orchestratorPlan: OrchestratorPlan;
  tasks: Task[];
  agentResults: AgentResult[];
  activityLogs: ActivityLog[];
  finalAnswer: string;
  artifacts: Artifact[];
  _meta?: {
    mode: "live" | "mock";
    model?: string;
    fallbackReason?: string;
  };
}


// ─── NusaTani AI Types ─────────────────────────────────────────────────────

export type BuyerCategory =
  | "pabrik_jamu"
  | "toko_herbal"
  | "distributor_pangan"
  | "grosir_sembako"
  | "restoran"
  | "katering"
  | "hotel"
  | "pasar_induk"
  | "umkm_makanan"
  | "produsen_keripik"
  | "pabrik_tepung_tapioka";

export const BUYER_CATEGORIES: { value: BuyerCategory; label: string }[] = [
  { value: "pabrik_jamu", label: "Pabrik Jamu" },
  { value: "toko_herbal", label: "Toko Herbal" },
  { value: "distributor_pangan", label: "Distributor Pangan" },
  { value: "grosir_sembako", label: "Grosir Sembako" },
  { value: "restoran", label: "Restoran" },
  { value: "katering", label: "Katering" },
  { value: "hotel", label: "Hotel" },
  { value: "pasar_induk", label: "Pasar Induk" },
  { value: "umkm_makanan", label: "UMKM Makanan" },
  { value: "produsen_keripik", label: "Produsen Keripik" },
  { value: "pabrik_tepung_tapioka", label: "Pabrik Tepung/Tapioka" },
];

export type LeadStatus =
  | "baru_ditemukan"
  | "sudah_dihubungi"
  | "minta_harga"
  | "minta_sampel"
  | "nego"
  | "closing"
  | "tidak_cocok"
  | "follow_up_nanti";

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: "baru_ditemukan", label: "Baru Ditemukan", color: "bg-blue-100 text-blue-700" },
  { value: "sudah_dihubungi", label: "Sudah Dihubungi", color: "bg-cyan-100 text-cyan-700" },
  { value: "minta_harga", label: "Minta Harga", color: "bg-yellow-100 text-yellow-700" },
  { value: "minta_sampel", label: "Minta Sampel", color: "bg-orange-100 text-orange-700" },
  { value: "nego", label: "Nego", color: "bg-purple-100 text-purple-700" },
  { value: "closing", label: "Closing", color: "bg-green-100 text-green-700" },
  { value: "tidak_cocok", label: "Tidak Cocok", color: "bg-red-100 text-red-700" },
  { value: "follow_up_nanti", label: "Follow Up Nanti", color: "bg-gray-100 text-gray-700" },
];

export interface Buyer {
  id: string;
  name: string;
  category: BuyerCategory;
  commodity: string;
  city: string;
  address: string;
  phone: string;
  website: string;
  rating: number;
  source: string;
  buyer_score: number;
  ai_notes: string;
  outreach_message: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface Commodity {
  id: string;
  name: string;
  stock: number;
  unit: string;
  price: number;
  location: string;
  notes: string;
  created_at: string;
}

export interface BuyerSearchParams {
  commodity: string;
  city: string;
  category: string;
  stock: number;
  price: number;
  unit: string;
}

export interface BuyerSearchResult {
  buyers: Buyer[];
  total: number;
  query: string;
  mode: "live" | "mock";
}

export interface OutreachRequest {
  buyer_name: string;
  buyer_category: string;
  commodity: string;
  stock: number;
  unit: string;
  price: number;
  city: string;
  seller_name?: string;
}
