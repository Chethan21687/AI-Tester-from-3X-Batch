import express from 'express';
import cors from 'cors';
import { loadSettings, saveSettings, maskedSettings } from './settingsStore.js';
import { fetchJiraIssue } from './jiraClient.js';
import { generateTestStrategy } from './groqClient.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/settings', (_req, res) => {
  res.json(maskedSettings(loadSettings()));
});

app.post('/api/settings', (req, res) => {
  const { jiraId, jiraEmail, jiraToken, jiraBaseUrl, groqApiKey, groqModel } = req.body || {};
  const update = {};
  if (jiraId !== undefined) update.jiraId = jiraId.trim();
  if (jiraEmail !== undefined) update.jiraEmail = jiraEmail.trim();
  if (jiraBaseUrl !== undefined) update.jiraBaseUrl = jiraBaseUrl.trim();
  if (groqModel !== undefined) update.groqModel = groqModel.trim();
  // Only overwrite secrets if a new non-empty value was actually provided
  // (frontend sends masked values back on load; never persist a mask over a real secret)
  if (jiraToken) update.jiraToken = jiraToken.trim();
  if (groqApiKey) update.groqApiKey = groqApiKey.trim();

  const saved = saveSettings(update);
  res.json(maskedSettings(saved));
});

app.post('/api/jira/fetch', async (req, res) => {
  const settings = loadSettings();
  const ticketId = (req.body?.ticketId || settings.jiraId || '').trim();

  try {
    const ticket = await fetchJiraIssue({
      baseUrl: settings.jiraBaseUrl,
      email: settings.jiraEmail,
      token: settings.jiraToken,
      ticketId
    });
    res.json({ ticket });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/strategy/generate', async (req, res) => {
  const settings = loadSettings();
  const ticketId = (req.body?.ticketId || settings.jiraId || '').trim();

  try {
    const ticket = await fetchJiraIssue({
      baseUrl: settings.jiraBaseUrl,
      email: settings.jiraEmail,
      token: settings.jiraToken,
      ticketId
    });

    const strategyMarkdown = await generateTestStrategy({
      apiKey: settings.groqApiKey,
      model: settings.groqModel,
      ticket
    });

    res.json({ ticket, strategyMarkdown });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Test Strategy backend running on http://localhost:${PORT}`);
});
