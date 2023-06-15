const { validateStringOptions } = require('./utils');
const { includes } = require('lodash/fp');

const validateOptions = async (options, callback) => {
  const stringOptionsErrorMessages = {
    apiKey: '* Required',
    envId: '* Required'
  };

  const stringValidationErrors = validateStringOptions(
    stringOptionsErrorMessages,
    options
  );

  const entityString = '{{ENTITY}}';
  const logSearchValidationErrors = !includes(entityString, options.searchString.value)
    ? { key: 'searchString', message: '* Missing {{ENTITY}}' }
    : [];

  const errors = stringValidationErrors.concat(logSearchValidationErrors);

  callback(null, errors);
};

module.exports = validateOptions;
