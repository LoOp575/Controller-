/**
 * NusaTani Agent - integrates with the existing Chat Controller.
 * Detects buyer-related commands and runs buyer search / outreach tools.
 */

import { searchBuyers } from "@/lib/tools/buyerSearchTool";
import { generateOutreachMessage } from "@/lib/tools/outreachTool";
import { ControllerRunResponse, AgentResult, Artifact, BuyerSearchParams } from "@/types";

function now(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** Detect if message is a NusaTani buyer-related request */
export function isNusaTaniBuyerRequest(message: string): boolean {
  const text = message.toLowerCase();
  const buyerKeywords = ["cari buyer", "cari pembeli", "cari pabrik", "cari toko", "cari restoran", "cari grosir", "cari distributor", "buyer jahe", "buyer beras", "buyer kencur", "buyer kunyit", "buyer singkong", "buyer cabai", "buyer bawang", "buyer kopi", "pembeli jahe", "pembeli beras", "pesan wa", "pesan whatsapp", "buat pesan wa", "simpan lead", "nusatani"];
  return buyerKeywords.some(k => text.includes(k));
}

/** Parse buyer search parameters from natural language */
function parseSearchFromMessage(message: string): BuyerSearchParams {
  const text = message.toLowerCase();
  
  // Extract commodity
  const commodities = ["jahe", "beras", "kencur", "kunyit", "singkong", "cabai", "bawang", "kopi", "lada", "temulawak", "lengkuas", "pala", "cengkeh", "kemiri"];
  const commodity = commodities.find(c => text.includes(c)) || "jahe";

  // Extract city
  const cities = ["jakarta", "bandung", "surabaya", "semarang", "solo", "yogyakarta", "malang", "bogor", "tangerang", "bekasi", "depok", "medan", "lampung", "garut", "tasikmalaya", "cirebon", "pati", "wonogiri"];
  const city = cities.find(c => text.includes(c)) || "Jakarta";

  // Extract category
  let category = "";
  if (text.includes("pabrik jamu") || text.includes("jamu")) category = "pabrik_jamu";
  else if (text.includes("toko herbal") || text.includes("herbal")) category = "toko_herbal";
  else if (text.includes("restoran")) category = "restoran";
  else if (text.includes("grosir")) category = "grosir_sembako";
  else if (text.includes("distributor")) category = "distributor_pangan";
  else if (text.includes("katering")) category = "katering";
  else if (text.includes("hotel")) category = "hotel";
  else if (text.includes("pasar induk")) category = "pasar_induk";

  return { commodity, city: city.charAt(0).toUpperCase() + city.slice(1), category, stock: 0, price: 0, unit: "kg" };
}

/** Run NusaTani buyer search from chat command */
export async function runNusaTaniBuyerJob(message: string): Promise<ControllerRunResponse> {
  const timestamp = now();
  const text = message.toLowerCase();
  const isOutreachRequest = text.includes("pesan wa") || text.includes("pesan whatsapp") || text.includes("buat pesan");

  // Parse params from message
  const params = parseSearchFromMessage(message);

  if (isOutreachRequest) {
    // Generate outreach message
    const outreach = await generateOutreachMessage({
      buyer_name: "Calon Buyer",
      buyer_category: params.category.replace(/_/g, " ") || "distributor pangan",
      commodity: params.commodity,
      stock: params.stock || 500,
      unit: params.unit,
      price: params.price || 30000,
      city: params.city,
    });

    const result: AgentResult = {
      agentId: "nusatani_agent",
      title: "NusaTani AI - WhatsApp Outreach",
      content: outreach.message,
      timestamp,
      status: "success",
    };

    return {
      status: "completed",
      controllerStatus: "completed",
      orchestratorPlan: { intent: "generate_outreach", priority: "normal", controller: "nusatani_agent", tasks: [{ id: "outreach_1", agent: "nusatani_agent", action: "generate_whatsapp_message", status: "done" }] },
      tasks: [{ id: "outreach_1", title: "Generate WhatsApp message", assignedTo: "nusatani_agent", status: "done", progress: 100, dependsOn: [], outputPreview: "Pesan WA siap dicopy" }],
      agentResults: [result],
      activityLogs: [
        { id: "nt_1", timestamp, level: "info", message: "NusaTani Agent: Generate outreach message" },
        { id: "nt_2", timestamp, level: "success", message: `Mode: ${outreach.mode}` },
      ],
      finalAnswer: `**Pesan WhatsApp siap dicopy:**\n\n${outreach.message}`,
      artifacts: [{ type: "report", title: "WhatsApp Message", content: outreach.message, language: "markdown" }],
      _meta: { mode: outreach.mode },
    };
  }

  // Buyer search
  const { buyers, mode } = await searchBuyers(params);
  const topBuyers = buyers.slice(0, 5);

  const buyerList = topBuyers.map((b, i) => `${i + 1}. **${b.name}** (Score: ${b.buyer_score})\n   ${b.category.replace(/_/g, " ")} · ${b.city}\n   ${b.phone !== "kontak tidak tersedia" ? b.phone : "Kontak belum tersedia"}\n   _${b.ai_notes}_`).join("\n\n");

  const report = `**Hasil Pencarian Buyer ${params.commodity} di ${params.city}**\n\nDitemukan ${buyers.length} calon buyer. Top 5:\n\n${buyerList}\n\n---\nMode: ${mode === "live" ? "Google Places" : "Mock Data"}\nTip: Buka halaman Buyer Finder untuk fitur lengkap (simpan lead, buat pesan WA).`;

  const results: AgentResult[] = [
    { agentId: "nusatani_agent", title: `NusaTani AI - Buyer Search: ${params.commodity} di ${params.city}`, content: report, timestamp, status: "success" },
  ];

  const artifacts: Artifact[] = [
    { type: "json", title: "Buyer Search Results", content: JSON.stringify({ params, total: buyers.length, top5: topBuyers }, null, 2), language: "json" },
    { type: "report", title: "Buyer Report", content: report, language: "markdown" },
  ];

  return {
    status: "completed",
    controllerStatus: "completed",
    orchestratorPlan: {
      intent: "buyer_search",
      priority: "normal",
      controller: "nusatani_agent",
      tasks: [
        { id: "bs_1", agent: "nusatani_agent", action: "parse_buyer_request", status: "done" },
        { id: "bs_2", agent: "nusatani_agent", action: "search_buyers", status: "done" },
        { id: "bs_3", agent: "nusatani_agent", action: "score_and_rank", status: "done" },
      ],
    },
    tasks: [
      { id: "bs_1", title: "Parse buyer request", assignedTo: "nusatani_agent", status: "done", progress: 100, dependsOn: [], outputPreview: `${params.commodity} di ${params.city}` },
      { id: "bs_2", title: "Search buyers", assignedTo: "nusatani_agent", status: "done", progress: 100, dependsOn: ["bs_1"], outputPreview: `${buyers.length} buyers found` },
      { id: "bs_3", title: "Score & rank buyers", assignedTo: "nusatani_agent", status: "done", progress: 100, dependsOn: ["bs_2"], outputPreview: `Top score: ${topBuyers[0]?.buyer_score || 0}` },
    ],
    agentResults: results,
    activityLogs: [
      { id: "nt_1", timestamp, level: "info", message: "NusaTani Agent activated" },
      { id: "nt_2", timestamp, level: "info", message: `Searching: ${params.commodity} di ${params.city}` },
      { id: "nt_3", timestamp, level: "success", message: `Found ${buyers.length} buyers (mode: ${mode})` },
      { id: "nt_4", timestamp, level: "success", message: `Top buyer score: ${topBuyers[0]?.buyer_score || 0}` },
    ],
    finalAnswer: report,
    artifacts,
    _meta: { mode },
  };
}
