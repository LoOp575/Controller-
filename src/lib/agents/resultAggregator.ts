import { AgentResult } from "@/types";

export function aggregateAgentResults(command: string, results: AgentResult[]): string {
  const successful = results.filter((result) => result.status === "success");
  const failed = results.filter((result) => result.status === "error");

  return `**Agent Runner Completed**\n\n**User Command:**\n${command}\n\n**Agents Completed:** ${successful.length}\n**Agents Failed/Fallback:** ${failed.length}\n\n${results
    .map(
      (result) =>
        `### ${result.title}\nStatus: ${result.status}\n\n${result.content}`
    )
    .join("\n\n---\n\n")}\n\n**Final Controller Note:**\nHasil di atas adalah gabungan output agent. Gunakan ini sebagai bahan keputusan berikutnya di dashboard.`;
}
