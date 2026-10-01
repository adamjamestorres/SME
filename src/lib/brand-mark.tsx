import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { loadOgFonts } from "@/lib/og-fonts";

// The amber "SME" tile, rendered as a PNG for favicons and home-screen icons.
// iOS rounds home-screen icons itself, so the apple icon stays square.
export async function brandMark(px: number, { rounded = true } = {}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5a524",
          color: "#0b0c0e",
          borderRadius: rounded ? px * 0.18 : 0,
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize: px * 0.5,
          letterSpacing: px * 0.01,
        }}
      >
        {site.shortName}
      </div>
    ),
    { width: px, height: px, fonts: await loadOgFonts() },
  );
}
