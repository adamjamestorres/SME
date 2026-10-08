import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEmail, sendToOwners } from "./send";

const fetchMock = vi.fn<typeof fetch>();
const message = {
  to: "pat@example.com",
  subject: "Hello",
  html: "<p>Hi</p>",
  text: "Hi",
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  fetchMock.mockResolvedValue(Response.json({ id: "email_1" }));
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("EMAIL_FROM", "SME Auto & HD Truck <service@example.com>");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function sentBody() {
  return JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
}

describe("sendEmail", () => {
  it("posts the expected JSON to Resend with the bearer key", async () => {
    await sendEmail({
      ...message,
      replyTo: "owner@example.com",
      attachments: [{ filename: "signed.pdf", content: new Uint8Array([1, 2, 3]), contentType: "application/pdf" }],
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({
      Authorization: "Bearer re_test_key",
      "Content-Type": "application/json",
    });
    expect(sentBody()).toEqual({
      from: "SME Auto & HD Truck <service@example.com>",
      to: ["pat@example.com"],
      subject: "Hello",
      html: "<p>Hi</p>",
      text: "Hi",
      reply_to: "owner@example.com",
      attachments: [{ filename: "signed.pdf", content: "AQID", content_type: "application/pdf" }],
    });
  });

  it("throws with the status code, never the response body", async () => {
    fetchMock.mockResolvedValue(new Response('{"message":"pat@example.com is invalid"}', { status: 422 }));
    const error = await sendEmail(message).catch((e: Error) => e);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe("Resend request failed with status 422");
    expect((error as Error).message).not.toContain("pat@example.com");
  });

  it("prints instead of sending without a key outside production", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "development");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await sendEmail(message);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(info).toHaveBeenCalledOnce();
    expect(info.mock.calls[0][0]).toContain("pat@example.com");
    expect(info.mock.calls[0][0]).toContain("Hello");
  });

  it("throws without a key in production", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendEmail(message)).rejects.toThrow("RESEND_API_KEY is not set");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("sendEmail input checks", () => {
  it("collapses line breaks in the subject", async () => {
    await sendEmail({ ...message, subject: "New request: Pat\r\nBcc: x@example.com" });
    expect(sentBody().subject).toBe("New request: Pat Bcc: x@example.com");
  });

  it("refuses an empty recipient list", async () => {
    await expect(sendEmail({ ...message, to: [] })).rejects.toThrow("recipient");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("sendToOwners", () => {
  it("sends to every OWNER_EMAILS address", async () => {
    vi.stubEnv("OWNER_EMAILS", "Owner@Example.com, second@example.com");
    await sendToOwners({ subject: "Alert", html: "<p>x</p>", text: "x" });
    expect(sentBody().to).toEqual(["owner@example.com", "second@example.com"]);
  });

  it("throws when OWNER_EMAILS is empty", async () => {
    vi.stubEnv("OWNER_EMAILS", "");
    await expect(sendToOwners({ subject: "Alert", html: "", text: "" })).rejects.toThrow("OWNER_EMAILS");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
