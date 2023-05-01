const { get } = require('lodash');
const { getLogger } = require('../logger');
const { requestWithDefaults } = require('../requests');
const { parseErrorToReadableJson } = require('../utils');

const getSubsystemEntitiesBySearchResults = async ({ entityId }, options, callback) => {
  const Logger = getLogger();
  try {
    const entityContent = get(
      'body',
      await requestWithDefaults({
        method: 'GET',
        route: `entities/${entityId}`,
        options
      }).catch(parseErrorToReadableJson)
    );
    // throw new Error('Not work good. Request failed')
    callback(null, entityContent);
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed API Quota Lookup',
        options,
        formattedError: err
      },
      'API Quota Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'API Quota Lookup Failed'
        }
      ]
    });
  }
};

module.exports = getSubsystemEntitiesBySearchResults;
