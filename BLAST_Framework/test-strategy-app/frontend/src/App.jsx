import { useState } from 'react';
import { Settings as SettingsIcon, Sparkles, Workflow } from 'lucide-react';
import Settings from './Settings';
import Generate from './Generate';
import './App.css';

const TABS = [
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'generate', label: 'Generate Strategy', icon: Sparkles }
];

function App() {
  const [tab, setTab] = useState('settings');

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-badge"><Workflow size={26} /></span>
          <div>
            <h1>Test Strategy Generator</h1>
            <p>Jira <span className="arrow">→</span> Groq LLM <span className="arrow">→</span> Test Strategy, automated</p>
          </div>
        </div>
      </header>

      <nav className="tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={tab === id ? 'tab active' : 'tab'}
            onClick={() => setTab(id)}
            type="button"
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'settings' ? <Settings /> : <Generate />}
      </main>

      <footer className="app-footer">
        Built with the BLAST Framework · Jira REST API · Groq LLM
      </footer>
    </div>
  );
}

export default App;
