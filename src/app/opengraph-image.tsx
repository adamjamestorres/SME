import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = `${site.name}: heavy-duty truck & auto repair, 24/7 mobile roadside`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const brand = "#f5a524";
const surface = "#0b0c0e";
const muted = "#a1a8b3";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `radial-gradient(circle at 0% 0%, rgba(245,165,36,0.18), transparent 55%), ${surface}`,
          color: "#f3f4f6",
          fontFamily: "Barlow Condensed",
        }}
      >
        <div
          style={{
            height: 18,
            width: "100%",
            backgroundImage: `repeating-linear-gradient(-45deg, ${brand} 0 22px, ${surface} 22px 44px)`,
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div
              style={{
                display: "flex",
                background: brand,
                color: surface,
                borderRadius: 10,
                padding: "4px 16px",
                fontSize: 44,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              {site.shortName}
            </div>
            <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
              Auto &amp; HD Truck
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: 52,
              fontSize: 112,
              fontWeight: 800,
              lineHeight: 0.92,
            }}
          >
            {/* Satori over-measures "HEAVY-DUTY" by about a space, so no space or gap before "TRUCK". */}
            <div style={{ display: "flex" }}>
              <span>HEAVY-DUTY</span>
              <span>TRUCK</span>
            </div>
            <span style={{ color: brand }}>&amp; AUTO REPAIR</span>
          </div>

          <div
            style={{
              display: "flex",
              marginTop: "auto",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: muted }}>Fleet · Brakes · Diesel · 24/7 Roadside</span>
            <span style={{ color: brand }}>New site coming soon</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
