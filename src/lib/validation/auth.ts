import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ error: "Email wajib diisi." })
    .trim()
    .min(1, "Email wajib diisi.")
    .max(254, "Email maksimal 254 karakter.")
    .pipe(z.email({ error: "Format email tidak valid." })),
  password: z
    .string({ error: "Kata sandi wajib diisi." })
    .min(8, "Kata sandi minimal 8 karakter.")
    .max(72, "Kata sandi maksimal 72 karakter."),
});

export type LoginValues = z.infer<typeof loginSchema>;
