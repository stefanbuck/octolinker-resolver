const util = require("util");
const got = require("got");
const isUrl = require("is-url");
const Boom = require("boom");
const findReachableUrls = require("find-reachable-urls");
const repositoryUrl = require("./repository-url");
const xpathHelper = require("./xpath-helper");
const registryConfig = require("../config.json");
const cache = require("./cache");

module.exports = async function doRequest(packageName, type) {
  const cacheKey = `${type}_${packageName}`;

  cache.auth();
  const cacheValue = await cache.get(cacheKey);

  if (!!cacheValue) {
    console.log(">>cache_read", cacheKey);
    cache.quit();
    return cacheValue;
  }

  const config = registryConfig[type];

  const requestUrl = util.format(
    config.registry,
    packageName.replace(/\//g, "%2f")
  );

  let response;
  try {
    response = await got.get(requestUrl);
  } catch (err) {
    if (err.statusCode === 404) {
      throw Boom.notFound("Package not found");
    }

    throw err;
  }
  let json;

  try {
    json = JSON.parse(response.body);
  } catch (err) {
    throw Boom.badImplementation("Parsing response failed");
  }

  const urls = xpathHelper(json, config.xpaths);

  if (type === "npm") {
    try {
      urls.push(
        ...json.maintainers.map(({ name }) => `${name}/${packageName}`)
      );
    } catch (err) {}
  }

  const validUrls = urls.map(bestMatchUrl => {
    try {
      let url = repositoryUrl(bestMatchUrl);

      if (!url && isUrl(bestMatchUrl)) {
        url = bestMatchUrl;
      }

      // http://localhost:3000/npm/uiautomatorwd
      // returns https:github.com/macacajs/uiautomatorwd.git which cause a timeout

      return url;
    } catch (err) {
      return false;
    }
  });

  const fallbackUrl = util.format(config.fallback, packageName);
  const tryUrls = validUrls.concat(fallbackUrl);
  const reachableUrl = await findReachableUrls(tryUrls, { firstMatch: true });

  if (!reachableUrl) {
    throw Boom.notFound("No URL for package found");
  }

  console.log(">>cache_write", cacheKey, reachableUrl);
  cache.set(cacheKey, reachableUrl, () => {
    cache.quit();
  });

  return reachableUrl;
};