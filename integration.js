'use strict';
const { setLogger, getLogger } = require('./src/logger');
const { parseErrorToReadableJson } = require('./src/dataTransformations');
const searchEntities = require('./src/searchEntities');
const assembleLookupResults = require('./src/assembleLookupResults');
const { validateOptions } = require('./src/userOptions');
const onMessageFunctions = require('./src/onMessage');

const doLookup = async (entities, options, cb) => {
  const Logger = getLogger();
  try {
    const { subsystems, logs } = await searchEntities(entities, options);

    Logger.trace({ subsystems, logs }, 'Search Results');

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

const onMessage = ({ action, data: actionParams }, options, callback) =>
  onMessageFunctions[action](actionParams, options, callback);

module.exports = {
  doLookup,
  startup: setLogger,
  validateOptions,
  onMessage
};
