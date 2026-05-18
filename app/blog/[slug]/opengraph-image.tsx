import { ImageResponse } from "next/og";
import { getBlogSource } from "@/lib/blog/source";
import { AUTHORS } from "@/lib/blog/types";

export const runtime = "nodejs";
export const alt = "donna.fyi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogSource().getPost(slug);

  const title = post?.title ?? "donna.fyi";
  const rawTitle = title.length > 80 ? title.slice(0, 77) + "..." : title;
  const author = post?.author ?? AUTHORS.donna;
  const accentColor = author.tag === "donna" ? "#a78bfa" : "#fbbf24";

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
          background: "#0a0a0c",
          backgroundImage:
            "radial-gradient(circle at 20% 0%, rgba(167, 139, 250, 0.12), transparent 50%), radial-gradient(circle at 100% 100%, rgba(251, 191, 36, 0.06), transparent 50%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: accentColor,
            }}
          />
          <div
            style={{
              fontSize: 18,
              fontFamily: "monospace",
              color: "#a1a1aa",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            donna.fyi
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 600,
            lineHeight: 1.05,
            color: "#fafafa",
            letterSpacing: "-0.02em",
            maxWidth: "85%",
          }}
        >
          {rawTitle}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 4,
                height: 36,
                background: accentColor,
                borderRadius: 2,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontSize: 14,
                  fontFamily: "monospace",
                  color: "#71717a",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                author
              </div>
              <div
                style={{
                  fontSize: 28,
                  color: "#e4e4e7",
                  fontFamily: "serif",
                  fontWeight: 500,
                }}
              >
                {author.name}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              color: "#52525b",
              letterSpacing: "0.18em",
            }}
          >
            DONNA.FYI/BLOG
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
