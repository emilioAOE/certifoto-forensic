import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CertiFoto — Actas digitales con respaldo forense para arriendos en Chile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
          display: "flex",
          flexDirection: "column",
          padding: "80px 100px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent strip */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #16a34a 0%, #15803d 100%)",
          }}
        />

        {/* Logo block */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-0.05em",
            }}
          >
            Cf
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: "#0a0e17",
              letterSpacing: "-0.02em",
            }}
          >
            CertiFoto
          </div>
        </div>

        {/* Hero text */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 100,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#0a0e17",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Documenta tu propiedad,
          </div>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#16a34a",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            sin discusiones.
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#374151",
              marginTop: 32,
            }}
          >
            Actas digitales con respaldo forense para arriendos en Chile.
          </div>
        </div>

        {/* Bottom badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 60,
            background: "white",
            border: "2px solid #16a34a",
            borderRadius: 24,
            padding: "12px 24px",
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: "#16a34a",
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "#15803d",
            }}
          >
            Sin registro · 100% gratis para probar
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
