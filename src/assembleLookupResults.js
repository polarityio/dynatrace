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
  join,
  compact,
  max
} = require('lodash/fp');
const { DateTime, Interval } = require('luxon');

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

  const greatestTimeBackInFoundLogs = encodeURIComponent(
    flow(
      map(({ timestamp }) =>
        Math.ceil(
          Interval.fromDateTimes(DateTime.fromMillis(timestamp), DateTime.now()).length(
            'days'
          )
        )
      ),
      max
    )(logsForThisEntity)
  );

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
      greatestTimeBackInFoundLogs
    },
    'getResultsForThisEntity'
  );
  return {
    subsystems: subsystemsForThisEntity,
    logs: logsWithParsedContent,
    subsystemTypes: some(size, subsystemsForThisEntity)
      ? flow(values, flatMap(keys), uniq)(ENTITY_TYPE_BY_QUERY_PROPERTY)
      : [],
    greatestTimeBackInFoundLogs: some(size, logsWithParsedContent)
      ? greatestTimeBackInFoundLogs
      : ''
  };
};

const createSummaryTags = ({ subsystems, logs, subsystemTypes }, options) => {
  const subsystemSummaryTags = flow(
    map((subsystemType) => {
      const count = size(subsystems[subsystemType]);

      return count > 0 && `${subsystemType}: ${count}`;
    }),
    compact,
    join(', ')
  )(subsystemTypes);

  const logsWithCount = {
    name: 'Logs',
    count: size(logs)
  };

  const logsSummaryTag = logsWithCount.count > 0 ? 'Logs Found' : [];

  return [].concat(logsSummaryTag || []).concat(subsystemSummaryTags || []);
};

const getResultForThisEntityResult = (entity, results) => {
  const resultsForThisEntity = find(
    (result) => get('entity.value', result) === entity.value,
    results
  );

  return get('result', resultsForThisEntity);
};

module.exports = assembleLookupResults;
