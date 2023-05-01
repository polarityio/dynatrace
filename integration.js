'use strict';

const request = require('postman-request');
const config = require('./config/config');
const async = require('async');
const fs = require('fs');
const { size, get, flow, reduce, keys, chunk, flatten, map } = require('lodash/fp');

const requestWithDefaults = require('./src/requests/createRequestWithDefaults');
const { setLogger } = require('./src/logger');

let Logger;

const doLookup = (entities, options, cb) => {};

function _getSummaryTags(results, summaryFields) {
  const tags = new Map();

  results.forEach((item) => {
    summaryFields.forEach((field) => {
      const summaryField = item.result[field];
      if (summaryField) {
        tags.set(`${field}${summaryField}`, {
          field: field,
          value: summaryField
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
    (agg, key) => ({ ...agg, [key]: get([key, 'value'], options) }),
    {},
    keys(options)
  );

  callback(null);
};

module.exports = {
  doLookup,
  startup: setLogger,
  validateOptions
};
