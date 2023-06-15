const { map, replace } = require('lodash/fp');
const { requestsInParallel } = require('../requests');
const { LOG_SEARCH_LIMIT } = require('../constants');
const { getLogger } = require('../logger');

const searchLogs = async (entities, options) => {
  const logSearchRequests = map(
    (entity) => ({
      entity,
      method: 'GET',
      route: 'logs/search',
      options,
      qs: {
        query: replace(
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
