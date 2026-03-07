import { ImageResponse } from "next/og";
import { getArticle, getAllSlugs } from "@/lib/media";

export const alt = "LunaPos コラム";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);

  const title = article?.title ?? "LunaPos コラム";
  const category = article?.category ?? "";
  const date = article?.date?.slice(0, 10) ?? "";

  const notoSansJP = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
  ).then(async (css) => {
    const text = await css.text();
    const fontUrl = text.match(
      /src:\s*url\(([^)]+)\)\s*format\('[^']*'\)/
    )?.[1];
    if (!fontUrl) throw new Error("フォントURLが見つかりません");
    const fontRes = await fetch(fontUrl);
    return fontRes.arrayBuffer();
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #1a1040 100%)",
          fontFamily: '"Noto Sans JP"',
          padding: "60px 80px",
        }}
      >
        {/* 上部: カテゴリ + 日付 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 32,
          }}
        >
          {category && (
            <div
              style={{
                fontSize: 20,
                color: "#1a1040",
                background: "#d4b870",
                padding: "6px 20px",
                borderRadius: 20,
                fontWeight: 700,
                display: "flex",
              }}
            >
              {category}
            </div>
          )}
          {date && (
            <div
              style={{
                fontSize: 20,
                color: "rgba(255, 255, 255, 0.5)",
                display: "flex",
              }}
            >
              {date}
            </div>
          )}
        </div>

        {/* タイトル */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: title.length > 40 ? 40 : title.length > 25 ? 48 : 56,
              fontWeight: 700,
              color: "rgba(255, 255, 255, 0.95)",
              lineHeight: 1.4,
              display: "flex",
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>
        </div>

        {/* 下部: サイト名 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(212, 184, 112, 0.3)",
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#d4b870",
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            LunaPos
          </div>
          <div
            style={{
              fontSize: 18,
              color: "rgba(255, 255, 255, 0.4)",
              display: "flex",
            }}
          >
            lunapos.jp
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP",
          data: notoSansJP,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
