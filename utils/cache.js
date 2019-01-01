const redis = require("redis");
let client;
let simpleCache;

module.exports = {
  auth: () => {
    console.log('>> Cache auth');
    return new Promise((resolve, reject) => {
      client = redis.createClient({
        port: 18358,
        host: "redis-18358.c135.eu-central-1-1.ec2.cloud.redislabs.com",
        password: process.env.REDIS_PWD,
        retry_strategy: () => undefined, // Disable reconnecting
      });

      client.on('error', (error) => {
        console.log('>> Cache error', error);
        client && client.quit();
        client = null;
        resolve();
      });

      client.on('ready', () => {
        console.log('>> Cache ready');
        resolve();
      });
    });
  },
  quit: () => {
    client && client.quit();
  },
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      if (!client) {
        console.log('>> Cache SET simple-cache', key);
        simpleCache = simpleCache || {}
        simpleCache[key] = value;
        return resolve();
      }

      console.log('>> Cache SET redis-cache', key);
      client.set(key, value, error => {
        if (error) return reject(error);
        resolve();
      });
    });
  },
  get: key => {
    return new Promise((resolve, reject) => {
      if (!client) {
        console.log('>> Cache GET simple-cache', key);
        return resolve(simpleCache && simpleCache[key]);
      }

      console.log('>> Cache GET redis-cache', key);
      client.get(key, (error, value) => {
        if (error) return reject(error);
        resolve(value);
      });
    });
  }
};
