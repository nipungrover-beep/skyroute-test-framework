#!/usr/bin/env node
/**
 * Fetches a Jira issue's summary/description/status via the Atlassian Cloud
 * REST API, for pulling requirements into test planning.
 *
 * Usage: node scripts/fetch-jira-issue.js SCRUM-1
 * Requires JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN in .env.
 */
require('dotenv').config();

const issueKey = process.argv[2];
if (!issueKey) {
  console.error('Usage: node scripts/fetch-jira-issue.js <ISSUE-KEY>');
  process.exit(1);
}

const { JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN } = process.env;
if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('Missing JIRA_BASE_URL / JIRA_EMAIL / JIRA_API_TOKEN in .env');
  process.exit(1);
}

/** Renders Atlassian Document Format (the JSON tree Jira uses for rich text) as plain text. */
function renderAdf(node, indent = '') {
  if (!node) return '';
  if (node.type === 'text') return node.text;

  const children = (node.content || []).map((child) => renderAdf(child, indent)).join('');

  switch (node.type) {
    case 'doc':
      return children;
    case 'paragraph':
      return `${indent}${children}\n\n`;
    case 'heading':
      return `${indent}${'#'.repeat(node.attrs?.level || 1)} ${children}\n\n`;
    case 'bulletList':
    case 'orderedList':
      return `${children}\n`;
    case 'listItem':
      return `${indent}- ${(node.content || []).map((c) => renderAdf(c, '')).join('').trim()}\n`;
    case 'hardBreak':
      return '\n';
    default:
      return children;
  }
}

async function main() {
  const url = `${JIRA_BASE_URL.replace(/\/$/, '')}/rest/api/3/issue/${issueKey}?fields=summary,description,status,priority,issuetype`;
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    console.error(`Jira API returned ${res.status} ${res.statusText}`);
    console.error(await res.text());
    process.exit(1);
  }

  const issue = await res.json();
  const { summary, description, status, priority, issuetype } = issue.fields;

  console.log(`${issue.key}: ${summary}`);
  console.log(`Type: ${issuetype?.name ?? 'n/a'} | Status: ${status?.name ?? 'n/a'} | Priority: ${priority?.name ?? 'n/a'}`);
  console.log(`${JIRA_BASE_URL.replace(/\/$/, '')}/browse/${issue.key}`);
  console.log('---');
  console.log(description ? renderAdf(description).trim() : '(no description)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
