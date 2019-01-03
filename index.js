const { json } = require("micro");
const pMap = require("p-map");
const doRequest = require("./utils/request");
const cache = require("./utils/cache");
const log = require("./utils/log");
const got = require("got");
const tracking = require("./utils/tracking");
const groupBy = require("lodash.groupby");
const go = require("./go");
const logPrefix = log.prefix;

const mapper = async item => {
  if (item.type === "registry") {
    return await doRequest(item.target, item.registry);
  }

  if (item.type === "go") {
    return await go(item.target);
  }

  if (item.type === "ping") {
    return await got
      .head(item.target)
      .then(() => item.target)
      .catch(() => null);
  }

  return "xxx";
};

async function requestHandler(payload) {
  // const groups = groupBy(payload, "type");

  return await pMap(payload, mapper, { concurrency: 5 });
}

function errorHandler(error, res) {
  log(error);
  res.statusCode = 500;
  res.end("Internal server error");
}

tracking.init();

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const timingTotalStart = Date.now();

    const body = await json(req);

    const timingAuthStart = Date.now();
    await cache.auth();
    const timingAuthEnd = Date.now();

    let result;
    let timingTotalEnd;
    let completed = false;

    try {
      result = await requestHandler(body);
      completed = true;
    } catch (error) {
      return errorHandler(error, res);
    } finally {
      timingTotalEnd = Date.now();

      log("Redis Status", cache.getRedisStatus());
      log("SimpleCache size", cache.simpleCacheSize());
      log("Timing Total", timingTotalEnd - timingTotalStart);
      log("Timing Auth", timingAuthEnd - timingAuthStart);

      await tracking.track("info2", {
        completed,
        instanceName: logPrefix,
        ...cache.getRedisStatus(),
        simpleCacheSize: cache.simpleCacheSize(),
        exectuionTime: timingTotalEnd - timingTotalStart
      });
    }

    res.end(
      JSON.stringify({
        result,
        meta: {
          ...cache.getRedisStatus(),
          simpleCacheSize: cache.simpleCacheSize(),
          instance: logPrefix,
          timingTotal: timingTotalEnd - timingTotalStart,
          timingAuth: timingAuthEnd - timingAuthStart
        }
      })
    );
  } else {
    res.end(Date());
  }
};
