import { ParseServer } from 'parse-server';
import express from 'express';
import http from 'http';
import {initServer} from "./model/init";
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';

const HOST = process.env.SCRUMLR_API_HOST || 'localhost';
const PORT = process.env.SCRUMLR_API_PORT || 4000;
const MASTER_KEY = process.env.SCRUMLR_API_MASTER_KEY || 'masterKey';
const DATABASE_URI = process.env.SCRUMLR_DATABASE_URI || 'mongodb://localhost:27017/dev';
const SERVE_PRODUCTION_WEBAPP = process.env.SCRUMLR_SERVE_PRODUCTION_WEBAPP || false;

export const serverConfig = {
    databaseURI: DATABASE_URI,
    appId: 'Scrumlr',
    cloud: __dirname + '/cloud.ts',
    masterKey: MASTER_KEY,
    serverURL: `http://${HOST}:${PORT}/api`,
    //jsonLogs: true,
    liveQuery: {
        classNames: [ 'Board', 'Note', 'JoinRequest', '_Role' ]
    },
    objectIdSize: 32,
    auth: {
        anonymous: {},
        github: {
            id: "user's Github id (string)",
            access_token: "an authorized Github access token for the user"
        }
    }
}

const api = new ParseServer(serverConfig);

const application = express();
application.use("/api", api);

if (SERVE_PRODUCTION_WEBAPP) {
    console.log('Serving production webapp from local directory');
    application.use('/', express.static(path.join(__dirname, '/public')));
} else {
    console.log('Proxy to development branch of webapp');
    application.use("/", createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true }));
}

const httpServer = http.createServer(application);
httpServer.listen(PORT, () => {
    console.log(`Scrumlr server running on ${HOST}:${PORT}`);
    initServer('Scrumlr', `http://${HOST}:${PORT}/api`, MASTER_KEY).catch((err) => {
        console.error('unable to init backend', err);
        throw err;
    });
});
ParseServer.createLiveQueryServer(httpServer);