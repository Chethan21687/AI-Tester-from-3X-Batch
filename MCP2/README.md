# VWO Test Cases MCP (MCP2)

A single-file FastMCP server that exposes the local dataset
`vwo_5000_test_cases.csv` through all three MCP primitives, to make the
tools-vs-resources-vs-prompts distinction obvious.

## Primitives

| Kind | Name | URI / signature |
|---|---|---|
| Tool | search | `search_test_cases(query, module=None, limit=20)` |
| Tool | fetch one | `get_test_case(test_id)` |
| Tool | stats | `test_case_stats(group_by)` |
| Resource | schema | `testcases://schema` |
| Resource | all cases | `testcases://all` |
| Resource | by module | `testcases://module/{name}` (templated) |
| Prompt | review | `review_test_case(test_id)` |
| Prompt | suite | `generate_regression_suite(module)` |

## Install

```bash
cd C:\Users\User\Documents\Claude\ClaudeMasterClass\PlaywrightRepo\MCP2
uv venv
uv sync
```

## Run

```bash
uv run python server.py
```

The server loads the CSV once at startup. Override the dataset path with the
`VWO_DATASET_PATH` environment variable if needed.

## MCP Inspector

```bash
uv run npx @modelcontextprotocol/inspector --web
```

Then, in the Inspector UI, connect a **stdio** server with:

- Command: `uv`
- Arguments: `run python server.py`
- Working directory: `C:\Users\User\Documents\Claude\ClaudeMasterClass\PlaywrightRepo\MCP2`

### Verification checklist

- **Tools** — call `get_test_case("TC-001")`, then `search_test_cases(query="login")`,
  then `test_case_stats(group_by="module")`.
- **Resources** — open `testcases://schema`, `testcases://all`, and
  `testcases://module/Authentication`.
- **Prompts** — run `review_test_case("TC-001")` and
  `generate_regression_suite(module="Authentication")`.

## Claude Desktop config snippet

```json
{
  "mcpServers": {
    "vwo-testcases": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "C:/Users/User/Documents/Claude/ClaudeMasterClass/PlaywrightRepo/MCP2",
        "python",
        "server.py"
      ]
    }
  }
}
```
