import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  subject: z.string().optional(),
  message: z.string().min(5, "Nội dung lời nhắn phải từ 5 ký tự"),
});

export const NewsletterSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  name: z.string().optional(),
});

export const AIGenerateSchema = z.object({
  topic: z.string().min(3, "Chủ đề cần ít nhất 3 ký tự"),
  keywords: z.array(z.string()).optional(),
  targetWordCount: z.number().int().positive().optional().default(1000),
  categorySlug: z.string().optional(),
});

export const AffiliateClickSchema = z.object({
  productId: z.string().optional(),
  targetUrl: z.string().url("URL không hợp lệ"),
  merchant: z.string().optional().default("Shopee"),
});

export type ContactInput = z.infer<typeof ContactFormSchema>;
export type NewsletterInput = z.infer<typeof NewsletterSchema>;
export type AIGenerateInput = z.infer<typeof AIGenerateSchema>;
export type AffiliateClickInput = z.infer<typeof AffiliateClickSchema>;
