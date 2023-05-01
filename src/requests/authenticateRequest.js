const { get } = require("lodash/fp");

const authenticateRequest = async (requestOptions) => ({
  ...requestOptions,
  url: `https://${requestOptions.options.envId}.live.dynatrace.com/api/v2/${requestOptions.route}`,
  headers: {
    ...get("headers", requestOptions),
    Authorization: `Api-Token ${requestOptions.options.apiKey}`,
  },
});

module.exports = authenticateRequest;
