import { createServerFn } from "@tanstack/react-start";

const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "169.254.169.254", "::1"];

function isBlockedHost(hostname: string) {
  const h = hostname.toLowerCase();
  if (BLOCKED_HOSTS.includes(h)) return true;
  if (h.startsWith("10.") || h.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true;
  return false;
}

function extractMetaImage(html: string): string | undefined {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1]) return match[1];
  }
  return undefined;
}

export const fetchProductImage = createServerFn({ method: "GET" })
  .validator((url: unknown) => {
    if (typeof url !== "string") throw new Error("URL inválida");
    return url;
  })
  .handler(async ({ data: url }) => {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { imageUrl: null, error: "URL inválida" };
    }
    if (!["http:", "https:"].includes(parsed.protocol) || isBlockedHost(parsed.hostname)) {
      return { imageUrl: null, error: "URL não permitida" };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      const response = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; MyWishlistBot/1.0; +https://example.com)",
          accept: "text/html",
        },
        redirect: "follow",
      });
      clearTimeout(timeout);

      if (!response.ok) return { imageUrl: null, error: `Página respondeu ${response.status}` };

      const html = await response.text();
      const image = extractMetaImage(html);
      if (!image) return { imageUrl: null, error: "Não achei uma foto nessa página" };

      const absolute = new URL(image, parsed).toString();
      return { imageUrl: absolute, error: null };
    } catch {
      return { imageUrl: null, error: "Não consegui acessar esse link" };
    }
  });
