const { flow, map, join } = require('lodash/fp');

const { DateTime } = require('luxon');

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

const createPreTagContents = (preprocessedFields, processValueFunc = (i) => i) =>
  flow(
    map(({ key, value }) => `${key}: ${processValueFunc(value)}`),
    map((i) => i.trim()),
    join('\n')
  )(preprocessedFields);

const TYPE_BASED_DISPLAY_SCHEMA = {
  HOST: [
    { name: 'Bitness', path: 'bitness' },
    { name: 'State', path: 'state' },
    { name: 'IP Address', path: 'ipAddress', preprocess: join(', ') },
    { name: 'MAC Addresses', path: 'macAddresses', preprocess: join(', ') },
    { name: 'Cloud Type', path: 'cloudType' },
    { name: 'Hypervisor Type', path: 'hypervisorType' },
    { type: 'separator' },
    {
      name: 'Monitoring Mode',
      path: 'monitoringMode'
    },
    { name: 'Is Monitoring Candidate', path: 'isMonitoringCandidate', type: 'boolean' },
    { name: 'Standalone', path: 'standalone', type: 'boolean' },
    {
      name: 'Installer Potential Problem',
      path: 'installerPotentialProblem',
      type: 'boolean'
    },
    { name: 'Installer Version', path: 'installerVersion' },
    { type: 'separator' },
    { name: 'OS Type', path: 'osType' },
    { name: 'OS Architecture', path: 'osArchitecture' },
    { name: 'OS Version', path: 'osVersion' },
    { name: 'CPU Cores', path: 'cpuCores' },
    { name: 'Memory Total', path: 'memoryTotal', type: 'memory' },
    { name: 'Logical CPU Cores', path: 'logicalCpuCores' },
    { name: 'Physical Memory', path: 'physicalMemory', type: 'memory' },
    { type: 'separator' },
    { name: 'Auto Injection', path: 'autoInjection' },
    { name: 'Network Zone', path: 'networkZone' },
    {
      name: 'Standalone Special Agents Only',
      path: 'standaloneSpecialAgentsOnly',
      type: 'boolean'
    },
    { name: 'Installer Support Alert', path: 'installerSupportAlert', type: 'boolean' },
    { type: 'separator' },
    {
      name: 'Log Source State',
      path: 'logSourceState',
      type: 'pre',
      preprocess: (logSourceState) => createPreTagContents(logSourceState)
    },
    {
      name: 'Log Path Last Update',
      path: 'logPathLastUpdate',
      type: 'pre',
      preprocess: (logPathLastUpdate) =>
        createPreTagContents(logPathLastUpdate, (dateValue) =>
          DateTime.fromMillis(dateValue).toLocaleString(
            DateTime.DATETIME_SHORT_WITH_SECONDS
          )
        )
    },
    {
      name: 'Log File Status',
      path: 'logFileStatus',
      type: 'pre',
      preprocess: (logFileStatus) => createPreTagContents(logFileStatus)
    },
    {
      name: 'System Info',
      path: 'additionalSystemInfo',
      type: 'pre',
      preprocess: (additionalSystemInfo) => createPreTagContents(additionalSystemInfo)
    }
  ],
  EC2_INSTANCE: [
    { name: 'Local HostName', path: 'localHostName' },
    { name: 'AMI ID', path: 'amiId' },
    { name: 'AWS Instance ID', path: 'awsInstanceId' },
    { name: 'AWS Instance Type', path: 'awsInstanceType' },
    { name: 'Local IP', path: 'localIp' },
    { name: 'AWS Security Group', path: 'awsSecurityGroup', preprocess: join(', ') }
  ],
  NETWORK_INTERFACE: [
    { name: 'Detected Name', path: 'detectedName' },
    { name: 'MAC Address', path: 'macAddress' },
    { name: 'IP Address', path: 'ipAddress' }
  ]
};

const MAX_AGGREGATE_QUERY_SIZE = 2;

const LOG_SEARCH_LIMIT = 10;

module.exports = {
  ENTITY_TYPE_BY_QUERY_PROPERTY,
  MAX_AGGREGATE_QUERY_SIZE,
  LOG_SEARCH_LIMIT,
  TYPE_BASED_DISPLAY_SCHEMA
};
