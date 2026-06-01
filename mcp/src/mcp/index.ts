#!/usr/bin/env node

import { N8NDocumentationMCPServer } from './server';
import { logger } from '../utils/logger';
import { existsSync } from 'fs';

// Add error details to stderr for Claude Desktop debugging
process.on('uncaughtException', (error) => {
  if (process.env.MCP_MODE !== 'stdio') {
    console.error('Uncaught Exception:', error);
  }
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  if (process.env.MCP_MODE !== 'stdio') {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

/**
 * Detects if running in a container environment (Docker, Podman, Kubernetes, etc.)
 * Uses multiple detection methods for robustness:
 * 1. Environment variables (IS_DOCKER, IS_CONTAINER with multiple formats)
 * 2. Filesystem markers (/.dockerenv, /run/.containerenv)
 *
 * Containers manage their own lifecycle via signals (SIGTERM on `docker stop`),
 * not via stdin close. Detached containers (`docker run -d` without `-i`) have
 * stdin redirected from /dev/null, which would otherwise trigger immediate
 * stdin-close shutdown — see the guarded block below and Issue #711 for the
 * trade-off with stateless stdio clients.
 */
function isContainerEnvironment(): boolean {
  const dockerEnv = (process.env.IS_DOCKER || '').toLowerCase();
  const containerEnv = (process.env.IS_CONTAINER || '').toLowerCase();

  if (['true', '1', 'yes'].includes(dockerEnv)) {
    return true;
  }
  if (['true', '1', 'yes'].includes(containerEnv)) {
    return true;
  }

  try {
    return existsSync('/.dockerenv') || existsSync('/run/.containerenv');
  } catch (error) {
    logger.debug('Container detection filesystem check failed:', error);
    return false;
  }
}

async function main() {
  const mode = process.env.MCP_MODE || 'stdio';

  try {
    if (mode === 'http') {
      console.error(`Starting n8n Documentation MCP Server in ${mode} mode...`);
      console.error('Current directory:', process.cwd());
      console.error('Node version:', process.version);

      if (process.env.USE_FIXED_HTTP === 'true') {
        logger.warn(
          'DEPRECATION WARNING: USE_FIXED_HTTP=true is deprecated as of v2.31.8. ' +
          'The fixed HTTP implementation does not support SSE streaming required by clients like OpenAI Codex. ' +
          'Please unset USE_FIXED_HTTP to use the modern SingleSessionHTTPServer which supports both JSON-RPC and SSE. ' +
          'This option will be removed in a future version. See: mcp/THIRD_PARTY.md (upstream)'
        );
        console.warn('\n⚠️  DEPRECATION WARNING ⚠️');
        console.warn('USE_FIXED_HTTP=true is deprecated as of v2.31.8.');
        console.warn('The fixed HTTP implementation does not support SSE streaming.');
        console.warn('Please unset USE_FIXED_HTTP to use SingleSessionHTTPServer.');
        console.warn('See: mcp/THIRD_PARTY.md (upstream)');

        const { startFixedHTTPServer } = await import('../http-server');
        await startFixedHTTPServer();
      } else {
        const { SingleSessionHTTPServer } = await import('../http-server-single-session');
        const server = new SingleSessionHTTPServer();

        const shutdown = async () => {
          await server.shutdown();
          process.exit(0);
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

        await server.start();
      }
    } else {
      const server = new N8NDocumentationMCPServer();

      let isShuttingDown = false;
      const shutdown = async (signal: string = 'UNKNOWN') => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        try {
          logger.info(`Shutdown initiated by: ${signal}`);
          await server.shutdown();

          if (process.stdin && !process.stdin.destroyed) {
            process.stdin.pause();
            process.stdin.destroy();
          }

          setTimeout(() => {
            logger.warn('Shutdown timeout exceeded, forcing exit');
            process.exit(0);
          }, 1000).unref();
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
      process.on('SIGHUP', () => shutdown('SIGHUP'));

      const isContainer = isContainerEnvironment();

      if (!isContainer && process.stdin.readable && !process.stdin.destroyed) {
        try {
          process.stdin.on('end', () => shutdown('STDIN_END'));
          process.stdin.on('close', () => shutdown('STDIN_CLOSE'));
        } catch (error) {
          logger.error('Failed to register stdin handlers, using signal handlers only:', error);
        }
      }

      await server.run();
    }
  } catch (error) {
    if (mode !== 'stdio') {
      console.error('Failed to start MCP server:', error);
      logger.error('Failed to start MCP server', error);

      if (error instanceof Error && error.message.includes('nodes.db not found')) {
        console.error('\nTo fix this issue:');
        console.error('1. cd to the n8n-harness-mcp directory');
        console.error('2. Run: npm run build');
        console.error('3. Run: npm run rebuild');
      } else if (error instanceof Error && error.message.includes('NODE_MODULE_VERSION')) {
        console.error('\nTo fix this Node.js version mismatch:');
        console.error('1. cd to the n8n-harness-mcp directory');
        console.error('2. Run: npm rebuild better-sqlite3');
        console.error('3. If that doesn\'t work, try: rm -rf node_modules && npm install');
      }
    }

    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}
