import { ImageResponse } from "next/og";
import { getBlogSource } from "@/lib/blog/source";
import { AUTHORS } from "@/lib/blog/types";
import { formatPublishDate } from "@/lib/blog/format";

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
  const accentColor = author.tag === "donna" ? "#004dfd" : "#9a6a00";
  const date = post ? formatPublishDate(post.publishedAt) : null;

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
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              background: "#004dfd",
            }}
          />
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
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 500,
              lineHeight: 1.08,
              color: "#26231d",
              fontFamily: "serif",
              letterSpacing: "-0.02em",
              maxWidth: "88%",
            }}
          >
            {rawTitle}
          </div>
          <div
            style={{
              width: 120,
              height: 5,
              background: "#004dfd",
              marginTop: 36,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(38, 35, 29, 0.18)",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontSize: 17,
              fontFamily: "monospace",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#57534a",
            }}
          >
            <span>donna.fyi</span>
            {date && <span style={{ color: "#8a857a" }}>·</span>}
            {date && <span>{date}</span>}
            <span style={{ color: "#8a857a" }}>·</span>
            <span style={{ color: accentColor }}>{author.name}</span>
          </div>

          <div
            style={{
              fontSize: 14,
              fontFamily: "monospace",
              color: "#8a857a",
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
