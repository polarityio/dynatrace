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
  const logSearchRequests = map(
    (entity) => ({
      entity,
      method: 'GET',
      route: 'logs/search',
      options,
      qs: {
        search: replace(
          /{{ENTITY}}/gi,
          replace(/(\r\n|\n|\r)/gm, '', entity.value),
          options.searchString
        ),
        limit: LOG_SEARCH_LIMIT
      }
    }),
    entities
  );

  const logSearchResults = await requestsInParallel(logSearchRequests, 'body.results');

  return logSearchResults;
};

module.exports = searchLogs;
