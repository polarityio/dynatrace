const { flow, includes, get, getOr, keys, find } = require("lodash/fp");
const { validateOptions } = require("../integrations");

getQueryStringOptionValidationErrors = (validateOptions) => {
  return validateOptions;
};

module.exports = getQueryStringOptionValidationErrors;
