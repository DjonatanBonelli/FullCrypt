(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/crypto/dilithium.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateDilithiumKeyPair",
    ()=>generateDilithiumKeyPair,
    "getDilithium",
    ()=>getDilithium,
    "signWithDilithium",
    ()=>signWithDilithium,
    "verifyWithDilithium",
    ()=>verifyWithDilithium
]);
"use client";
async function getDilithium() {
    const { createDilithium } = await __turbopack_context__.A("[project]/node_modules/dilithium-crystals-js/dist/dilithium.min.js [app-client] (ecmascript, async loader)");
    return await createDilithium({
        wasmPath: "/dilithium.wasm",
        locateFile: (file)=>{
            if (file.endsWith(".wasm")) return "/dilithium.wasm";
            return file;
        }
    });
}
async function generateDilithiumKeyPair(kind) {
    const d = await getDilithium();
    return d.generateKeys(kind);
}
async function signWithDilithium(msg, priv, kind) {
    const d = await getDilithium();
    return d.sign(msg, priv, kind).signature;
}
async function verifyWithDilithium(sig, msg, pub, kind) {
    const d = await getDilithium();
    return d.verify(sig, msg, pub, kind).result === 0;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_crypto_dilithium_ts_953722cc._.js.map