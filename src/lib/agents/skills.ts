/**
 * NusaTani Buyer Agent - Skills Registry
 * Defines what the agent can do. Business skills are primary,
 * technical skills only activate when user asks about dev/code.
 */

export const businessSkills = [
  "Cari buyer pangan",
  "Analisis relevansi buyer",
  "Buyer scoring",
  "Lead CRM",
  "Follow up buyer",
  "Generate pesan WhatsApp",
  "Analisis peluang pasar",
] as const;

export const dataSkills = [
  "Google Places buyer search",
  "Buyer detail enrichment",
  "Supabase save lead",
  "Deduplicate buyer",
  "Validate missing contact",
] as const;

export const technicalSkills = [
  "API integration",
  "Database",
  "Debugging",
  "Deployment",
  "TypeScript/Next.js",
  "Automation",
] as const;

export type BusinessSkill = typeof businessSkills[number];
export type DataSkill = typeof dataSkills[number];
export type TechnicalSkill = typeof technicalSkills[number];

/**
 * Determine which skill set is relevant for a given message.
 * Business/data skills are default. Technical skills only when explicitly asked.
 */
export function getActiveSkillSet(message: string): "business" | "technical" {
  const text = message.toLowerCase();
  const techKeywords = ["code", "kode", "api", "bug", "error", "deploy", "typescript", "database", "git", "build", "vercel", "supabase config", "debug"];
  if (techKeywords.some(k => text.includes(k))) return "technical";
  return "business";
}

export function getSkillsForDisplay(): string[] {
  return [...businessSkills];
}
