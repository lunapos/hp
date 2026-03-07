import { ImageResponse } from "next/og";

export const alt = "LunaPos | ナイトエンタメ業界向けPOSシステム";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const notoSansJP = await fetch(
    "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap"
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
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #1a1040 100%)",
          fontFamily: '"Noto Sans JP"',
        }}
      >
        {/* 装飾の円 */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(212, 184, 112, 0.08)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 250,
            height: 250,
            borderRadius: "50%",
            background: "rgba(212, 184, 112, 0.06)",
            display: "flex",
          }}
        />

        {/* ロゴテキスト */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "#d4b870",
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          LunaPos
        </div>

        {/* 区切り線 */}
        <div
          style={{
            width: 120,
            height: 3,
            background: "linear-gradient(90deg, transparent, #d4b870, transparent)",
            marginTop: 24,
            marginBottom: 24,
            display: "flex",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255, 255, 255, 0.9)",
            display: "flex",
          }}
        >
          ナイトエンタメ業界向けPOSシステム
        </div>

        {/* サブテキスト */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: 16,
            display: "flex",
          }}
        >
          フロア管理・会計・出退勤をiPad1台で
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
