/**
 * n8n-harness-mcp — vendored MCP server for n8n-harness (stdio, private fork).
 * Upstream MIT attribution: see mcp/LICENSE and mcp/THIRD_PARTY.md.
 */

// Engine exports for service integration
export { N8NMCPEngine, EngineHealth, EngineOptions } from './mcp-engine';
export { SingleSessionHTTPServer } from './http-server-single-session';
export { ConsoleManager } from './utils/console-manager';
export { N8NDocumentationMCPServer } from './mcp/server';

// Type exports for multi-tenant and library usage
export type {
  InstanceContext
} from './types/instance-context';
export {
  validateInstanceContext,
  isInstanceContext
} from './types/instance-context';
export type {
  SessionState
} from './types/session-state';
export type {
  GenerateWorkflowArgs,
  GenerateWorkflowResult,
  GenerateWorkflowProposal,
  GenerateWorkflowHandler,
  GenerateWorkflowHelpers
} from './types/generate-workflow';
export type {
  AdditionalTool,
  AdditionalToolContext
} from './types/additional-tools';

// UI module exports
export type { UIAppConfig, UIMetadata } from './mcp/ui/types';
export { UI_APP_CONFIGS } from './mcp/ui/app-configs';

// Re-export MCP SDK types for convenience
export type {
  Tool,
  CallToolResult,
  ListToolsResult
} from '@modelcontextprotocol/sdk/types.js';

// Default export for convenience
import N8NMCPEngine from './mcp-engine';
export default N8NMCPEngine;

// Legacy CLI functionality - moved to ./mcp/index.ts
// This file now serves as the main entry point for library usage