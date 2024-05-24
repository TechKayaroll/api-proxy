/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const axios = require('axios');
const cors = require('cors')({origin: true});
const http = require('http');
const https = require('https');

const httpAgent = new http.Agent({keepAlive: true});
const httpsAgent = new https.Agent({keepAlive: true});

exports.proxyApi = onRequest({
  region: 'asia-southeast2',
}, async (req, res) => {
  cors(req, res, async () => {
    try {
      const {host, ...restHeaders} = req.headers;

      logger.info('Incoming request', {
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body
      });

      const response = await axios({
        method: req.method,
        url: 'http://34.128.120.186' + req.url,
        data: req.body,
        headers: {
          ...restHeaders,
        },
        httpAgent: httpAgent,
        httpsAgent: httpsAgent,
      });
      logger.info('API response', {
        status: response.status,
        data: response.data
      });
      res.status(response.status).send(response.data);
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ECONNRESET') {
        logger.error('Network error', {
          message: error.message,
          code: error.code,
          config: error.config
        });
      } else if (error.response) {
        logger.error('Request failed', {
          message: error.message,
          response: error.response.data,
          status: error.response.status,
          headers: req.headers
        });
      } else {
        logger.error('Error', {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
      }

      const status = error.response ? error.response.status : 500;
      const data = error.response ? error.response.data : 'Internal Server Error';
      res.status(status).json(data);
    }
  });
});
