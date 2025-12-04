module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/app/shared/handlers/handlers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "aceitarCompartilhamento",
    ()=>aceitarCompartilhamento,
    "recusarCompartilhamento",
    ()=>recusarCompartilhamento
]);
const aceitarCompartilhamento = async (id)=>{
    await fetch(`/api/shared/${id}/aceitar`, {
        method: "POST",
        credentials: "include"
    });
    return {
        id,
        status: "aceito"
    };
};
const recusarCompartilhamento = async (id)=>{
    await fetch(`/api/shared/${id}/recusar`, {
        method: "POST",
        credentials: "include"
    });
    return {
        id,
        status: "recusado"
    };
};
}),
"[project]/app/crypto/hpke-kem.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "b64uDecode",
    ()=>b64uDecode,
    "b64uEncode",
    ()=>b64uEncode,
    "decryptBytesWithHpke",
    ()=>decryptBytesWithHpke,
    "encryptBytesWithHpke",
    ()=>encryptBytesWithHpke,
    "generateHpkeKeyPair",
    ()=>generateHpkeKeyPair
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$core$2f$esm$2f$mod$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@hpke/core/esm/mod.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$core$2f$esm$2f$src$2f$aeads$2f$aesGcm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hpke/core/esm/src/aeads/aesGcm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$core$2f$esm$2f$src$2f$native$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hpke/core/esm/src/native.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$ml$2d$kem$2f$esm$2f$mod$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@hpke/ml-kem/esm/mod.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$ml$2d$kem$2f$esm$2f$src$2f$mlKem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@hpke/ml-kem/esm/src/mlKem.js [app-ssr] (ecmascript)");
;
;
function b64uEncode(buf) {
    return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function b64uDecode(s) {
    return Uint8Array.from(Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64"));
}
// === Criar CipherSuite ===
async function makeSuite() {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$core$2f$esm$2f$src$2f$native$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CipherSuite"]({
        kem: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$ml$2d$kem$2f$esm$2f$src$2f$mlKem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MlKem768"](),
        kdf: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$core$2f$esm$2f$src$2f$native$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["HkdfSha256"](),
        aead: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$hpke$2f$core$2f$esm$2f$src$2f$aeads$2f$aesGcm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Aes256Gcm"]()
    });
}
async function generateHpkeKeyPair() {
    const suite = await makeSuite();
    const { privateKey, publicKey } = await suite.kem.generateKeyPair();
    console.log("Private Key:", privateKey);
    console.log("Public Key:", publicKey);
    // Pegamos apenas o Uint8Array interno
    return {
        privateKey: Array.from(privateKey.key),
        publicKey: Array.from(publicKey.key)
    };
}
async function encryptBytesWithHpke(pubBytes, plaintext) {
    const suite = await makeSuite();
    const pk = await suite.kem.importKey("raw", pubBytes, true); // public key raw
    const sender = await suite.createSenderContext({
        recipientPublicKey: pk
    });
    const ciphertext = await sender.seal(plaintext);
    const enc = sender.enc;
    return {
        enc: b64uEncode(enc),
        ciphertext: ciphertext,
        aead: "Aes256Gcm",
        kem: "MlKem768"
    };
}
async function decryptBytesWithHpke(privBytes, enc, ciphertext) {
    //console.log(privBytes.length, enc.length, ciphertext.length);
    //console.log(enc);
    const suite = await makeSuite();
    const sk = await suite.kem.importKey("raw", privBytes, false);
    const recipient = await suite.createRecipientContext({
        recipientKey: sk,
        enc: enc
    });
    const plaintext = await recipient.open(ciphertext);
    return new Uint8Array(plaintext);
}
}),
"[project]/app/handlers/downloadFileHandlers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// handleDownload.ts
__turbopack_context__.s([
    "handleDownload",
    ()=>handleDownload
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/crypto/hpke-kem.ts [app-ssr] (ecmascript)");
;
const handleDownload = async (arquivo, userPrivKey, setStatus)=>{
    if (!userPrivKey) return alert("Informe a chave privada para descriptografar!");
    try {
        // Faz o fetch do arquivo criptografado como bytes
        const res = await fetch(`/api/download/${arquivo.arquivo_id}`, {
            credentials: "include"
        });
        if (!res.ok) throw new Error("Erro ao baixar arquivo");
        const userPrivKeyBytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uDecode"])(userPrivKey);
        const encBytes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uDecode"])(arquivo.chave_encrypted);
        const encryptedBytes = new Uint8Array(await res.arrayBuffer()); // BYTEA do backend
        // Descriptografa usando HPKE
        const decrypted = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["decryptBytesWithHpke"])(userPrivKeyBytes, encBytes, encryptedBytes);
        // Cria Blob e baixa
        const blob = new Blob([
            decrypted
        ]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = arquivo.arquivo_nome;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    } catch (err) {
        console.error(err);
        if (setStatus) setStatus("Erro ao descriptografar arquivo");
    }
};
}),
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
"[project]/app/cloud/handlers/userHandlers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchUserPublicKey",
    ()=>fetchUserPublicKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/crypto/hpke-kem.ts [app-ssr] (ecmascript)");
;
const fetchUserPublicKey = async (email)=>{
    const res = await fetch(`/api/users/pk?email=${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uDecode"])(data.pk_kyber), (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uDecode"])(data.pk_dilithium);
};
}),
"[project]/app/shared/handlers/shareHandlers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleShare",
    ()=>handleShare
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$dilithium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/crypto/dilithium.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$cloud$2f$handlers$2f$userHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/cloud/handlers/userHandlers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/crypto/hpke-kem.ts [app-ssr] (ecmascript)");
;
;
;
const handleShare = async (file, targetEmail, setStatus)=>{
    try {
        const nonce = null;
        const fileBytes = new Uint8Array(await file.arrayBuffer());
        setStatus("🔑 Buscando chave pública do destinatário...");
        const userKeys = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$cloud$2f$handlers$2f$userHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["fetchUserPublicKey"])(targetEmail);
        if (!userKeys || !userKeys.pk_kyber || !userKeys.pk_dilithium) throw new Error("Usuário não encontrado");
        const { pk_kyber, pk_dilithium } = userKeys;
        // Criptografa
        const { enc, ciphertext } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["encryptBytesWithHpke"])(pk_kyber, fileBytes);
        const encBytes = new Uint8Array(Buffer.from(enc, "base64"));
        const signature = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$dilithium$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signWithDilithium"])(encBytes, pk_dilithium, 2);
        // Monta o form
        const formData = new FormData();
        formData.append("file", new Blob([
            ciphertext
        ]), file.name + ".enc");
        formData.append("nome_arquivo", file.name);
        formData.append("email", targetEmail);
        formData.append("chave_encrypted", enc);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        setStatus("📤 Enviando arquivo criptografado...");
        const res = await fetch("/api/share", {
            method: "POST",
            credentials: "include",
            body: formData
        });
        if (res.ok) setStatus("✅ Arquivo compartilhado com sucesso!");
        else {
            const data = await res.json().catch(()=>({}));
            setStatus(`❌ Erro: ${data.message || "Falha ao compartilhar"}`);
        }
    } catch (err) {
        console.error("Erro no compartilhamento:", err);
        setStatus("❌ Erro ao compartilhar arquivo");
    }
};
}),
"[project]/app/shared/components/ShareModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShareModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$handlers$2f$shareHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/shared/handlers/shareHandlers.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function ShareModal({ isOpen, onClose, setStatus }) {
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recipient, setRecipient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!file || !recipient) return;
        // chama o handler centralizado
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$handlers$2f$shareHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleShare"])(file, recipient, setStatus);
        onClose();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: overlayStyle,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            style: modalStyle,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    style: {
                        marginBottom: 10
                    },
                    children: "Compartilhar arquivo"
                }, void 0, false, {
                    fileName: "[project]/app/shared/components/ShareModal.tsx",
                    lineNumber: 29,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    style: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: "Destinatário (email)",
                            value: recipient,
                            onChange: (e)=>setRecipient(e.target.value),
                            required: true,
                            style: inputStyle
                        }, void 0, false, {
                            fileName: "[project]/app/shared/components/ShareModal.tsx",
                            lineNumber: 31,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "file",
                            onChange: (e)=>setFile(e.target.files?.[0] ?? null),
                            required: true,
                            style: inputStyle
                        }, void 0, false, {
                            fileName: "[project]/app/shared/components/ShareModal.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: "flex",
                                gap: "8px",
                                marginTop: 10
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    style: buttonPrimary,
                                    children: "Enviar"
                                }, void 0, false, {
                                    fileName: "[project]/app/shared/components/ShareModal.tsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    style: buttonSecondary,
                                    onClick: onClose,
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/app/shared/components/ShareModal.tsx",
                                    lineNumber: 47,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/shared/components/ShareModal.tsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/shared/components/ShareModal.tsx",
                    lineNumber: 30,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/shared/components/ShareModal.tsx",
            lineNumber: 28,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/shared/components/ShareModal.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
// ===== ESTILOS =====
const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000
};
const modalStyle = {
    backgroundColor: "#1e1e1e",
    color: "#f1f1f1",
    padding: "20px",
    borderRadius: "8px",
    width: "90%",
    maxWidth: "400px",
    boxShadow: "0 0 15px rgba(0,0,0,0.3)"
};
const inputStyle = {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #444",
    backgroundColor: "#2a2a2a",
    color: "#f1f1f1"
};
const buttonPrimary = {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer"
};
const buttonSecondary = {
    backgroundColor: "#444",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: "4px",
    cursor: "pointer"
};
}),
"[project]/app/shared/components/CompartilhamentoItem.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompartilhamentoItem
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function CompartilhamentoItem({ arquivoNome, senderNome, onAceitar, onRecusar }) {
    console.log(senderNome, "quer compartilhar", arquivoNome);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            marginBottom: "1rem"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                children: [
                    senderNome,
                    " quer compartilhar: ",
                    arquivoNome
                ]
            }, void 0, true, {
                fileName: "[project]/app/shared/components/CompartilhamentoItem.tsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            onAceitar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onAceitar,
                children: "Aceitar"
            }, void 0, false, {
                fileName: "[project]/app/shared/components/CompartilhamentoItem.tsx",
                lineNumber: 15,
                columnNumber: 21
            }, this),
            onRecusar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onRecusar,
                children: "Recusar"
            }, void 0, false, {
                fileName: "[project]/app/shared/components/CompartilhamentoItem.tsx",
                lineNumber: 16,
                columnNumber: 21
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/shared/components/CompartilhamentoItem.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/shared/components/CompartilhamentoAceito.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CompartilhamentoAceito
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
;
function CompartilhamentoAceito({ arquivoNome, senderNome }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            children: [
                arquivoNome,
                " de ",
                senderNome
            ]
        }, void 0, true, {
            fileName: "[project]/app/shared/components/CompartilhamentoAceito.tsx",
            lineNumber: 9,
            columnNumber: 15
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/shared/components/CompartilhamentoAceito.tsx",
        lineNumber: 9,
        columnNumber: 10
    }, this);
}
}),
"[project]/app/shared/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Compartilhamentos
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$handlers$2f$handlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/shared/handlers/handlers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$handlers$2f$downloadFileHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/handlers/downloadFileHandlers.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$components$2f$ShareModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/shared/components/ShareModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$components$2f$CompartilhamentoItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/shared/components/CompartilhamentoItem.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$components$2f$CompartilhamentoAceito$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/shared/components/CompartilhamentoAceito.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
function Compartilhamentos() {
    const [compartilhamentos, setCompartilhamentos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [shareModalOpen, setShareModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedFileId, setSelectedFileId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const openShareModal = (id)=>{
        setSelectedFileId(id);
        setShareModalOpen(true);
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        fetch("/api/shared", {
            credentials: "include"
        }).then((res)=>res.json()).then((data)=>setCompartilhamentos(data));
    }, []);
    const handleAceitar = async (id)=>{
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$handlers$2f$handlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["aceitarCompartilhamento"])(id);
        setCompartilhamentos((prev)=>prev.map((c)=>c.id === result.id ? {
                    ...c,
                    status: result.status
                } : c));
    };
    const handleRecusar = async (id)=>{
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$handlers$2f$handlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["recusarCompartilhamento"])(id);
        setCompartilhamentos((prev)=>prev.map((c)=>c.id === result.id ? {
                    ...c,
                    status: result.status
                } : c));
    };
    const pendentes = compartilhamentos.filter((c)=>c.status === "pendente");
    const aceitos = compartilhamentos.filter((c)=>c.status === "aceito");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                style: {
                    marginLeft: 10
                },
                onClick: ()=>setShareModalOpen(true),
                children: "🤝 Compartilhar"
            }, void 0, false, {
                fileName: "[project]/app/shared/page.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$components$2f$ShareModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: shareModalOpen,
                onClose: ()=>setShareModalOpen(false),
                setStatus: setStatus
            }, void 0, false, {
                fileName: "[project]/app/shared/page.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Solicitações de compartilhamento"
            }, void 0, false, {
                fileName: "[project]/app/shared/page.tsx",
                lineNumber: 63,
                columnNumber: 7
            }, this),
            pendentes.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$components$2f$CompartilhamentoItem$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    arquivoNome: c.arquivo_nome,
                    senderNome: c.sender_nome,
                    onAceitar: ()=>handleAceitar(c.id),
                    onRecusar: ()=>handleRecusar(c.id)
                }, c.id, false, {
                    fileName: "[project]/app/shared/page.tsx",
                    lineNumber: 65,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Arquivos compartilhados com você"
            }, void 0, false, {
                fileName: "[project]/app/shared/page.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            aceitos.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    style: {
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$shared$2f$components$2f$CompartilhamentoAceito$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            arquivoNome: c.arquivo_nome,
                            senderNome: c.sender_nome
                        }, void 0, false, {
                            fileName: "[project]/app/shared/page.tsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                const userKey = prompt("Informe a chave para descriptografar:");
                                if (userKey) (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$handlers$2f$downloadFileHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleDownload"])(c, userKey, setStatus);
                            },
                            children: "Baixar"
                        }, void 0, false, {
                            fileName: "[project]/app/shared/page.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this)
                    ]
                }, c.id, true, {
                    fileName: "[project]/app/shared/page.tsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this)),
            status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: status
            }, void 0, false, {
                fileName: "[project]/app/shared/page.tsx",
                lineNumber: 92,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/shared/page.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7b1e2397._.js.map