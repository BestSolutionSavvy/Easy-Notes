require('dotenv').config();
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

const cerebrasClient = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY
});

module.exports = cerebrasClient;
