const { get, flow, entries, map, flatten, uniqBy, groupBy } = require('lodash/fp');
const { ENTITY_TYPE_BY_QUERY_PROPERTY } = require('../constants');
const { requestsInParallel } = require('../requests');
const { getLogger } = require('../logger');

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

  const result = await requestsInParallel(searchRequests, 'body');

  // [{entityId: 'host-123712387', type: 'hosts', displayName: 'This host'}]

  /**{
    hosts: [{
      entityId: 'host-123712387', type: 'hosts', displayName: 'This host'
    }],
    aws_instance: [

    ],
    network_interface: [
      
    ]
  }
  */
  const resultEntity = flow(
    map(get('entities')),
    flatten,
    uniqBy('entityId'),
    groupBy('type'),
    entries,
    map(([subsystemEntityType, subsystemEntityValue]) => ({
      subsystemEntityType,
      subsystemEntityValue
    }))
  )(result);

  return { entity, result: resultEntity };
};

const searchSubsystems = async (entities, options) =>
  await Promise.all(
    map(async (entity) => await searchSubsystemByEntityType(entity, options), entities)
  );

module.exports = searchSubsystems;
