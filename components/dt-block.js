polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  activeTab: '',
  expandableTitleStates: {},
  displayTabNames: {
    logs: 'Logs',
    HOST: 'Host',
    EC2_INSTANCE: 'EC2 Instance',
    NETWORK_INTERFACE: 'Network Interface'
  },
  timezone: Ember.computed('Intl', function () {
    const time = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return time;
  }),

  gettingSubsystemMessage: '',
  gettingSubsystemErrorMessage: '',
  getApiEndpointSubsystemIsRunning: false,
  searchedSubsystemEntities: {},
  showSubsystemEntity: false,
  isShowingSubsystemEntity: Ember.computed('showSubsystemEntity', function (entityId) {
    return (
      this.get(`searchedSubsystemEntities.${entityId}`) && this.get('showSubsystemEntity')
    );
  }),

  init() {
    const details = this.get('details');

    this.set(
      'activeTab',
      details.logs && details.logs.length
        ? 'logs'
        : details.subsystems.HOST
        ? 'HOST'
        : details.subsystems.EC2_INSTANCE
        ? 'EC2_INSTANCE'
        : 'NETWORK_INTERFACE'
    );

    this._super(...arguments);
  },
  actions: {
    toggleExpandableTitle: function (entityId) {
      if (!this.get(`searchedSubsystemEntities.${entityId}`))
        this.getSubsystemEntitiesBySearchResults(entityId);

      this.set(
        `expandableTitleStates`,
        Object.assign({}, this.get('expandableTitleStates'), {
          [entityId]: !this.get(`expandableTitleStates.${entityId}`)
        })
      );
    },
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    }
  },

  getSubsystemEntitiesBySearchResults: function (entityId) {
    const outerThis = this;

    // Check if we have already searched for this entity
    if (this.get(`searchedSubsystemEntities.${entityId}`)) return;

    outerThis.set('getApiEndpointSubsystemIsRunning', true);

    outerThis
      .sendIntegrationMessage({
        action: 'getSubsystemEntitiesBySearchResults',
        data: { entityId }
      })
      .then(({ subsystemEntityPropertyFields }) => {
        console.log('result', subsystemEntityPropertyFields);
        outerThis.set(
          `searchedSubsystemEntities.${entityId}`,
          subsystemEntityPropertyFields
        );
      })
      .catch((err) => {
        outerThis.set('gettingSubsystemErrorMessage', err.message);
      })
      .finally(() => {
        outerThis.set('getApiEndpointSubsystemIsRunning', false);
      });
  }
});
