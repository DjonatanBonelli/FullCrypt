module.exports = [
"[project]/app/crypto/dilithium.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
    const { createDilithium } = await __turbopack_context__.A("[project]/node_modules/dilithium-crystals-js/src/node/index.js [app-ssr] (ecmascript, async loader)");
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
}),
];

//# sourceMappingURL=app_crypto_dilithium_ts_fcac3d9d._.js.map