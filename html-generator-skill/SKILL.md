---
name: html-generator
description: >
  Generates a simple, well-structured HTML file and saves it with a random 8-character
  hex hash as the filename (e.g. a3f9b2c1.html) in the current working directory.
  Use this skill whenever the user asks to "generate an HTML file", "create an HTML page",
  "make an HTML output", "save HTML to a file", or wants a standalone HTML document
  written to disk — even if they don't specify a filename.
---

## What this skill does

Generate a complete, valid HTML file and write it to disk. The filename must always be
a randomly generated 8-character hex hash (e.g. `3f9a2c1b.html`) — never a fixed name
like `output.html`. This avoids overwriting previous outputs and makes each file unique.

## How to generate the filename

Use the platform's available tooling to produce a random 8-char lowercase hex string:

**Python / Bash:**
```python
import secrets
filename = secrets.token_hex(4) + ".html"  # e.g. "a3f9b2c1.html"
```

**PowerShell:**
```powershell
$hash = -join ((1..8) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
$filename = "$hash.html"
```

Generate the hash at runtime — don't hardcode it.

## HTML structure

Produce a complete HTML5 document. Tailor the content to what the user asked for,
but always include:

- `<!DOCTYPE html>` declaration
- `<html lang="en">` with `<head>` and `<body>`
- A descriptive `<title>`
- At least minimal inline CSS so the page looks presentable when opened in a browser
- Semantic, readable markup

If the user didn't specify content, generate a clean placeholder page with a heading,
a short paragraph, and today's date.

## Output

1. Write the HTML file to the current working directory (or the path the user specified)
2. Tell the user the exact filename and full path so they can open it immediately
3. Optionally show a short preview of the HTML structure in the conversation

## Example

User: "generate an html file with a table of my top 5 fruits"

You: generate `4b9f1e2a.html` containing a styled HTML table, write it to disk,
tell the user "Saved as `4b9f1e2a.html` in your current directory."
