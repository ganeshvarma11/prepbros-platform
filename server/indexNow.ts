import {
  buildSeoRuntimeConfig,
  getIndexNowKeyLocation,
} from "../shared/seo";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

type SubmitIndexNowOptions = {
  urls: string[];
  siteUrl?: string;
  indexNowKey?: string;
};

export async function submitIndexNow({
  urls,
  siteUrl,
  indexNowKey,
}: SubmitIndexNowOptions) {
  const runtime = buildSeoRuntimeConfig({
    siteUrl,
    indexNowKey,
  });

  if (!runtime.indexNowKey) {
    return {
      ok: false,
      skipped: true,
      status: 400,
      message: "INDEXNOW_KEY is not configured.",
    };
  }

  const normalizedUrls = Array.from(
    new Set(
      urls
        .map((url) => url.trim())
        .filter(Boolean)
        .filter((url) => {
          try {
            return new URL(url).origin === runtime.siteUrl;
          } catch {
            return false;
          }
        })
    )
  );

  if (normalizedUrls.length === 0) {
    return {
      ok: false,
      skipped: true,
      status: 400,
      message: "No valid same-origin URLs were provided for IndexNow.",
    };
  }

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      host: new URL(runtime.siteUrl).host,
      key: runtime.indexNowKey,
      keyLocation: getIndexNowKeyLocation(runtime),
      urlList: normalizedUrls,
    }),
  });

  const text = await response.text();

  return {
    ok: response.ok,
    skipped: false,
    status: response.status,
    message: text || (response.ok ? "IndexNow submission accepted." : "IndexNow submission failed."),
    submittedUrls: normalizedUrls,
  };
}
