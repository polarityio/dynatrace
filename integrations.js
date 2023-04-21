"use strict";

const request = require("postman-request");
const config = require("./config/config");
const async = require("async");
const fs = require("fs");
const {
  size,
  get,
  flow,
  reduce,
  keys,
  chunk,
  flatten,
  map,
} = require("lodash/fp");

const getAuthenticationOptionValidationErrors = require("./src/getAuthenticationOptionValidationErrors");
const getQueryStringOptionValidationErrors = require("./src/getQueryStringOptionValidationErrors");
const addAuthHeaders = require("./src/addAuthHeaders");
const { setLogger } = require("./src/logger");

let Logger;
let requestWithDefaults;

const MAX_PARALLEL_LOOKUPS = 10;

/**
 *
 * @param entities
 * @param options
 * @param cb
 */
function startup(logger) {
  requestWithDefaults = (requestOptions, options, callback) =>
    addAuthHeaders(requestOptions, options, (err, requestOptionsWithAuth) => {
      if (err) {
        return callback({
          ...JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err))),
          isAuthError: true,
        });
      }

      startingRequestWithDefaults(requestOptionsWithAuth, callback);
    });
}

const doLookup = (entities, options, cb) => {};

function _getSummaryTags(results, summaryFields) {
  const tags = new Map();

  results.forEach((item) => {
    summaryFields.forEach((field) => {
      const summaryField = item.result[field];
      if (summaryField) {
        tags.set(`${field}${summaryField}`, {
          field: field,
          value: summaryField,
        });
      }
    });
  });

  return Array.from(tags.values());
}

const validateOptions = async (options, callback) => {
  const authOptionErrors = getAuthenticationOptionValidationErrors(options);
  if (size(authOptionErrors)) return callback(null, authOptionErrors);

  const formattedOptions = reduce(
    (agg, key) => ({ ...agg, [key]: get([key, "value"], options) }),
    {},
    keys(options)
  );

  callback(null);
};

module.exports = {
  doLookup,
  startup,
  validateOptions,
};
