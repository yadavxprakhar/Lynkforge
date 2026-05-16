/**
 * First-party cookie helpers for the SPA (via document.cookie — not HttpOnly).
 * Prefer small values; URLs and JSON payloads should stay under typical 4 KB limits per cookie.
 */

const DEFAULT_PATH = "/";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function isBrowser() {
  return typeof document !== "undefined";
}

function defaultSecure() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

/**
 * @param {string} name
 * @param {string} value
 * @param {{
 *   path?: string;
 *   maxAgeSeconds?: number;
 *   sameSite?: "Lax" | "Strict" | "None";
 *   secure?: boolean;
 * }} [options]
 */
export function setCookie(name, value, options = {}) {
  if (!isBrowser() || !name) return;

  const {
    path = DEFAULT_PATH,
    maxAgeSeconds = ONE_YEAR_SECONDS,
    sameSite = "Lax",
    secure = defaultSecure(),
  } = options;

  let cookie = `${name}=${encodeURIComponent(String(value))}`;
  cookie += `; Path=${path}`;
  if (Number.isFinite(maxAgeSeconds)) {
    cookie += `; Max-Age=${maxAgeSeconds}`;
  }
  cookie += `; SameSite=${sameSite}`;
  if (secure || sameSite === "None") {
    cookie += "; Secure";
  }

  document.cookie = cookie;
}

/**
 * Returns the decoded cookie string value or null if missing.
 * @param {string} name
 * @returns {string | null}
 */
export function getCookie(name) {
  if (!isBrowser() || !name || !document.cookie) return null;

  const prefix = `${name}=`;
  const segments = document.cookie.split(";");

  for (const segment of segments) {
    const part = segment.trim();
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length));
    }
  }

  return null;
}

/**
 * Removes the cookie by expiring it.
 * @param {string} name
 * @param {{ path?: string }} [options]
 */
export function removeCookie(name, options = {}) {
  const { path = DEFAULT_PATH } = options;
  if (!isBrowser() || !name) return;

  let cookie = `${name}=`;
  cookie += "; Max-Age=0";
  cookie += `; Path=${path}`;
  cookie += "; SameSite=Lax";

  document.cookie = cookie;
}
