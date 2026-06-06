const NodeCache = require("node-cache");
const { cacheTtl } = require("../config");

const cache = new NodeCache({ stdTTL: cacheTtl, checkperiod: 120 });

const getOrSet = async (key, fetchFn) => {
  const cached = cache.get(key);
  if (cached !== undefined) return cached;
  const data = await fetchFn();
  cache.set(key, data);
  return data;
};

module.exports = { cache, getOrSet };
