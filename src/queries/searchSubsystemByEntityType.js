const { get, flow, entries, map, flatten } = require('lodash/fp');
const { ENTITY_TYPE_BY_QUERY_PROPERTY } = require('../constants');
const { requestsInParallel } = require('../requests');

const searchSubsystemByEntityType = async (entity, options) => {
  const entityTypeQueryProperties = get(entity.type, ENTITY_TYPE_BY_QUERY_PROPERTY);

  const searchRequests = flow(
    entries,
    map(([subsystemType, queryProperties]) =>
      map((queryProperty) => ({
        method: 'GET',
        route: 'entities',
        qs: {
          pageSize: 10,
          entitySelector: `type("${subsystemType}"),${queryProperty}("${entity.value}")`
        },
        options: options
      }))(queryProperties)
    ),
    flatten
  )(entityTypeQueryProperties);

  const requestResults = await requestsInParallel(searchRequests, 'body');

  return { entity, requestResults };
};

//TODO translate this to just searchSubsystem and have that take in all entities
module.exports = searchSubsystemByEntityType;
