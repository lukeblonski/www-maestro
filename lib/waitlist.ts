/**
 * Sends a waiting-list sign-up to the sign-up function (Cloudflare Workers, code in worker/).
 * The function adds the address to the Resend contacts and emails the owner; this page never
 * talks to Resend and holds no key. The function address comes from NEXT_PUBLIC_WAITLIST_URL
 * at build time. The request is a simple CORS request (JSON as plain text, no custom headers),
 * so browsers send it without a preflight.
 */

/** The same pattern the sign-up function checks (worker/index.ts). */
export const WZORZEC_ADRESU = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ADRES_FUNKCJI = process.env.NEXT_PUBLIC_WAITLIST_URL ?? "";

export async function submitWaitlist(
  email: string,
  website: string,
): Promise<{ status: "success" | "failed" }> {
  if (!ADRES_FUNKCJI) return { status: "failed" };
  try {
    const odpowiedz = await fetch(ADRES_FUNKCJI, {
      method: "POST",
      body: JSON.stringify({ email, website }),
    });
    return { status: odpowiedz.ok ? "success" : "failed" };
  } catch {
    return { status: "failed" };
  }
}
