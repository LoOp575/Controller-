import { z } from "zod";

export const BuyerSearchParamsSchema = z.object({
  commodity: z.string().min(1, "Komoditas wajib diisi"),
  city: z.string().min(1, "Kota/wilayah wajib diisi"),
  category: z.string().default(""),
  stock: z.number().min(0).default(0),
  price: z.number().min(0).default(0),
  unit: z.string().default("kg"),
});

export const OutreachRequestSchema = z.object({
  buyer_name: z.string().min(1),
  buyer_category: z.string().min(1),
  commodity: z.string().min(1),
  stock: z.number().min(0),
  unit: z.string(),
  price: z.number().min(0),
  city: z.string(),
  seller_name: z.string().optional(),
});
