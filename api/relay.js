export default async function handler(req, res) {
  try {
    const tgt = req.query.tgt;
    if (!tgt || typeof tgt !== "string") {
      return res.status(400).send("missing tgt");
    }

    const url = new URL(tgt);

    // consenti SOLO endpoint Binance che ci servono
    if (!/^https:\/\/(api(\-gcp)?\.binance\.com|data\.binance\.com|data-api\.binance\.vision)$/i.test(url.origin)) {
      return res.status(403).send("forbidden host");
    }

    const upstream = await fetch(url.toString(), {
      headers: {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0",
        "Accept": "application/json",
        "Cache-Control": "no-cache"
      },
      redirect: "follow"
    });

    const text = await upstream.text();

    res.status(upstream.status);
    res.setHeader("X-Relay-Host", url.host);
    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "application/json; charset=utf-8"
    );
    return res.send(text);
  } catch (e) {
    return res.status(502).send("relay-error");
  }
}
