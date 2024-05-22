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
const cors = require('cors')({ origin: true });

exports.proxyApi = onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const response = await axios({
        method: req.method,
        url: 'http://34.128.120.186' + req.url,
        data: req.body,
        headers: req.headers
      });
      res.status(response.status).send(response.data);
    } catch (error) {
      const status = error.response ? error.response.status : 500;
      const data = error.response ? error.response.data : 'Internal Server Error';
      res.status(status).json(data);
    }
  });
});
