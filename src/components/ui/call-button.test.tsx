import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { CallButton } from "./call-button";

describe("CallButton", () => {
  it("links to the shop's number in E.164 form", () => {
    const html = renderToStaticMarkup(<CallButton />);
    expect(html).toMatch(/href="tel:\+1\d{10}"/);
    expect(html).toContain(`href="tel:${site.phone.tel}"`);
    expect(html).toContain("Call now");
  });

  it("accepts a custom label", () => {
    const html = renderToStaticMarkup(<CallButton>Call {site.phone.display}</CallButton>);
    expect(html).toContain(site.phone.display);
    expect(html).not.toContain("Call now");
  });
});
