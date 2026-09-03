import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

// Image generation
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
          backgroundColor: "#ececec",
          borderRadius: "20%",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="100"
          height="100"
          style={{
            color: "#0f0f0f",
          }}
        >
          <path
            d="M12 2.6 20.2 7v10L12 21.4 3.8 17V7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.9}
            strokeLinejoin="round"
          />
          <path
            d="M12 8.4c-1.1-.8-2.3-1.1-3.6-1.1v8.4c1.3 0 2.5.4 3.6 1.1 1.1-.8 2.3-1.1 3.6-1.1V7.3c-1.3 0-2.5.4-3.6 1.1Z"
            fill="currentColor"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
