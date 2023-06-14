const {
  get,
  size,
  find,
  map,
  some,
  flow,
  values,
  flatMap,
  groupBy,
  keys,
  uniq,
  join
} = require('lodash/fp');
const { ENTITY_TYPE_BY_QUERY_PROPERTY } = require('./constants');
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
  const subsystemsForThisEntity = flow(
    flatMap(get('subsystemEntityValue')),
    groupBy('type')
  )(getResultForThisEntityResult(entity, subsystems));

  const logsForThisEntity = getResultForThisEntityResult(entity, logs);

  const encodeBase64 = (str) => str && Buffer.from(str).toString('base64');

  const encodedLogQueryContent = encodeBase64(`content='${entity.value}'`);

  const logsWithParsedContent = map((log) => {
    try {
      const content = JSON.stringify(JSON.parse(log.content), null, 2);
      return { ...log, content };
    } catch (error) {
      return log;
    }
  }, logsForThisEntity);

  getLogger().trace(
    {
      entity,
      subsystems,
      logs,
      subsystemsForThisEntity,
      logsForThisEntity,
      logsWithParsedContent,
      encodedLogQueryContent
    },
    'getResultsForThisEntity'
  );
  // Change this so that it returns empty array if no results found
  return {
    subsystems: subsystemsForThisEntity,
    logs: logsWithParsedContent,
    subsystemTypes: some(size, subsystemsForThisEntity)
      ? flow(values, flatMap(keys), uniq)(ENTITY_TYPE_BY_QUERY_PROPERTY)
      : [],
    encodedLogQueryContent: some(size, logsWithParsedContent)
      ? encodedLogQueryContent
      : ''
  };
};

const createSummaryTags = ({ subsystems, logs, subsystemTypes }, options) => {
  // Get number of subsystems for each subsystem type and create summary tags string
  const subsystemsTypesWithCount = flow(
    map((subsystemType) => ({
      name: subsystemType,
      count: size(subsystems[subsystemType])
    }))
  )(subsystemTypes);

  const logsWithCount = {
    name: 'Logs',
    count: size(logs)
  };

  const subsystemSummaryTags = flow(
    map((subsystemTypeWithCount) => {
      const { name, count } = subsystemTypeWithCount;
      return count > 0 ? `${name}: ${count}` : [];
    }),
    (subsystemTypesWithCount) =>
      subsystemTypesWithCount.filter(
        (subsystemTypeWithCount) => subsystemTypeWithCount.length > 0
      ),
    (subsystemTypesWithCount) =>
      subsystemTypesWithCount.length > 0 ? `${join(', ', subsystemTypesWithCount)}` : []
  )(subsystemsTypesWithCount);

  const logsSummaryTag = logsWithCount.count > 0 ? 'Logs Found' : [];

  return [].concat(logsSummaryTag).concat(subsystemSummaryTags);
};

const getResultForThisEntityResult = (entity, results) => {
  const resultsForThisEntity = find(
    (result) => get('entity.value', result) === entity.value,
    results
  );

  return get('result', resultsForThisEntity);
};

module.exports = assembleLookupResults;
