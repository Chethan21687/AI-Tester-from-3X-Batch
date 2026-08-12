#!/bin/bash

# Example: fetch Jira data using basic auth / API token.
# Replace the values below with your Jira URL, username, and API token.

JIRA_URL="https://chethan21687.atlassian.net"
USERNAME="chethan21687@gmail.com"
API_TOKEN="ATATT3xFfGF0Eq8IwD8yjt112Vy-ETxWfxC7TzOjDBg6yB30JHdncbkdyMh3r9_lALCeqyM9ex1U8pzt7yQUgDwLjMG2v1zAv4LsR3cTRa4Ch6AA4qOGKnlfqNcEiUj64GkOakgxBsuWMftKNGoor2O0eDv2ie6hQrmgnolUEU5nXcO0d3fIjoY=77606861"
ENDPOINT="/rest/api/2/issue/SCRUM-10"

curl -s -u "${USERNAME}:${API_TOKEN}" \
  -H "Accept: application/json" \
  "${JIRA_URL}${ENDPOINT}"

# If you are using username/password instead of API token, use:
# curl -s -u "${USERNAME}:${PASSWORD}" -H "Accept: application/json" "${JIRA_URL}${ENDPOINT}"
