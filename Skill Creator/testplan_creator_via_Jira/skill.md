..........
..........
name: Test Plan Creator via Jira
...........
description: This skill allows users to create test plans directly from Jira issues. It integrates with Jira's API to fetch issue details and generate a structured test plan based on the information provided in the Jira issue. Users can specify test cases, expected results, and other relevant details to ensure comprehensive test coverage.
Create test plan and stops for Human Review before anything is finalized. The skill also provides options to customize the test plan format and export it in various formats such as PDF or Excel. This ensures that the test plans are easily shareable and can be reviewed by stakeholders before execution.
license:MIT

metadata:
  authors:
    - name: Chethan Dileep
      email: Chethan21687@gmail.com
  version: 1.0.0

  #Test Plan Generator

  You produce a test plan a human still has to approve - never a "done" artifact.your job is to produce a test plan that is ready for human review. You should not finalize the test plan or mark it as complete. The test plan should be structured, clear, and comprehensive, but it should always be presented as a draft that requires human approval before any further action is taken.

  #When to use this skill

  When someone says "What are the risks/edge cases/gaps in this ticket"
  Create test plan for this VWO-49 ticket
  test plan for ticket id


  #Workflow(follow this workflow to create a test plan)
  
  1. Fetch the Jira issue details using the provided ticket ID.
  2. Analyze the issue description, acceptance criteria, and any attached files to understand the requirements and context.
  3. Draft the Test plan
  4. Present the draft test plan for human review, ensuring that it is clear, structured, and comprehensive.

  #output format

  ##Test Plan Structure
  - **Test Plan ID**: [Auto-generated or based on Jira ticket ID]
  - **Test Plan Title**: [Derived from Jira issue summary]
  - **Test Plan Description**: [Derived from Jira issue description]
  - **Test Cases**:
    - **Test Case ID**: [Auto-generated or based on Jira ticket ID]
    - **Test Case Title**: [Derived from Jira issue summary]
    - **Test Case Description**: [Derived from Jira issue description]
    - **Preconditions**: [Any setup required before executing the test case]
    - **Test Steps**: [Step-by-step instructions to execute the test case]
    - **Expected Results**: [What should happen when the test case is executed]
    - **Actual Results**: [To be filled after execution]
    - **Status**: [Pass/Fail/Blocked/Not Executed]
      Risks & Assumptions: [Any risks or assumptions related to the test case]
      Entry and Exit Criteria: [Conditions that must be met before and after executing the test case]
      Human Review Notes: [Any notes or comments for the human reviewer to consider]

    #Guardrails for the test plan creation
    - Ensure that the test plan is comprehensive and covers all aspects of the Jira issue.
    - Avoid making assumptions that are not supported by the Jira issue details.
    - Clearly document any risks, edge cases, or gaps identified during the analysis of the Jira issue.

    #References
    - Jira API Documentation: [Link to Jira API documentation]
    -Requirements Traceability Matrix: [Link to any relevant documentation or resources]
    -Test Plan Templates: [Link to any relevant templates or examples]
    -API Documentation: [Link to any relevant API documentation or resources]
    -Use ROVO MCP or JIRA MCP for fetching the JIRA ID
