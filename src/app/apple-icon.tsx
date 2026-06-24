import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Branded home-screen icon for iOS (corners are rounded by the OS).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          position: "relative",
          background: "linear-gradient(135deg, #f7a90b, #f5810b)",
        }}
      >
        {[6, 4, 6, 4, 6, 4].map((w, i) => (
          <div
            key={i}
            style={{ width: w, height: 120, borderRadius: 4, background: "rgba(42,20,6,0.55)" }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 44,
            top: 77,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: "#2a1406",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
