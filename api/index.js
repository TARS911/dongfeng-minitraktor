/**
 * Vercel Serverless Function Entry Point
 * Wraps Fastify server for Vercel deployment
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Routes
import productRoutes from '../backend/routes/products.js';
import formRoutes from '../backend/routes/forms.js';
import orderRoutes from '../backend/routes/orders.js';
import adminRoutes from '../backend/routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Fastify instance
const fastify = Fastify({
  logger: false  // Disable logger for serverless
});

// Register CORS
await fastify.register(cors, {
  origin: (origin, cb) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8000',
      'https://dongfeng-minitraktor.onrender.com',
      /\.vercel\.app$/,
      /\.railway\.app$/,
      process.env.FRONTEND_URL
    ].filter(Boolean);

    if (!origin) {
      cb(null, true);
      return;
    }

    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') {
        return origin === allowed;
      }
      return allowed.test(origin);
    });

    cb(null, isAllowed);
  },
  credentials: true
});

// Register static files (frontend)
await fastify.register(staticFiles, {
  root: join(__dirname, '../frontend'),
  prefix: '/',
});

// Health check
fastify.get('/api/health', async (request, reply) => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'vercel'
  };
});

// Register API routes
await fastify.register(productRoutes, { prefix: '/api' });
await fastify.register(formRoutes, { prefix: '/api' });
await fastify.register(orderRoutes, { prefix: '/api' });
await fastify.register(adminRoutes, { prefix: '/api/admin' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  console.error(error);
  return reply.code(error.statusCode || 500).send({
    success: false,
    error: error.message || 'Internal Server Error'
  });
});

// Not found handler
fastify.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith('/api')) {
    return reply.code(404).send({
      success: false,
      error: 'Endpoint not found'
    });
  }
  return reply.sendFile('index.html');
});

// Export handler for Vercel
export default async (req, res) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};
