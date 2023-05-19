require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const router = require("./routes");
const cors = require("cors");
const Sentry = require("@sentry/node");

const { HTTP_PORT = 3000 } = process.env;
const { SENTRY_DSN, ENVIRONTMENT } = process.env;

Sentry.init({
  environment: ENVIRONTMENT,
  dsn: SENTRY_DSN,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
  ],

  tracesSampleRate: 1.0,
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(router);

app.use(Sentry.Handlers.errorHandler());

// 500
app.use((err, req, res, next) => {
  console.log(err);
  return res.status(500).json({
    status: false,
    message: err.message,
    data: null,
  });
});

module.exports = app;
