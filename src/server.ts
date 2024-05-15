import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import { config } from './config/config';
import Logging from './library/Logging';
import authorRoutes from './routes/Author';

const router = express();

/** Connect to MongoDb */
mongoose
    .connect(config.mongo.url, { retryWrites: true, w: 'majority' })
    .then(() => {
        Logging.info('Connected to MongoDb');
        StartServer();
    })
    .catch((error) => {
        Logging.error('Unable to Connect');
        Logging.error(error);
    });

/** Only once connected to MongoDb */
const StartServer = () => {
    router.use((req, res, next) => {
        /** Log Request */
        Logging.info(`Request recived >> Method - [${req.method}] :: URL - [${req.url}] :: IP - [${req.socket.remoteAddress}]`);

        res.on('finish', () => {
            /** Log Response */
            Logging.info(`Response recived >> Method - [${req.method}] :: URL - [${req.url}] :: IP - [${req.socket.remoteAddress} :: Status - [${res.statusCode}]`);
        });
        next();
    });

    /** API Rules */
    router.use(express.urlencoded({ extended: true }));
    router.use(express.json());

    router.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization ');

        if (req.method == 'OPTIONS') {
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
            return res.status(200).json({});
        }
        next();
    });

    /** Routes */
    router.use('/authors', authorRoutes);

    /** Healthcheck */
    router.get('/tik', (req, res, next) => res.status(200).json({ message: 'tok' }));

    /** Error */
    router.use((req, res, next) => {
        const error = new Error('Not Found');
        Logging.error(error);

        return res.status(404).json({ message: error.message });
    });

    http.createServer(router).listen(config.server.port, () => Logging.info(`Server is running on the ${config.server.port} port`));
};
