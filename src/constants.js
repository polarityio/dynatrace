const ENTITY_TYPE_BY_QUERY_PROPERTY = {
  IPv4: {
    HOST: ['entityName', 'ipAddress'],
    EC2_INSTANCE: ['entityName', 'localIp'],
    NETWORK_INTERFACE: ['entityName', 'ipAddress']
  },
  domain: {
    HOST: ['entityName'],
    EC2_INSTANCE: ['entityName', 'localHostName'],
    NETWORK_INTERFACE: ['entityName']
  },
  mac: {
    HOST: ['entityName', 'macAddresses'],
    NETWORK_INTERFACE: ['entityName', 'macAddress']
  }
};

const MAX_AGGREGATE_QUERY_SIZE = 2;

const LOG_SEARCH_LIMIT = 10;

module.exports = {
  ENTITY_TYPE_BY_QUERY_PROPERTY,
  MAX_AGGREGATE_QUERY_SIZE,
  LOG_SEARCH_LIMIT
};
