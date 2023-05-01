const { get, flow, chunk, map, flatten, join } = require('lodash/fp');
const { requestWithDefaults, requestsInParallel } = require('../requests');
const { parseErrorToReadableJson } = require('../dataTransformations');
const { MAX_AGGREGATE_QUERY_SIZE } = require('../constants');
const { groupBy } = require('lodash');

const searchLogs = async (entities, options) => {
  const logSearchRequests = flow(
    chunk(MAX_AGGREGATE_QUERY_SIZE),
    map((entityChunk) => ({
      method: 'GET',
      route: 'logs/search',
      options,
      qs: {
        search: flow(map(get('value')), join(' OR '))(entityChunk)
      }
    }))
  )(entities);

  const logSearchResults = flatten(
    await requestsInParallel(logSearchRequests, 'body.results')
  );

  // TODO ({entity}, [{foo: 'asdf asdf polarity.io'}, { bar: 'fdsa 8.8.8.8 asdf'}]) =>
  //[{entity1, results: [{foo: 'asdf asdf polarity.io'}]}, {entity2, results: [{ bar: 'fdsa 8.8.8.8 asdf'}]}]
  // Group results by entity
  const logSearchResultsByEntity = flow(
    groupBy(get('entity')),
    map((results, entity) => ({ entity, results }))
  )(logSearchResults);

  return logSearchResultsByEntity;
};

module.exports = searchLogs;
