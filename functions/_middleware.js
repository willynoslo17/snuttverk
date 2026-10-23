// 301: old snuttverk.pages.dev (production host) -> https://snuttverk.no
export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  if (url.hostname === "snuttverk.pages.dev" || url.hostname === "www.snuttverk.no") {
    url.hostname = "snuttverk.no";
    url.protocol = "https:";
    return Response.redirect(url.toString(), 301);
  }
  return next();
}
