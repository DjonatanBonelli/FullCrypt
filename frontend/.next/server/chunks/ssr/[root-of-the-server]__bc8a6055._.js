module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
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
"[project]/app/login/handlers/userHandlers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "criarUsuario",
    ()=>criarUsuario
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/crypto/hpke-kem.ts [app-ssr] (ecmascript)");
"use client";
;
const criarUsuario = async (nome, email, senha, setStatus)=>{
    try {
        setStatus?.("🔑 Gerando chaves...");
        const { publicKey: hpkePub, privateKey: hpkePriv } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generateHpkeKeyPair"])();
        const dil = await __turbopack_context__.A("[project]/app/crypto/dilithium.ts [app-ssr] (ecmascript, async loader)");
        const { publicKey: dPub, privateKey: dPriv } = await dil.generateDilithiumKeyPair(2);
        // manda pro backend
        setStatus?.("📤 Enviando dados...");
        const res = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                email,
                senha,
                pk_kyber: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uEncode"])(Uint8Array.from(hpkePub)),
                pk_dilithium: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uEncode"])(Uint8Array.from(dPub))
            })
        });
        if (!res.ok) throw new Error("Erro ao criar usuário");
        // montar arquivo único
        const fileObj = {
            kyber: {
                public: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uEncode"])(hpkePub),
                private: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uEncode"])(hpkePriv)
            },
            dilithium: {
                public: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uEncode"])(dPub),
                private: (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$crypto$2f$hpke$2d$kem$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["b64uEncode"])(dPriv)
            }
        };
        const blob = new Blob([
            JSON.stringify(fileObj, null, 2)
        ], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${email}_keys.json`;
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setStatus?.("Usuário criado! Arquivo de chaves baixado.");
    } catch (err) {
        console.error(err);
        setStatus?.("Erro ao criar usuário");
    }
};
}),
"[project]/app/login/components/RegisterForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RegisterForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$login$2f$handlers$2f$userHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/login/handlers/userHandlers.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function RegisterForm() {
    const [nome, setNome] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [senha, setSenha] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const handleSubmit = async (e)=>{
        e.preventDefault();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$login$2f$handlers$2f$userHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["criarUsuario"])(nome, email, senha, setStatus);
        setNome("");
        setEmail("");
        setSenha("");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Criar Usuário"
            }, void 0, false, {
                fileName: "[project]/app/login/components/RegisterForm.tsx",
                lineNumber: 19,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Nome",
                        value: nome,
                        onChange: (e)=>setNome(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/RegisterForm.tsx",
                        lineNumber: 21,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "email",
                        placeholder: "E-mail",
                        value: email,
                        onChange: (e)=>setEmail(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/RegisterForm.tsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "password",
                        placeholder: "Senha",
                        value: senha,
                        onChange: (e)=>setSenha(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/RegisterForm.tsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        children: "Criar"
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/RegisterForm.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/login/components/RegisterForm.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: status
            }, void 0, false, {
                fileName: "[project]/app/login/components/RegisterForm.tsx",
                lineNumber: 26,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/login/components/RegisterForm.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/app/login/handlers/authHandlers.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// loginHandler.ts
__turbopack_context__.s([
    "loginUsuario",
    ()=>loginUsuario
]);
const loginUsuario = async (email, senha, router, setStatus)=>{
    try {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            }),
            credentials: "include"
        });
        if (!res.ok) throw new Error("Credenciais inválidas");
        if (setStatus) setStatus("Login realizado com sucesso!");
        router.push("/cloud"); // redireciona
    } catch (err) {
        console.error(err);
        if (setStatus) setStatus("Erro ao realizar login");
    }
};
}),
"[project]/app/login/components/LoginForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$login$2f$handlers$2f$authHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/login/handlers/authHandlers.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function LoginForm() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [senha, setSenha] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const handleSubmit = async (e)=>{
        e.preventDefault();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$login$2f$handlers$2f$authHandlers$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loginUsuario"])(email, senha, router, setStatus);
        setEmail("");
        setSenha("");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                children: "Login"
            }, void 0, false, {
                fileName: "[project]/app/login/components/LoginForm.tsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "email",
                        placeholder: "E-mail",
                        value: email,
                        onChange: (e)=>setEmail(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/LoginForm.tsx",
                        lineNumber: 24,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "password",
                        placeholder: "Senha",
                        value: senha,
                        onChange: (e)=>setSenha(e.target.value),
                        required: true
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/LoginForm.tsx",
                        lineNumber: 25,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        children: "Entrar"
                    }, void 0, false, {
                        fileName: "[project]/app/login/components/LoginForm.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/login/components/LoginForm.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: status
            }, void 0, false, {
                fileName: "[project]/app/login/components/LoginForm.tsx",
                lineNumber: 28,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/login/components/LoginForm.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__bc8a6055._.js.map