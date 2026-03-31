import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "で、どうなるの？";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#f5c842",
            fontSize: 120,
            fontWeight: 900,
            letterSpacing: "-2px",
          }}
        >
          で、どうなるの？
        </span>
      </div>
    ),
    { ...size }
  );
}
