const app = require("../src"); // Load Express app
const serverless = require("serverless-http");

module.exports = serverless(app);
