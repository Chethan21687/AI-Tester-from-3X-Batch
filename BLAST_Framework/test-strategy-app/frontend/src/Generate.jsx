import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Search, Loader2, AlertCircle, Download, Ticket,
  Layers, Flag, Activity, GitBranch, Sparkles
} from 'lucide-react';
import { generateStrategy } from './api';

const PRIORITY_CLASS = {
  Highest: 'badge-priority-critical',
  High: 'badge-priority-high',
  Medium: 'badge-priority-medium',
  Low: 'badge-priority-low',
  Lowest: 'badge-priority-low'
};

function MetaBadge({ icon: Icon, label, className = '' }) {
  return (
    <span className={`meta-badge ${className}`}>
      <Icon size={14} />
      {label}
    </span>
  );
}

export default function Generate() {
  const [ticketId, setTicketId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateStrategy(ticketId.trim() || undefined);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.strategyMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test_strategy_${result.ticket.key}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="generate">
      <div className="panel-heading">
        <h2><Sparkles size={20} className="accent" /> Generate Test Strategy</h2>
      </div>
      <p className="hint">
        Pulls the ticket straight from Jira, hands it to Groq's LLM, and returns a ready-to-use
        Markdown test strategy — objectives, test cases, risks and all.
      </p>

      <form onSubmit={handleGenerate} className="generate-form">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Jira ticket ID (leave blank to use configured default)"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
          />
        </div>
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? <Loader2 className="spin" size={16} /> : <Sparkles size={16} />}
          {loading ? 'Generating…' : 'Fetch & Generate'}
        </button>
      </form>

      {loading && (
        <div className="loading-block loading-strategy">
          <Loader2 className="spin" size={28} />
          <div>
            <strong>Talking to Jira and Groq…</strong>
            <p>Fetching ticket details, then generating your test strategy. This can take ~10–20s.</p>
          </div>
        </div>
      )}

      {error && (
        <p className="status error">
          <AlertCircle size={16} /> {error}
        </p>
      )}

      {result && (
        <>
          <div className="ticket-card">
            <div className="ticket-card-head">
              <Ticket size={20} className="accent" />
              <h3>{result.ticket.key} — {result.ticket.summary}</h3>
            </div>
            <div className="ticket-meta">
              <MetaBadge icon={Layers} label={result.ticket.issueType} />
              <MetaBadge
                icon={Flag}
                label={`Priority: ${result.ticket.priority}`}
                className={PRIORITY_CLASS[result.ticket.priority] || ''}
              />
              <MetaBadge icon={Activity} label={`Status: ${result.ticket.status}`} />
              {result.ticket.epicKey && (
                <MetaBadge icon={GitBranch} label={`Epic: ${result.ticket.epicKey} ${result.ticket.epicSummary}`} />
              )}
            </div>
          </div>

          <div className="strategy-toolbar">
            <button type="button" className="secondary-btn" onClick={handleDownload}>
              <Download size={16} /> Download .md
            </button>
          </div>

          <article className="strategy-output">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.strategyMarkdown}</ReactMarkdown>
          </article>
        </>
      )}
    </div>
  );
}
