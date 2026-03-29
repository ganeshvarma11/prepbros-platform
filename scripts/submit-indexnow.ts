import { getIndexNowUrlList } from "../shared/seo";
import { submitIndexNow } from "../server/indexNow";

const cliUrls = process.argv.slice(2);
const siteUrl = process.env.VITE_SITE_URL;
const indexNowKey = process.env.INDEXNOW_KEY;
const urls = cliUrls.length > 0 ? cliUrls : getIndexNowUrlList({ siteUrl });

const result = await submitIndexNow({
  urls,
  siteUrl,
  indexNowKey,
});

if (!result.ok) {
  console.error(result.message);
  process.exit(result.status === 200 ? 0 : 1);
}

console.log(
  `IndexNow accepted ${result.submittedUrls?.length || 0} URL(s).`
);
