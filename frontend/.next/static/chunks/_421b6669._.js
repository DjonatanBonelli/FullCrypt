(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/next/dist/compiled/crypto-browserify/index.js [app-client] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_next_dist_compiled_c68ff8eb._.js",
  "static/chunks/node_modules_next_dist_compiled_crypto-browserify_index_bd6a22b4.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/next/dist/compiled/crypto-browserify/index.js [app-client] (ecmascript)");
    });
});
}),
"[project]/app/crypto/dilithium.ts [app-client] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "static/chunks/node_modules_dilithium-crystals-js_dist_dilithium_min_a48a8bdb.js",
  "static/chunks/app_crypto_dilithium_ts_953722cc._.js",
  "static/chunks/app_crypto_dilithium_ts_bd6a22b4._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/app/crypto/dilithium.ts [app-client] (ecmascript)");
    });
});
}),
]);