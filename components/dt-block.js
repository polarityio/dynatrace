polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  activeTab: '',
  displayTabNames: {
    logs: 'Logs'
  },
  timezone: Ember.computed('Intl', function () {
    const time = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return time;
  }),

  gettingQuotaMessage: '',
  gettingQuotaErrorMessage: '',

  init() {
    const details = this.get('details');

    this.set('activeTab', details.logs && details.logs.length ? 'logs' : '');

    this._super(...arguments);
  },
  actions: {
    changeTab: function (tabName) {
      this.set('activeTab', tabName);
    }
  }
});
