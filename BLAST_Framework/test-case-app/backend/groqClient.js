const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a senior QA engineer. Given a Jira ticket (summary, description, acceptance criteria, type, priority), produce a complete set of detailed Test Cases in Markdown.

Output a Markdown table with these exact columns:
| ID | Title | Type | Priority | Preconditions | Steps | Test Data | Expected Result |

Rules:
- ID format: TC-01, TC-02, ...
- Type: one of Functional, Negative, Boundary, Security, UI/UX, Regression
- Priority: P1 (Critical), P2 (High), or P3 (Low)
- Cover EVERY acceptance criterion in the ticket with at least one positive (happy-path) test case
- Add negative cases for invalid/missing/malformed input
- Add boundary cases (empty, max length, special characters) where relevant to the fields involved
- Add security cases where the feature touches authentication, authorization, or user input (e.g. injection, XSS, enumeration) — especially important for healthcare/regulated domains
- Steps must be numbered and concrete (state exact actions, not vague descriptions)
- Expected Result must be specific and verifiable (what the user sees / what the system does)
- Be concrete and specific to THIS ticket's content — never output generic placeholders

After the table, add a short "## Coverage Notes" section mapping each Acceptance Criterion to the Test Case ID(s) that cover it, and a "## Suggested Additional Coverage" bullet list for anything worth testing that wasn't explicit in the ticket.

Output valid Markdown only, no preamble.`;

export async function generateTestCases({ apiKey, model, ticket }) {
  if (!apiKey) throw new Error('Groq API key is not configured');

  const userPrompt = `Generate detailed Test Cases for this Jira ticket:

Ticket ID: ${ticket.key}
Type: ${ticket.issueType}
Epic: ${ticket.epicKey} - ${ticket.epicSummary}
Priority: ${ticket.priority}
Status: ${ticket.status}
Project: ${ticket.project}
Summary: ${ticket.summary}

Description / Acceptance Criteria:
${ticket.description}`;

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Groq request failed (${res.status} ${res.statusText}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned no content');
  return content;
}
