const fp = require("lodash/fp");
const reduce = require("lodash/fp/reduce").convert({ cap: false });

const getAuthenticationOptionValidationErrors = (options) => {
  return options;
};

module.exports = getAuthenticationOptionValidationErrors;
