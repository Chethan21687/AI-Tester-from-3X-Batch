import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = join(__dirname, 'settings.json');

const DEFAULTS = {
  jiraId: process.env.JIRA_ID || '',
  jiraEmail: process.env.JIRA_EMAIL || '',
  jiraToken: process.env.JIRA_TOKEN || '',
  jiraBaseUrl: process.env.JIRA_BASE_URL || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'
};

// Vercel's runtime filesystem is read-only — settings there come from env vars only.
const READ_ONLY = Boolean(process.env.VERCEL);

export function loadSettings() {
  if (READ_ONLY || !existsSync(SETTINGS_PATH)) return { ...DEFAULTS };
  try {
    const raw = JSON.parse(readFileSync(SETTINGS_PATH, 'utf-8'));
    return { ...DEFAULTS, ...raw };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(partial) {
  const current = loadSettings();
  const merged = { ...current, ...partial };
  if (READ_ONLY) return merged;
  writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function isReadOnly() {
  return READ_ONLY;
}

export function maskSecret(value) {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}

export function maskedSettings(settings) {
  return {
    ...settings,
    jiraToken: settings.jiraToken ? maskSecret(settings.jiraToken) : '',
    groqApiKey: settings.groqApiKey ? maskSecret(settings.groqApiKey) : '',
    jiraTokenSet: Boolean(settings.jiraToken),
    groqApiKeySet: Boolean(settings.groqApiKey),
    readOnly: READ_ONLY,
    note: READ_ONLY ? 'Settings are configured via environment variables on this deployment and cannot be changed here.' : undefined
  };
}
