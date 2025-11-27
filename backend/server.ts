/**
 * Express server for AI agent backend
 */

import { config } from "dotenv";
// Load environment variables
config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import fs from 'fs';
import agentRoutes from './api/routes/agents.js';
import adminRoutes from './api/routes/admin.js';
import cbaRoutes from './api/cba-routes.js';
import crewSchedulingRoutes from './api/routes/crew-scheduling.js';
import testLabRoutes from './api/routes/test-lab.js';
import fleetRoutes from './api/routes/fleet.js';
import fleetScraperRoutes from './api/routes/fleet-scraper.js';
import logger, { logRequest } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }
});

const PORT = parseInt(process.env.PORT || '3001', 10);

// Export io for use in other modules
export { io };

// Health check endpoint FIRST - before any middleware that could block it
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Version and deployment info endpoint
app.get('/api/version', (req, res) => {
  res.status(200).json({
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    railway: {
      environment: process.env.RAILWAY_ENVIRONMENT || 'not-set',
      publicDomain: process.env.RAILWAY_PUBLIC_DOMAIN || 'not-set',
      deployment: process.env.RAILWAY_DEPLOYMENT_ID || 'not-set',
      service: process.env.RAILWAY_SERVICE_NAME || 'not-set'
    },
    deployedAt: process.env.RAILWAY_DEPLOYMENT_ID ? new Date().toISOString() : 'unknown',
    buildTimestamp: new Date().toISOString(),
    node: process.version,
    uptime: process.uptime()
  });
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// JSON body parser - errors will be caught by error handler middleware
app.use(express.json());

// Request timeout (2 minutes for AI agent processing)
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  next();
});

// Request logging with timing
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest(req.method, req.path, res.statusCode, duration);
  });

  next();
});

// API Routes
app.use('/api/agents', agentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/cba', cbaRoutes);
app.use('/api/crew-scheduling', crewSchedulingRoutes);
app.use('/api/test-lab', testLabRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/v1', fleetScraperRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });

  // Join admin room for agent activity updates
  socket.on('join:admin', () => {
    socket.join('admin');
    logger.debug(`Client ${socket.id} joined admin room`);
  });

  // Leave admin room
  socket.on('leave:admin', () => {
    socket.leave('admin');
    logger.debug(`Client ${socket.id} left admin room`);
  });
});

// Serve static frontend files from /public directory
// In production (Docker), files are at /app/public
// In development, they might be at ../dist or ../public
const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT === 'production';

let publicPath: string = '/app/public'; // Default fallback

if (isProduction) {
  // Production: try multiple possible locations based on Dockerfile structure
  // Dockerfile copies frontend dist to /app/public
  const possiblePaths = [
    '/app/public',           // Standard Dockerfile location
    '/app/dist',             // Alternative location
    path.join(__dirname, '..', 'public'), // Relative fallback
    path.join(__dirname, '..', 'dist'),   // Relative fallback
  ];
  
  // Find the first path that exists and contains index.html
  for (const testPath of possiblePaths) {
    const indexPath = path.join(testPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      publicPath = testPath;
      break;
    }
  }
} else {
  // Development: try multiple possible locations
  // __dirname is backend/dist, so go up to root, then into dist
  publicPath = path.join(__dirname, '..', 'dist');
  // Fallback to public if dist doesn't exist
  if (!fs.existsSync(publicPath)) {
    publicPath = path.join(__dirname, '..', 'public');
  }
}

logger.info(`Serving static files from: ${publicPath}`);
logger.debug(`__dirname: ${__dirname}`);
logger.debug(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
logger.debug(`RAILWAY_ENVIRONMENT: ${process.env.RAILWAY_ENVIRONMENT || 'not set'}`);

// Verify index.html exists
const indexPath = path.join(publicPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  logger.warn(`index.html not found at ${indexPath}`);
  logger.warn(`Attempting to list directory contents of ${publicPath}:`);
  try {
    const files = fs.readdirSync(publicPath);
    logger.warn(`Found files: ${files.join(', ')}`);
  } catch (err) {
    logger.error(`Could not read directory: ${err}`);
  }
}
app.use(express.static(publicPath));

// Catch-all route to serve index.html for client-side routing (SPA support)
// This MUST come after API routes to ensure API endpoints are not overridden
app.get('*', (req, res, next) => {
  // Skip API routes and health check - let them fall through to 404 if not matched
  if (req.path.startsWith('/api/') || req.path === '/health') {
    return next();
  }

  // Serve index.html for all other routes (client-side routing)
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      logger.error('Error serving index.html', { error: err, path: indexPath });
      res.status(500).send('Error loading application');
    }
  });
});

// Error handling middleware - must be after routes
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Prevent sending response if headers already sent
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    logger.error('JSON parsing error', { error: err, path: req.path });
    return res.status(400).json({
      error: 'Invalid JSON in request body',
      message: 'The request body contains invalid JSON. Please check your request format.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Handle other errors
  logger.error('Unhandled error', {
    error: err,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode || err.status || 500
  });

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Unknown error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});

// Start server - bind to 0.0.0.0 for Railway
httpServer.listen(PORT, '0.0.0.0', () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = isProduction
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN || 'your-app.up.railway.app'}`
    : `http://localhost:${PORT}`;

  logger.info('🚀 Aioscrew AI Agent Backend');
  logger.info('================================');
  logger.info(`📡 Server running on port ${PORT}`);
  logger.info(`🌐 API: ${baseUrl}`);
  logger.info(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  logger.info(`🤖 Agents: Flight Time, Premium Pay, Compliance`);
  logger.info(`🔌 WebSocket: Enabled for real-time updates`);
  logger.info(`🔑 Claude API: ${process.env.ANTHROPIC_API_KEY ? 'Configured ✓' : 'Missing ✗'}`);
  logger.info(`💾 Database: ${process.env.DATABASE_URL ? 'Connected ✓' : 'Missing ✗'}`);
  logger.info(`📊 Neo4j: ${process.env.NEO4J_URI ? 'Configured ✓' : 'Missing ✗'}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info('================================');
  logger.info(`✅ Server is listening and ready to accept connections`);
});

// Handle server errors
httpServer.on('error', (error: NodeJS.ErrnoException) => {
  logger.error('Server error', { error, code: error.code });
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  httpServer.close(async () => {
    try {
      const { closeNeo4jDriver } = await import('./services/neo4j-service.js');
      await closeNeo4jDriver();
      logger.info('✅ Server closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  httpServer.close(async () => {
    try {
      const { closeNeo4jDriver } = await import('./services/neo4j-service.js');
      await closeNeo4jDriver();
      logger.info('✅ Server closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error });
      process.exit(1);
    }
  });
});

export default app;
