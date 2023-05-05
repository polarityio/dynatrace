const { searchSubsystems, searchLogs } = require('./queries');

const searchEntities = async (entities, options) => {
  const [subsystems, logs] = await Promise.all([
    searchSubsystems(entities, options),
    searchLogs(entities, options)
  ]);

  return { subsystems, logs };
};

module.exports = searchEntities;
