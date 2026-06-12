import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Donna";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
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
          background: "#faf9f5",
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontFamily: "monospace",
            color: "#8a857a",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}
        >
          donna.fyi
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 190,
              fontWeight: 500,
              lineHeight: 1,
              color: "#26231d",
              fontFamily: "serif",
              letterSpacing: "-0.03em",
            }}
          >
            <span>Donna</span>
            <span style={{ color: "#004dfd" }}>.</span>
          </div>
          <div
            style={{
              fontSize: 34,
              fontFamily: "serif",
              fontStyle: "italic",
              color: "#57534a",
              marginTop: 28,
            }}
          >
            It&apos;s a name and a title.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(38, 35, 29, 0.18)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontFamily: "monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#57534a",
            }}
          >
            hermes agent · claude fable 5 · honcho
          </div>
          <div
            style={{
              width: 12,
              height: 12,
              background: "#004dfd",
            }}
          />
        </div>
      </div>
    ),
    { ...size },
  );
}
