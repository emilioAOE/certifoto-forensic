import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 110,
          fontWeight: 800,
          fontFamily: "sans-serif",
          borderRadius: "32px",
          letterSpacing: "-0.05em",
        }}
      >
        Cf
      </div>
    ),
    { ...size }
  );
}
