/**
 * The integration point for a future waiting-list provider.
 * This preview deliberately makes no request and stores no email address.
 * Replace this adapter after configuring a provider and the privacy notice;
 * update the corresponding result copy in lib/content.ts at the same time.
 */
export async function submitWaitlist(
  _email: string,
): Promise<{ status: "preview" }> {
  return { status: "preview" };
}
