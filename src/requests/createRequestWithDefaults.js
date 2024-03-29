const fs = require('fs');

const request = require('postman-request');

const authenticateRequest = require('./authenticateRequest');
const { getLogger } = require('../logger');
const { identity } = require('lodash/fp');
const { sleep } = require('../dataTransformations');

const SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES = [200];

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

const createRequestWithDefaults = () => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = require('../../config/config.js');

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized }),
    json: true
  };

  const requestWithDefaultsBuilder = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults(defaults);

    const _requestWithDefaults = (requestOptions) =>
      new Promise((resolve, reject) => {
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      const preRequestFunctionResults = await preRequestFunction(requestOptions);
      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      let postRequestFunctionResults;
      try {
        const result = await _requestWithDefaults(_requestOptions);
        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(
          result,
          _requestOptions
        );
      } catch (error) {
        postRequestFunctionResults = await postRequestFailureFunction(
          error,
          _requestOptions
        );
      }
      return postRequestFunctionResults;
    };
  };

  const checkForStatusError = ({ statusCode, body }, requestOptions) => {
    const Logger = getLogger();

    const requestOptionsWithoutSensitiveData = {
      ...requestOptions,
      options: '{...}',
      headers: {
        ...requestOptions.headers,
        Authorization: 'Api-Token ***'
      }
    };

    const roundedStatus = Math.round(statusCode / 100) * 100;
    const statusCodeNotSuccessful =
      !SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES.includes(roundedStatus);

    if (statusCodeNotSuccessful) {
      const requestError = Error(`Request Error`);
      requestError.status = statusCode;
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = JSON.stringify(requestOptionsWithoutSensitiveData);
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaultsBuilder(
    authenticateRequest,
    identity,
    async (err, requestOptions) => {
      if (err == 429 && requestOptions.remainingRetries > 0) {
        const Logger = getLogger();

        Logger.trace(
          { requestOptions },
          'Request rate limit reached.  Retrying after 10 seconds.'
        );
        // According to the docs, when hitting the rate limit, 
        // the server will wait 10 seconds before responding before resetting
        await sleep(10000);
        return requestDefaultsWithInterceptors({
          ...requestOptions,
          remainingRetries: requestOptions.remainingRetries - 1
        });
      }

      throw err;
    }
  );

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
