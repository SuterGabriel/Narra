import { ImageResponse } from "next/og";

export const alt = "Narra: Mario und der Zauberer lernen, jede Aussage mit Seite und Zeile belegt";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Preview image for shared links, in the dark "Bühne" palette. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#17161D",
          color: "#EEE7D8",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, letterSpacing: 6, color: "#E0B04F", textTransform: "uppercase" }}>Narra</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>Mario und der Zauberer</div>
          <div style={{ display: "flex", fontSize: 36, color: "#A39CAE" }}>
            In drei Wochen auf Prüfungsniveau. Jede Aussage mit Seite und Zeile belegt.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 26 }}>
          {["Überblick", "Schlüsselpassagen", "Fragen mit Beleg", "Quiz"].map((t) => (
            <div key={t} style={{ display: "flex", padding: "10px 20px", borderRadius: 14, background: "#2E2718", color: "#F0C870" }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
