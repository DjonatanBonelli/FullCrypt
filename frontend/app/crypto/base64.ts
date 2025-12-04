// === Encode / Decode base64url ===
export function b64uEncode(buf: Uint8Array) {
    return Buffer.from(buf)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  export function b64uDecode(s: string) {
    return Uint8Array.from(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
  }