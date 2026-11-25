interface Env {
  ASSETS: Fetcher;
}

const ORIGIN = "https://liecheatorsteal.com";
const HOST = "liecheatorsteal.com";

const LINK_HEADER = [
  `<${ORIGIN}/>; rel="canonical"`,
  `</llms.txt>; rel="describedby"; type="text/markdown"; title="LLM site index"`,
  `</index.md>; rel="alternate"; type="text/markdown"; title="Markdown version of this page"`,
  `</sitemap-index.xml>; rel="sitemap"; type="application/xml"`,
  `</.well-known/security.txt>; rel="security"; type="text/plain"`,
].join(", ");

const SECURITY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "X-Permitted-Cross-Domain-Policies": "none",
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' https://imagedelivery.net data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; upgrade-insecure-requests",
};

function quality(accept: string, type: string): number {
  let best = 0;
  for (const part of accept.split(",")) {
    const [rawType, ...params] = part.trim().toLowerCase().split(";");
    if (rawType.trim() !== type) continue;
    const qParam = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (Number.isFinite(q)) best = Math.max(best, q);
  }
  return best;
}

function wantsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const markdown = quality(accept, "text/markdown");
  const html = Math.max(quality(accept, "text/html"), quality(accept, "application/xhtml+xml"));
  return markdown > 0 && markdown >= html;
}

function applySecurity(headers: Headers): void {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) headers.set(name, value);
}

function withVaryAccept(headers: Headers): void {
  const vary = headers.get("Vary");
  if (!vary) headers.set("Vary", "Accept");
  else if (!vary.toLowerCase().split(",").some((part) => part.trim() === "accept")) {
    headers.set("Vary", `${vary}, Accept`);
  }
}

function isHome(pathname: string): boolean {
  return pathname === "/" || pathname === "/index.html";
}

async function fetchAsset(request: Request, env: Env): Promise<Response> {
  try {
    return await env.ASSETS.fetch(request);
  } catch {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function decorate(response: Response, request: Request): Response {
  const url = new URL(request.url);
  const headers = new Headers(response.headers);
  applySecurity(headers);
  if (url.pathname === "/index.md") {
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    headers.set("X-Robots-Tag", "noindex");
  }
  if (url.pathname === "/llms.txt") {
    headers.set("Content-Type", "text/plain; charset=utf-8");
    headers.set("X-Robots-Tag", "noindex");
  }
  if (url.pathname === "/.well-known/security.txt") {
    headers.set("Content-Type", "text/plain; charset=utf-8");
  }
  const type = headers.get("content-type") ?? "";
  if (response.status === 200 && isHome(url.pathname) && type.includes("text/html")) {
    headers.set("Link", LINK_HEADER);
    withVaryAccept(headers);
  }
  if (response.status === 404) headers.set("X-Robots-Tag", "noindex");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === `www.${HOST}`) {
      const destination = new URL(url);
      destination.protocol = "https:";
      destination.hostname = HOST;
      return Response.redirect(destination.toString(), 301);
    }

    const method = request.method;
    if (isHome(url.pathname) && (method === "GET" || method === "HEAD") && wantsMarkdown(request.headers.get("Accept"))) {
      const markdown = await fetchAsset(new Request(new URL("/index.md", url.origin), { method: "GET" }), env);
      if (markdown.ok && markdown.body) {
        const headers = new Headers(markdown.headers);
        headers.set("Content-Type", "text/markdown; charset=utf-8");
        headers.set("X-Robots-Tag", "noindex");
        headers.set("Cache-Control", "public, max-age=0, must-revalidate");
        headers.set("Link", LINK_HEADER);
        withVaryAccept(headers);
        applySecurity(headers);
        return new Response(method === "HEAD" ? null : markdown.body, { status: 200, headers });
      }
    }

    return decorate(await fetchAsset(request, env), request);
  },
} satisfies ExportedHandler<Env>;
