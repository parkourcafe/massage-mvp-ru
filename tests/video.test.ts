import { describe, expect, it } from "vitest";
import { videoEmbed } from "@/lib/video";

describe("videoEmbed", () => {
  it("embeds YouTube (watch + short)", () => {
    expect(videoEmbed("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
    expect(videoEmbed("https://youtu.be/xyz789")).toBe(
      "https://www.youtube.com/embed/xyz789"
    );
  });

  it("embeds Vimeo", () => {
    expect(videoEmbed("https://vimeo.com/76543210")).toBe(
      "https://player.vimeo.com/video/76543210"
    );
  });

  it("embeds Rutube", () => {
    expect(
      videoEmbed("https://rutube.ru/video/abcdef0123456789/")
    ).toBe("https://rutube.ru/play/embed/abcdef0123456789");
  });

  it("embeds VK Video", () => {
    expect(videoEmbed("https://vk.com/video-12345_67890")).toBe(
      "https://vk.com/video_ext.php?oid=-12345&id=67890"
    );
  });

  it("returns null for unknown / invalid", () => {
    expect(videoEmbed("https://example.com/x")).toBeNull();
    expect(videoEmbed("not a url")).toBeNull();
  });
});
