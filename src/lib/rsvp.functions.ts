import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.union([z.literal(""), z.string().email().max(254)]),
  response: z.enum(["yes", "maybe", "no"]),
  website: z.string().max(200).default(""),
});

const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function createCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export const submitRsvp = createServerFn({ method: "POST" })
  .inputValidator((data) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    if (data.website) throw new Error("Unable to send your RSVP.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (let attempt = 0; attempt < 3; attempt++) {
      const accessCode = createCode();
      const { error } = await supabaseAdmin.from("wedding_rsvps").insert({
        guest_name: data.name,
        email: data.email || null,
        response: data.response,
        access_code: accessCode,
      });
      if (!error) return { accessCode };
      if (error.code !== "23505") throw new Error("Your RSVP could not be saved. Please try again.");
    }
    throw new Error("Your RSVP could not be saved. Please try again.");
  });