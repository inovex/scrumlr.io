import ParseDashboard from "parse-dashboard";
import express from "express";
import http from "http";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:4000/api";
const APP_ID = process.env.APP_ID || "Scrumlr";
const MASTER_KEY = process.env.MASTER_KEY || "masterKey";
const APP_NAME = process.env.APP_NAME || "Scrumlr";
const DEFAULT_USER = process.env.DASHBOARD_DEFAULT_USER || "scrumlr";
const DEFAULT_PASSWORD = process.env.DASHBOARD_DEFAULT_PASSWORD || "$2y$12$6.ux787GrC8T3yCiiAH9UuhQsZ1zCYViBYJA/vLWfCWxoPe9G1kP6";

const dashboard = new ParseDashboard({
    apps: [
        {
            serverURL: SERVER_URL,
            appId: APP_ID,
            masterKey: MASTER_KEY,
            appName: APP_NAME
        }
    ],
    users: [
        {
          user: DEFAULT_USER,
          pass: DEFAULT_PASSWORD,
        },
      ],
      useEncryptedPasswords: true,
      trustProxy: 1
}, {
    allowInsecureHTTP: true,
    cookieSessionSecret: "cookieSessionSecret",
});

const application = express();

application.use("/dashboard", dashboard);

const httpServer = http.createServer(application);
httpServer.listen(4040, () => {
    console.log("Started parse dashboard")
});