const { get, flow, map } = require('lodash/fp');
const { getLogger } = require('../logger');
const { requestWithDefaults } = require('../requests');
const { parseErrorToReadableJson } = require('../dataTransformations');
const { TYPE_BASED_DISPLAY_SCHEMA } = require('../constants');

const getSubsystemEntitiesBySearchResults = async ({ entityId }, options, callback) => {
  const Logger = getLogger();
  try {
    const entityContent = get(
      'body',
      await requestWithDefaults({
        method: 'GET',
        route: `entities/${entityId}`,
        options
      })
    );

    const entityType = get('type', entityContent);
    const displaySchemaForThisType = get(entityType, TYPE_BASED_DISPLAY_SCHEMA);

    const subsystemEntityPropertyFields = flow(
      map((displayField) => {
        const displayFieldValue = get(
          ['properties', get('path', displayField)],
          entityContent
        );
        return {
          name: get('name', displayField),
          type: get('type', displayField),
          value: displayField.preprocess
            ? displayField.preprocess(displayFieldValue)
            : displayFieldValue
        };
      })
    )(displaySchemaForThisType);

    callback(null, { subsystemEntityPropertyFields });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed API Lookup',
        options,
        formattedError: err
      },
      'API Lookup Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message || 'API Lookup Failed'
        }
      ]
    });
  }
};

module.exports = getSubsystemEntitiesBySearchResults;
