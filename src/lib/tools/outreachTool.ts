import { OutreachRequest } from "@/types";
import { callOpenAI, isOpenAIConfigured } from "@/lib/ai/openaiClient";
import { OUTREACH_PROMPT } from "@/lib/prompts/nusataniSystemPrompt";

function generateTemplateMessage(req: OutreachRequest): string {
  const seller = req.seller_name || "kami";
  const price = new Intl.NumberFormat("id-ID").format(req.price);
  return `Selamat siang Bapak/Ibu ${req.buyer_name},\n\nPerkenalkan ${seller} supplier ${req.commodity} dari ${req.city}. Saat ini kami punya stok ${req.stock} ${req.unit} dengan harga Rp ${price}/${req.unit}.\n\nApakah saat ini sedang membutuhkan supply ${req.commodity}? Kami bisa kirim sampel dulu jika berminat.\n\nTerima kasih 🙏`;
}

export async function generateOutreachMessage(req: OutreachRequest): Promise<{ message: string; mode: "live"|"mock" }> {
  if (!isOpenAIConfigured()) {
    return { message: generateTemplateMessage(req), mode: "mock" };
  }
  const price = new Intl.NumberFormat("id-ID").format(req.price);
  const prompt = OUTREACH_PROMPT
    .replace("{commodity}", req.commodity).replace("{stock}", req.stock.toString())
    .replace("{unit}", req.unit).replace("{price}", price)
    .replace("{city}", req.city).replace("{buyer_name}", req.buyer_name)
    .replace("{buyer_category}", req.buyer_category).replace("{seller_name}", req.seller_name||"kami");

  const result = await callOpenAI({
    messages: [
      { role: "system", content: "Kamu adalah copywriter WhatsApp untuk bisnis komoditas pangan Indonesia." },
      { role: "user", content: prompt },
    ],
    temperature: 0.7, maxTokens: 300,
  });
  if (result.success) return { message: result.content.trim(), mode: "live" };
  return { message: generateTemplateMessage(req), mode: "mock" };
}
