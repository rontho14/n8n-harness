#!/usr/bin/env node
/**
 * Validate n8n workflow JSON: syntax, required fields, nodes, connections.
 * Usage: node scripts/validate-workflow.mjs [--fix] <path> [path...]
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';

const SECRET_PATTERNS = [
  /"apiKey"\s*:\s*"(?!\\{\\{)[^"]{8,}"/i,
  /"password"\s*:\s*"(?!\\{\\{)[^"]+"/i,
  /"accessToken"\s*:\s*"(?!\\{\\{)[^"]{8,}"/i,
  /"secret"\s*:\s*"(?!\\{\\{)[^"]{8,}"/i,
  /"clientSecret"\s*:\s*"(?!\\{\\{)[^"]{8,}"/i,
];

const args = process.argv.slice(2);
const fix = args.includes('--fix');
const paths = args.filter((a) => a !== '--fix');

if (paths.length === 0) {
  console.error('Usage: node scripts/validate-workflow.mjs [--fix] <workflow.json> [...]');
  process.exit(1);
}

let failed = false;

for (const filePath of paths) {
  const errors = [];
  const warnings = [];
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error(`FAIL ${filePath}: ${e.message}`);
    failed = true;
    continue;
  }

  if (SECRET_PATTERNS.some((re) => re.test(raw))) {
    warnings.push('Possible hardcoded secret in JSON — use n8n credentials instead');
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`FAIL ${basename(filePath)}: Invalid JSON — ${e.message}`);
    failed = true;
    continue;
  }

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Missing or invalid top-level "name" (string)');
  }
  if (!Array.isArray(data.nodes)) {
    errors.push('Missing or invalid "nodes" (array)');
  }
  if (!data.connections || typeof data.connections !== 'object') {
    errors.push('Missing or invalid "connections" (object)');
  }

  const nodeNames = new Set();
  const nodeIds = new Set();

  if (Array.isArray(data.nodes)) {
    for (const [i, node] of data.nodes.entries()) {
      const label = `nodes[${i}]`;
      if (!node.id) errors.push(`${label}: missing "id"`);
      if (!node.name) errors.push(`${label}: missing "name"`);
      if (!node.type) errors.push(`${label}: missing "type"`);
      if (node.typeVersion === undefined) warnings.push(`${label}: missing "typeVersion"`);
      if (!Array.isArray(node.position) || node.position.length !== 2) {
        warnings.push(`${label}: "position" should be [x, y]`);
      }
      if (node.name) {
        if (nodeNames.has(node.name)) errors.push(`Duplicate node name: "${node.name}"`);
        nodeNames.add(node.name);
      }
      if (node.id) {
        if (nodeIds.has(node.id)) errors.push(`Duplicate node id: "${node.id}"`);
        nodeIds.add(node.id);
      }
    }
  }

  if (data.connections && typeof data.connections === 'object') {
    for (const [source, outputs] of Object.entries(data.connections)) {
      if (!nodeNames.has(source)) {
        warnings.push(`Connection source "${source}" not found in nodes`);
      }
      const mains = outputs?.main;
      if (!Array.isArray(mains)) continue;
      for (const branch of mains) {
        if (!Array.isArray(branch)) continue;
        for (const link of branch) {
          if (link?.node && !nodeNames.has(link.node)) {
            errors.push(`Connection targets missing node "${link.node}" (from "${source}")`);
          }
        }
      }
    }
  }

  const triggers = (data.nodes || []).filter((n) =>
    /trigger|webhook|schedule|cron|manual/i.test(n.type || ''),
  );
  if (triggers.length === 0) {
    warnings.push('No obvious trigger node — confirm workflow entry point');
  }

  if (fix) {
    const ordered = {
      name: data.name,
      nodes: data.nodes,
      connections: data.connections,
      settings: data.settings,
      pinData: data.pinData,
      meta: data.meta,
      tags: data.tags,
      staticData: data.staticData,
      versionId: data.versionId,
      id: data.id,
    };
    const cleaned = Object.fromEntries(
      Object.entries(ordered).filter(([, v]) => v !== undefined),
    );
    writeFileSync(filePath, `${JSON.stringify(cleaned, null, 2)}\n`, 'utf8');
    console.log(`FIXED formatting: ${filePath}`);
  }

  const name = basename(filePath);
  if (errors.length) {
    console.error(`FAIL ${name}:`);
    errors.forEach((e) => console.error(`  - ${e}`));
    failed = true;
  } else {
    console.log(`OK ${name} (${data.nodes?.length ?? 0} nodes)`);
  }
  warnings.forEach((w) => console.warn(`  warn: ${w}`));
}

process.exit(failed ? 1 : 0);
