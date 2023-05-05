'use strict';

const { size, get, flow, reduce, keys, chunk, flatten, map } = require('lodash/fp');

const { setLogger, getLogger } = require('./src/logger');
const { parseErrorToReadableJson } = require('./src/dataTransformations');
const searchEntities = require('./src/searchEntities');
const assembleLookupResults = require('./src/assembleLookupResults');

const doLookup = async (entities, options, cb) => {
  const Logger = getLogger();
  try {
    Logger.debug({ entities }, 'Entities');

    const { subsystems, logs } = await searchEntities(entities, options);

    // Logger.trace({ subsystems, logs }, 'Search Results');

    const lookupResults = await assembleLookupResults(
      entities,
      subsystems,
      logs,
      options
    );

    Logger.trace({ lookupResults }, 'Lookup Results');
    cb(null, lookupResults);
  } catch (error) {
    const err = parseErrorToReadableJson(error);

    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');
    cb({ detail: error.message || 'Lookup Failed', err });
  }
};

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
