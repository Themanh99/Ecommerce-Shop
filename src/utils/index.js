const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getUrlFromPath = (path) => {
  const parts = _.split(path, "/");
  return _.slice(parts, 4).join("/");
};

module.exports = {
  getInfoData,
  getUrlFromPath,
};
