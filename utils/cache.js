const redis = require("redis");
let client;

module.exports = {
  auth: () => {
    client = redis.createClient({
      port: 10651,
      host: "redis-10651.c60.us-west-1-2.ec2.cloud.redislabs.com",
      password: process.env.REDIS_PWD
    });
  },
  quit: () => {
    client.quit();
  },
  set: (key, value) => {
    return new Promise((resolve, reject) => {
      client.set(key, value, error => {
        if (error) return reject(error);
        resolve();
      });
    });
  },
  get: key => {
    return new Promise((resolve, reject) => {
      client.get(key, (error, value) => {
        if (error) return reject(error);
        resolve(value);
      });
    });
  }
};
