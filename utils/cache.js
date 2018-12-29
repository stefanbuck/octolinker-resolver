const redis = require("redis");
let client;
let simpleCache;

module.exports = {
  auth: () => {
    return new Promise((resolve, reject) => {
      client = redis.createClient({
        port: 10651,
        host: "redis-10651.c60.us-west-1-2.ec2.cloud.redislabs.com",
        password: process.env.REDIS_PWD,
        retry_strategy: () => undefined, // Disable reconnecting
      });

      client.on('error', (error) => {
        client && client.quit();
        client = null;
        resolve();
      });

      client.on('ready', resolve);
    });
  },
  quit: () => {
    client && client.quit();
  },
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      if (!client) {
        simpleCache = simpleCache || {}
        simpleCache[key] = value;
        return resolve();
      }

      client.set(key, value, error => {
        if (error) return reject(error);
        resolve();
      });
    });
  },
  get: key => {
    return new Promise((resolve, reject) => {
      if (!client) {
        return resolve(simpleCache && simpleCache[key]);
      }

      client.get(key, (error, value) => {
        if (error) return reject(error);
        resolve(value);
      });
    });
  }
};
