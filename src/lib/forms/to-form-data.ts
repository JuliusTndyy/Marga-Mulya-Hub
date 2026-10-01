// Builds the public-form FormData explicitly (design D17), never with new FormData(formElement):
// empty strings / null / undefined are skipped, and `photo` is appended only when a File is passed.
export function toFormData(values: Record<string, unknown>, photo?: File | null): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) {
    if (k === "photo" || v === null || v === undefined || v === "") continue;
    fd.append(k, String(v));
  }
  if (photo) fd.append("photo", photo);
  return fd;
}
