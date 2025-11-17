"use client";

export default function KeyInput({ userKey, setUserKey }: any) {
  return (
    <input
      type="text"
      placeholder="Chave do usuário" // A chave deve estar em base64
      value={userKey}
      onChange={(e) => setUserKey(e.target.value)}
      className="
        w-full px-3 py-2
        rounded-md
        bg-[var(--surface-primary)]
        text-[var(--text-primary)]
        border border-[var(--surface-secondary)]
        outline-none
        focus:border-[var(--accent-primary)]
        transition-all
        neon-input
      "
    />
  );
}
