import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { StatusBadge } from "./status-badge";

describe("Button", () => {
  it("defaults to type=button", () => {
    expect(renderToStaticMarkup(<Button>Save</Button>)).toContain('type="button"');
  });

  it("disables itself and reports busy while loading", () => {
    const html = renderToStaticMarkup(<Button loading>Save</Button>);
    expect(html).toContain("disabled");
    expect(html).toContain('aria-busy="true"');
  });
});

describe("StatusBadge", () => {
  it("maps statuses to labels and tones", () => {
    const html = renderToStaticMarkup(<StatusBadge kind="payment" status="paid" />);
    expect(html).toContain("Paid");
    expect(html).toContain("bg-success");
  });

  it("falls back to a neutral badge for an unknown status", () => {
    const status = "archived" as unknown as "new";
    const html = renderToStaticMarkup(<StatusBadge kind="lead" status={status} />);
    expect(html).toContain("archived");
  });
});
