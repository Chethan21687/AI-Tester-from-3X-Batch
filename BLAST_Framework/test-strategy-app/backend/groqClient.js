const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a senior QA architect. Given a Jira ticket (summary, description, acceptance criteria, type, priority), produce a complete Test Strategy in Markdown.

Always include these sections:
1. Overview (ticket id, summary, epic, priority)
2. User Story (if present in description)
3. Scope (In Scope / Out of Scope)
4. Test Objectives (numbered list)
5. Test Approach (table: layer -> tool/method)
6. Test Types to apply (functional, negative, boundary, security, UI/UX — pick what's relevant)
7. Detailed Test Cases — each with ID, Type, Priority (P1/P2/P3), Precondition, Steps, Expected Result. Map them to acceptance criteria where possible, plus add relevant negative/boundary/security cases.
8. Risk Analysis (table: risk, likelihood, impact, mitigation)
9. Entry/Exit Criteria
10. Test Data Required (table)

Be concrete and specific to the ticket content — do not output generic placeholders. Output valid Markdown only, no preamble.`;

export async function generateTestStrategy({ apiKey, model, ticket }) {
  if (!apiKey) throw new Error('Groq API key is not configured');

  const userPrompt = `Generate a Test Strategy for this Jira ticket:

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
