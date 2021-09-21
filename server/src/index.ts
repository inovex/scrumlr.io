import {ParseServer} from "parse-server";
import express from "express";
import http from "http";
import {createProxyMiddleware} from "http-proxy-middleware";
import path from "path";
import {initServer} from "./model/init";

const OPERATION_MODE = process.env.SCRUMLR_OPERATION_MODE || "bundled";
if (["bundled", "server", "livequery"].indexOf(OPERATION_MODE) < 0) {
  throw new Error(`Operation mode '${OPERATION_MODE}' not available. Must be one of 'bundled', 'server' or 'livequery'.`);
}
const HOST = process.env.SCRUMLR_API_HOST || "localhost";
const PORT = process.env.SCRUMLR_API_PORT || 4000;
const MASTER_KEY = process.env.SCRUMLR_API_MASTER_KEY || "masterKey";
const DATABASE_URI = process.env.SCRUMLR_DATABASE_URI || "mongodb://localhost:27017/dev";
const CACHE_URI = process.env.SCRUMLR_CACHE_URL;
const SERVE_PRODUCTION_WEBAPP = process.env.SCRUMLR_SERVE_PRODUCTION_WEBAPP || false;
const TARGET = process.env.SCRUMLR_MIDDLEWARE_TARGET || "http://localhost:3000";

export let serverConfig: any = {
  appId: "Scrumlr",
  masterKey: MASTER_KEY,
  serverURL: `http://${HOST}:${PORT}/api`,
  objectIdSize: 32,
  databaseURI: DATABASE_URI,
};

if (OPERATION_MODE !== "livequery") {
  serverConfig = {
    ...serverConfig,
    cloud: `${__dirname}/cloud.ts`,
    liveQuery: {
      classNames: ["Board", "Note", "JoinRequest", "_Role", "_User", "Vote"],
    },
    auth: {
      anonymous: {},
    },
  };
  if (OPERATION_MODE === "server") {
    serverConfig.liveQuery.redisURL = CACHE_URI;
  }
}
const api = new ParseServer(serverConfig);

const application = express();
if (OPERATION_MODE === "bundled" || OPERATION_MODE === "server") {
  application.use("/api", api);

  if (SERVE_PRODUCTION_WEBAPP) {
    console.log("Serving production webapp from local directory");
    application.use("/", express.static(path.join(__dirname, "/public")));
  } else {
    console.log("Proxy to development branch of webapp");
    application.use("/", createProxyMiddleware({target: TARGET, changeOrigin: true}));
  }
}

const httpServer = http.createServer(application);
httpServer.listen(PORT, () => {
  console.log(`Scrumlr server in operation mode '${OPERATION_MODE}' running on ${HOST}:${PORT}`);
  if (OPERATION_MODE === "bundled" || OPERATION_MODE === "server") {
    initServer("Scrumlr", `http://${HOST}:${PORT}/api`, MASTER_KEY).catch((err) => {
      console.error("unable to init backend", err);
      throw err;
    });
  }
});

if (OPERATION_MODE === "livequery") {
  ParseServer.createLiveQueryServer(httpServer, {
    redisURL: CACHE_URI,
  });
} else if (OPERATION_MODE === "bundled") {
  ParseServer.createLiveQueryServer(httpServer);
}
