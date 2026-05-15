/** Pull a human-readable message from Spring Boot / axios error bodies. */
export function extractApiErrorMessage(err) {
  const res = err?.response;
  const data = res?.data;

  let fromBody = null;

  if (data != null) {
    if (typeof data === "string") {
      const s = data.trim();
      if (s) fromBody = s;
    } else if (typeof data === "object") {
      const o = data;
      if (typeof o.detail === "string" && o.detail.trim()) fromBody = o.detail.trim();
      else if (typeof o.message === "string" && o.message.trim())
        fromBody = o.message.trim();
      else if (typeof o.title === "string" && o.title.trim() && o.title !== "Bad Request")
        fromBody = o.title.trim();
      else if (typeof o.error === "string" && o.error.trim()) fromBody = o.error.trim();
      else if (Array.isArray(o.errors) && o.errors.length > 0) {
        const first = o.errors[0];
        if (typeof first === "string") fromBody = first;
        else if (first?.defaultMessage) fromBody = String(first.defaultMessage);
      }
    }
  }

  const status = res?.status;
  const statusLine =
    status != null
      ? `HTTP ${status}${res.statusText ? ` ${res.statusText}` : ""}`
      : null;

  if (fromBody) return fromBody;
  if (statusLine) return statusLine;
  return null;
}
