export default function KeyInput({ userKey, setUserKey }: any) {
  return (
    <input
      type="text"
      placeholder="Chave do usuário (Base64)"
      value={userKey}
      onChange={(e) => setUserKey(e.target.value)}
      style={{ marginBottom: 10, width: "100%" }}
    />
  );
}
    