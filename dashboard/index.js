import ParseDashboard from "parse-dashboard";
import express from "express";
import http from "http";

const dashboard = new ParseDashboard({
    apps: [
        {
            serverURL: "http://kubernetes.docker.internal/api",
            appId: "Scrumlr",
            masterKey: "masterKey",
            appName: "Scrumlr"
        }
    ],
    users: [
        {
          user: "scrumlr",
          pass: "$2y$12$6.ux787GrC8T3yCiiAH9UuhQsZ1zCYViBYJA/vLWfCWxoPe9G1kP6",
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