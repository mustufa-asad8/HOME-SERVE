import axios from 'axios';
import { config } from '../config.js';

export const dataService = axios.create({
  baseURL: `${config.dataServiceUrl}/internal`,
  timeout: 8000,
  headers: { 'X-Internal-Key': config.internalServiceKey },
});
