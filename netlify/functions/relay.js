// netlify/functions/relay.js

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124 Safari/537.36";

exports.handler = async function (event, context) {
  try {
    const tgt = (event.queryStringParameters && event.queryStringParameters.tgt) || "";
    if (!tgt) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
        body: "Missing ?tgt param",
      };
    }

    let url;
    try {
      url = new URL(tgt);
    } catch {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        },
        body: "Invalid tgt URL",
      };
    }

    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "User-Agent": UA,
        Accept: "application/json, text/plain, */*",
      },
    });

    const text = await res.text();

    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store",
    };

    const ct = res.headers.get("content-type");
    if (ct) headers["Content-Type"] = ct;

    return {
      statusCode: res.status,
      headers,
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: "proxy_error: " + (e.message || String(e)),
    };
  }
};
