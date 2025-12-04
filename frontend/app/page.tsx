"use client";

export default function Home() {
  
  if (typeof window !== "undefined") {
    window.location.href = "/cloud";
    return null;
  }

  return (
    <div style={{ padding: 20 }}>
      FullCrypt Online
    </div>
  );
}
