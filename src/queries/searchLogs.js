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
  filter
} = require('lodash/fp');
const { requestWithDefaults, requestsInParallel } = require('../requests');
const { parseErrorToReadableJson } = require('../dataTransformations');
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
        search: flow(map(get('value')), join(' OR '))(entityValuesChunk),
        limit: LOG_SEARCH_LIMIT
      }
    }))
  )(entities);

  const logSearchResults = flatten(
    await requestsInParallel(logSearchRequests, 'body.results')
  );

  // const logSearchResults = [
  //   {
  //     entity: ['polarity.io', 'polarity1.io'],
  //     result: [
  //       { foo: 'asdf asdf polarity.io', bar: 'fff' },
  //       { foo: 'asdf asdf polarity1.io', bar: 'fdsa' },
  //       { foo: 'asdf asdf polarity.io', bar: 111 }
  //     ]
  //   },
  //   {
  //     entity: ['polarity2.io', 'polarity3.io'],
  //     result: [
  //       { foo: 'asdf asdf polarity3.io', bar: 'fff' },
  //       { foo: 'asdf asdf polarity2.io fdsa', bar: 'fdsa' },
  //       { foo: 'asdf asdf polarity3.io', bar: 111 }
  //     ]
  //   },
  //   {
  //     entity: ['polarity4.io', 'polarity5.io'],
  //     result: [
  //       { foo: 'asdf asdf polarity5.io', bar: 'fff' },
  //       { foo: 'asdf asdf polarity4.io', bar: 'fdsa' },
  //       { foo: 'asdf asdf polarity4.io', bar: 111 }
  //     ]
  //   }
  // ];

  // TODO: Test with real data
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
