import { describe, expect, it } from "vitest";
import { normalizeImageUrl, pickImageUrlFromPayload } from "@/lib/image";

describe("image utils", () => {
  it("normaliza URL http para https", () => {
    expect(normalizeImageUrl("http://bucket.s3.amazonaws.com/avatar.jpg")).toBe(
      "https://bucket.s3.amazonaws.com/avatar.jpg",
    );
  });

  it("normaliza URL sem protocolo", () => {
    expect(normalizeImageUrl("bucket.s3.amazonaws.com/avatar.jpg")).toBe(
      "https://bucket.s3.amazonaws.com/avatar.jpg",
    );
  });

  it("resolve formato Buffer para data URL", () => {
    const value = normalizeImageUrl({ type: "Buffer", data: [255, 216, 255] });
    expect(value?.startsWith("data:image/jpeg;base64,")).toBe(true);
  });

  it("prioriza primeiro campo válido no payload", () => {
    const payload = {
      avatar: null,
      profileImage: "",
      imageUrl: "bucket.s3.amazonaws.com/avatar.jpg",
    };

    expect(pickImageUrlFromPayload(payload, ["avatar", "profileImage", "imageUrl"])).toBe(
      "https://bucket.s3.amazonaws.com/avatar.jpg",
    );
  });
});
