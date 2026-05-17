// Build an embeddable player URL for the supported providers
// (YouTube, Vimeo, VK Video, Rutube). Returns null for anything
// unknown so the UI falls back to a plain link.
export function videoEmbed(url: string): string | null {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.replace(/^www\./, "");

  if (host.includes("youtube.com")) {
    const id = u.searchParams.get("v");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = u.pathname.replace(/^\//, "");
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (host.includes("vimeo.com")) {
    const id = u.pathname.split("/").filter(Boolean)[0];
    return /^\d+$/.test(id ?? "") ? `https://player.vimeo.com/video/${id}` : null;
  }
  if (host.includes("rutube.ru")) {
    const parts = u.pathname.split("/").filter(Boolean); // video/<hash>
    const hash = parts[0] === "video" ? parts[1] : parts[0];
    return hash ? `https://rutube.ru/play/embed/${hash}` : null;
  }
  if (host.includes("vk.com") || host.includes("vkvideo.ru")) {
    // .../video-12345_67890  ->  oid=-12345 id=67890
    const seg = u.pathname.split("/").filter(Boolean).pop() ?? "";
    const m = seg.match(/video(-?\d+)_(\d+)/);
    if (m) return `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}`;
    return null;
  }
  return null;
}
