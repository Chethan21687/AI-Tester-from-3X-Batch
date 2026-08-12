# SCRUM-10 Test Plan Draft

## Overview
- **Issue**: SCRUM-10
- **Title**: 500 Error is seen on Saving the Patient details with firstname and lastname
- **Objective**: Verify that saving patient details with valid `firstname` and `lastname` no longer returns a `500 Internal Server Error`, and that the patient record is saved successfully.
- **Status**: Draft for human review

## Scope
- Positive path for saving patient details with required name fields
- Validation and error handling when required fields are missing or invalid
- Persistence of saved patient data
- User experience when backend error conditions occur

## Preconditions
1. Test environment is available and reachable.
2. User has a valid login and permissions to save patient records.
3. Patient details form is open and the backend services are running.
4. Any required supporting data (e.g. clinic, doctor, patient type) is available if needed.

## Test Cases

### Test Case 1: Save patient details successfully with firstname and lastname
- **ID**: SCRUM-10-TC-01
- **Title**: Verify successful save when firstname and lastname are provided
- **Description**: Enter valid patient details including `firstname` and `lastname`, submit the form, and confirm that no `500` error occurs.
- **Preconditions**: User is authenticated and on the patient details form.
- **Steps**:
  1. Navigate to the patient registration or edit form.
  2. Enter a valid first name.
  3. Enter a valid last name.
  4. Complete any other mandatory fields if required.
  5. Click Save/Submit.
- **Expected Results**:
  - The save action completes without a `500 Internal Server Error`.
  - The UI displays a success confirmation message.
  - The patient record is created or updated in the system.

### Test Case 2: Verify required name validation does not produce 500 error
- **ID**: SCRUM-10-TC-02
- **Title**: Validate missing firstname or lastname is handled with validation feedback
- **Description**: Submit the form with either `firstname` or `lastname` missing and confirm the application returns a validation error rather than a server error.
- **Preconditions**: Patient form is loaded.
- **Steps**:
  1. Leave `firstname` blank and provide a valid `lastname`.
  2. Attempt to save the form.
  3. Reload or reset the form.
  4. Leave `lastname` blank and provide a valid `firstname`.
  5. Attempt to save again.
- **Expected Results**:
  - The system displays an inline validation message for the missing field.
  - No `500 Internal Server Error` is displayed.
  - The record is not saved until required fields are completed.

### Test Case 3: Confirm patient data is persisted correctly after save
- **ID**: SCRUM-10-TC-03
- **Title**: Verify saved patient record persists and displays correctly
- **Description**: After a successful save, confirm the patient record exists and the first name and last name are stored correctly.
- **Preconditions**: A save operation from Test Case 1 completed successfully.
- **Steps**:
  1. Search for the saved patient record in the patient list or search page.
  2. Open the saved patient record.
  3. Verify the `firstname` and `lastname` values.
- **Expected Results**:
  - The patient appears in search results.
  - The saved record displays the correct first and last name.
  - No data corruption or missing information is observed.

### Test Case 4: Verify graceful error handling for backend failures
- **ID**: SCRUM-10-TC-04
- **Title**: Confirm the application handles backend failures without exposing raw server errors
- **Description**: Trigger or observe a backend failure and ensure the frontend shows a user-friendly error message instead of a raw `500` response page.
- **Preconditions**: Backend failure condition can be reproduced or simulated.
- **Steps**:
  1. Submit valid patient details when the backend service is unavailable or forced to fail.
  2. Observe the response displayed to the user.
- **Expected Results**:
  - The application displays a friendly error message.
  - No raw server error page or stack trace is shown.
  - The user is guided to retry or contact support.

## Risks and Assumptions
- Assumes `firstname` and `lastname` are required fields for the patient save workflow.
- Assumes the issue is specifically related to server-side handling of valid patient data.
- Additional required fields or business rules may alter the exact reproduction steps.

## Notes
- Review the full Jira issue description and acceptance criteria for any additional mandatory fields or special conditions.
- Update the test plan after confirming the exact form flow and any related dependencies.
- This draft is ready for human review and should be finalized once the issue details are validated.
