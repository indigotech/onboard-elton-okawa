import 'reflect-metadata';
import * as dotenv from 'dotenv-flow';
dotenv.config();

import { Connection } from 'typeorm';

import { startServer } from './server';

startServer();
