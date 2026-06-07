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

export function loadSettings() {
  if (!existsSync(SETTINGS_PATH)) return { ...DEFAULTS };
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
  writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
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
    groqApiKeySet: Boolean(settings.groqApiKey)
  };
}
