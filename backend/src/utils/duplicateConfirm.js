/** True when client explicitly chose to proceed despite duplicate warning. */
export function wantsDuplicateConfirm(body) {
  if (!body || typeof body !== "object") return false;
  const v = body.confirm_duplicate;
  return v === true || v === "true" || v === 1 || v === "1";
}
