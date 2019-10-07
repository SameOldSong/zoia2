/* eslint-disable import/order */
import security from '../../../etc/secure.json';
import logger from '../../lib/logger';
import fastifyMongo from 'fastify-mongodb';
import fastifyURLData from 'fastify-url-data';
import fastifyCORS from 'fastify-cors';
import fastifyJWT from 'fastify-jwt';
import fastifyFormbody from 'fastify-formbody';
import fastifyMultipart from 'fastify-multipart';
import fastifyCookie from 'fastify-cookie';
import modules from '../../build/modules.json';
import error404 from '../error404/index.marko';
import site from '../../lib/site';
import {
    MongoClient
} from 'mongodb';
import Pino from 'pino';
import Fastify from 'fastify';

const log = Pino({
    level: security.loglevel
});
const fastify = Fastify({
    logger,
    trustProxy: security.trustProxy
});

(async () => {
    const mongoClient = new MongoClient(security.mongo.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    await mongoClient.connect();
    fastify.register(fastifyFormbody);
    fastify.register(fastifyMultipart, {
        addToBody: true
    });
    fastify.register(fastifyURLData);
    fastify.register(fastifyCookie);
    fastify.register(fastifyMongo, {
        client: mongoClient,
        database: security.mongo.dbName
    }).register((ff, opts, next) => {
        ff.mongo.client.db(security.mongo.dbName).on('close', () => {
            log.error('Connection to MongoDB is broken');
            process.exit(1);
        });
        next();
    });
    fastify.register(fastifyCORS, {
        origin: security.originCORS
    });
    fastify.register(fastifyJWT, {
        secret: security.secret
    });
    await Promise.all(Object.keys(modules).map(async m => {
        const module = await import(`../../../modules/${m}/user/index.js`);
        module.default(fastify);
    }));
    fastify.setNotFoundHandler(async (req, rep) => {
        const siteData = await site.getSiteData(req, fastify);
        siteData.title = `${siteData.t['Page not found']} | ${siteData.title}`;
        const render = await error404.render({
            error: siteData.t['Page not found'],
            $global: {
                siteData,
                t: siteData.t
            }
        });
        rep.code(404).type('text/html').send(render.out.stream.str);
    });
    log.info('Starting Web server...');
    fastify.listen(security.webServer.port, security.webServer.ip);
})().catch(err => {
    log.error(err);
    process.exit(1);
});
