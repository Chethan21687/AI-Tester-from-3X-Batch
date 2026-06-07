function extractText(node, lines = []) {
  if (!node) return lines;
  if (node.type === 'text') {
    lines.push(node.text);
  } else if (node.type === 'hardBreak') {
    lines.push('\n');
  } else if (node.type === 'rule') {
    lines.push('\n---\n');
  }
  if (node.content) {
    for (const child of node.content) extractText(child, lines);
    if (node.type === 'paragraph' || node.type === 'heading') lines.push('\n');
  }
  return lines;
}

function adfToText(adf) {
  if (!adf || !adf.content) return '';
  const lines = [];
  for (const block of adf.content) extractText(block, lines);
  return lines.join('').replace(/\n{3,}/g, '\n\n').trim();
}

export async function fetchJiraIssue({ baseUrl, email, token, ticketId }) {
  if (!baseUrl || !email || !token || !ticketId) {
    throw new Error('Missing Jira configuration: baseUrl, email, token and ticketId are all required');
  }
  const url = `${baseUrl.replace(/\/+$/, '')}/rest/api/3/issue/${encodeURIComponent(ticketId)}`;
  const auth = Buffer.from(`${email}:${token}`).toString('base64');

  const res = await fetch(url, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: 'application/json'
    }
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Jira request failed (${res.status} ${res.statusText}): ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const fields = data.fields || {};

  return {
    key: data.key,
    summary: fields.summary || '',
    description: adfToText(fields.description),
    issueType: fields.issuetype?.name || '',
    priority: fields.priority?.name || '',
    status: fields.status?.name || '',
    epicKey: fields.parent?.key || '',
    epicSummary: fields.parent?.fields?.summary || '',
    reporter: fields.reporter?.displayName || '',
    assignee: fields.assignee?.displayName || 'Unassigned',
    project: fields.project?.name || ''
  };
}
