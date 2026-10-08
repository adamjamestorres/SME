import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

function inputTag(html: string): string {
  const tag = /<input[^>]*>/.exec(html)?.[0];
  if (!tag) throw new Error("no <input> rendered");
  return tag;
}

describe("Input", () => {
  it("marks itself invalid and points aria-describedby at the error", () => {
    const html = renderToStaticMarkup(
      <Input id="phone" name="phone" label="Phone" error="Enter a phone number" />,
    );
    const input = inputTag(html);
    expect(input).toContain('aria-invalid="true"');
    expect(input).toContain('aria-describedby="phone-error"');
    expect(html).toMatch(/<p id="phone-error"[^>]*>Enter a phone number<\/p>/);
  });

  it("describes itself by both hint and error", () => {
    const input = inputTag(
      renderToStaticMarkup(<Input id="email" label="Email" hint="We reply here" error="Required" />),
    );
    expect(input).toContain('aria-describedby="email-hint email-error"');
  });

  it("is valid with no error", () => {
    const input = inputTag(renderToStaticMarkup(<Input id="name" label="Name" />));
    expect(input).not.toContain(" aria-invalid=");
    expect(input).not.toContain(" aria-describedby=");
  });

  it("labels the control and passes input attributes through", () => {
    const html = renderToStaticMarkup(
      <Input label="Phone" type="tel" inputMode="tel" autoComplete="tel" />,
    );
    const input = inputTag(html);
    const id = /id="([^"]+)"/.exec(input)?.[1];
    expect(html).toContain(`for="${id}"`);
    expect(input).toContain('type="tel"');
    expect(input).toContain('inputMode="tel"');
    expect(input).toContain('autoComplete="tel"');
  });
});
