const {
  get,
  flow,
  chunk,
  map,
  flatten,
  join,
  includes,
  toLower,
  find,
  filter,
  replace
} = require('lodash/fp');
const { requestsInParallel } = require('../requests');
const { MAX_AGGREGATE_QUERY_SIZE, LOG_SEARCH_LIMIT } = require('../constants');

const searchLogs = async (entities, options) => {
  const logSearchRequests = flow(
    map(get('value')),
    chunk(MAX_AGGREGATE_QUERY_SIZE),
    map((entityValuesChunk) => ({
      entity: entityValuesChunk,
      method: 'GET',
      route: 'logs/search',
      options,
      qs: {
        search: flow(
          map((entity) =>
            replace(
              /{{ENTITY}}/gi,
              replace(/(\r\n|\n|\r)/gm, '', entity.value),
              options.searchString
            )
          ),
          join(' OR ')
        )(entityValuesChunk),
        limit: LOG_SEARCH_LIMIT
      }
    }))
  )(entities);

  const logSearchResults = flatten(
    await requestsInParallel(logSearchRequests, 'body.results')
  );

  const associateEntityWithResults = flow(
    map((entity) => ({
      entity,
      result: flow(
        find((result) => result.entity.includes(entity.value)),
        get('result'),
        filter(flow(JSON.stringify, toLower, includes(entity.value.toLowerCase())))
      )(logSearchResults)
    }))
  )(entities);

  return associateEntityWithResults;
};

module.exports = searchLogs;
