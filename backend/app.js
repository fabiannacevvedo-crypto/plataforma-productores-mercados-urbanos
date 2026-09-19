import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './src/routes/index.js';
import { errorHandler, notFoundHandler } from './src/middlewares/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', routes);

app.use(notFoundHandler);
app.use(errorHandler);