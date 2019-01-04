const { json } = require("micro");
const pMap = require("p-map");
const registries = require("./registries");
const cache = require("../utils/cache");
const log = require("../utils/log");
const tracking = require("../utils/tracking");
const go = require("./go");
const ping = require("./ping");
const logPrefix = log.prefix;

const mapper = async item => {
  let result;

  if (registries.supported(item.type)) {
    result = await registries.resolve(item.type, item.target);
  } else if (item.type === "go") {
    result = await go(item.target);
  } else if (item.type === "ping") {
    result = await ping(item.target);
  } else {
    return;
  }

  return {
    ...item,
    result
  };
};

async function requestHandler(payload) {
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
