import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Vedanshu Joshi | Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#000000",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "monospace",
      }}
    >
      <p
        style={{
          color: "#666",
          fontSize: 18,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          margin: "0 0 24px",
        }}
      >
        Software Engineer
      </p>
      <h1
        style={{
          color: "#ffffff",
          fontSize: 88,
          fontWeight: 700,
          lineHeight: 1,
          margin: "0 0 24px",
          letterSpacing: "-2px",
        }}
      >
        Vedanshu
        <br />
        <span style={{ color: "#555" }}>Joshi</span>
      </h1>
      <p style={{ color: "#444", fontSize: 22, margin: 0, letterSpacing: "0.05em" }}>
        MS Computer Science · Purdue University
      </p>
      <div
        style={{
          position: "absolute",
          bottom: 80,
          right: 80,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
        }}
      >
        <p
          style={{
            color: "#333",
            fontSize: 14,
            margin: 0,
            fontFamily: "monospace",
            letterSpacing: "0.2em",
          }}
        >
          FULL-STACK · .NET · REACT · NODE.JS
        </p>
      </div>
    </div>,
    size,
  );
}
