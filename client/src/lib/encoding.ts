/**
 * base64url helpers that work in both the Node.js runtime (route handlers)
 * and the Edge runtime (middleware).
 *
 * Cookie values are stored base64url-encoded so they survive any percent
 * encoding a runtime may apply: the alphabet contains only unreserved
 * characters, so encodeURIComponent leaves it untouched.
 */

function bytesToBinary(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return binary;
}

export function toBase64(value: string): string {
  return btoa(bytesToBinary(new TextEncoder().encode(value)));
}

export function toBase64Url(value: string): string {
  return toBase64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(value: string): string {
  const padded = value
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(value.length / 4) * 4, "=");

  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
