interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname;

    if (hostname === 'www.liecheatorsteal.com') {
      const redirectUrl = new URL(url.toString());
      redirectUrl.hostname = 'liecheatorsteal.com';
      return Response.redirect(redirectUrl.toString(), 301);
    }

    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status === 404) {
      const notFoundRequest = new Request(new URL('/404.html', url.origin), request);
      const notFoundResponse = await env.ASSETS.fetch(notFoundRequest);
      if (notFoundResponse.ok) {
        return new Response(notFoundResponse.body, {
          status: 404,
          headers: notFoundResponse.headers,
        });
      }
    }

    return assetResponse;
  },
};
