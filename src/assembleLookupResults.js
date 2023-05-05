const { flow, get, size, find, map, some, getOr } = require('lodash/fp');
const { round } = require('./dataTransformations');
const { getLogger } = require('./logger');
const assembleLookupResults = (entities, subsystems, logs, options) =>
  map((entity) => {
    const resultsForThisEntity = getResultsForThisEntity(
      entity,
      subsystems,
      logs,
      options
    );

    const resultsFound = some(size, resultsForThisEntity);

    const lookupResult = {
      entity,
      data: resultsFound
        ? {
            summary: createSummaryTags(resultsForThisEntity, options),
            details: resultsForThisEntity
          }
        : null
    };

    return lookupResult;
  }, entities);

const getResultsForThisEntity = (entity, subsystems, logs, options) => {
  const subsystemsForThisEntity = getResultForThisEntityResult(entity, subsystems);

  const logsForThisEntity = getResultForThisEntityResult(entity, logs);

  getLogger().trace(
    { entity, subsystems, subsystemsForThisEntity, logsForThisEntity },
    'getResultsForThisEntity'
  );
  return { subsystems: subsystemsForThisEntity, logs: logsForThisEntity };
};

const createSummaryTags = ({ subsystems, logs }, options) => {
  //TODO: Do after UI
  return [];
};

const getResultForThisEntityResult = (entity, results) => {
  const resultsForThisEntity = find(
    (result) => get('entity.value', result) === entity.value,
    results
  );

  return get('result', resultsForThisEntity);
};

module.exports = assembleLookupResults;
