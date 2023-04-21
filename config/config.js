module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: "Dynatrace",
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: "DTRA",
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    "Dynatrace is a software intelligence platform that provides monitoring and analytics for applications and infrastructure in real-time.",
  entityTypes: ["IPv4", "IPv6", "custom"],
  defaultColor: "light-gray",
  /**
   * An array of style files (css or less) that will be included for your integration. Any styles specified in
   * the below files can be used in your custom template.
   *
   * @type Array
   * @optional
   */
  styles: ["./styles/dt.less"],
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  block: {
    component: {
      file: "./components/dt-block.js",
    },
    template: {
      file: "./templates/dt-block.hbs",
    },
  },
  summary: {
    component: {
      file: "./components/dt-summary.js",
    },
    template: {
      file: "./templates/dt-summary.hbs",
    },
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    cert: "",
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    key: "",
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    passphrase: "",
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the integration's root directory
    ca: "",
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: "",

    rejectUnauthorized: true,
  },
  logging: {
    level: "info", //trace, debug, info, warn, error, fatal
  },
  copyOnDemand: true,
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: "url",
      name: "Dynatrace URL",
      description:
        "The base URL for the Dynatrace API including the scheme (i.e., https://) and port (e.g., https://mydynatrace:443)",
      type: "text",
      default: "",
      userCanEdit: true,
      adminOnly: false,
    },
    {
      key: "apiToken",
      name: "Dynatrace API Token",
      description:
        'A Dynatrace API Token which can be created from the Dynatrace web interface by going to "Settings -> Integration -> Dynatrace API".',
      default: "",
      type: "password",
      userCanEdit: true,
      adminOnly: false,
    },
    {
      key: "searchString",
      name: "Dynatrace Search Query",
      description:
        "Dynatrace Search Query to execute. The string `{{ENTITY}}` will be replaced by the looked up indicator. For example: host.name:{{ENTITY}} or process_group_name:{{ENTITY}}. If left blank, the search query will default to host.name:{{ENTITY}}.",
      default: "host.name:{{ENTITY}}",
      type: "text",
      userCanEdit: true,
      adminOnly: false,
    },
    {
      key: "timeframe",
      name: "Dynatrace Search Timeframe",
      description:
        "Splunk Search String to execute. The string `{{ENTITY}}` will be replaced by the looked up indicator. For example: index=logs value=TERM({{ENTITY}}) | head 10.",
      default: 'index=main "{{ENTITY}}" | head 10',
      type: "text",
      userCanEdit: false,
      adminOnly: true,
    },
  ],
};
