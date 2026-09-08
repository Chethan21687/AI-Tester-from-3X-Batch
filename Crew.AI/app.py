"""TestForge AI — Streamlit app powered by the crewAI Test Analyst.

Run from the Crew.AI folder:
    .venv\Scripts\python.exe -m streamlit run app.py
"""
import importlib.util
import io
import re
from pathlib import Path

import pandas as pd
import streamlit as st

_HERE = Path(__file__).resolve().parent

# The crew script's filename contains dots, so import it via importlib.
_spec = importlib.util.spec_from_file_location("qa_crew_module", _HERE / "crewAI.TestAgent_TestAnalysts.py")
qa_crew = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(qa_crew)

SAMPLE_REQUIREMENTS = """E-commerce web application:
- User registration & login (email + password, password reset, session timeout)
- Product catalog with search, filters, and pagination
- Shopping cart (add/remove/update quantities)
- Checkout with payment gateway (success, declined, timeout) and order confirmation
- Order history page
- Admin dashboard to manage products and view orders
- Role-based access: customers vs admins"""

STATUSES = ["Not Run", "Pass", "Fail", "Blocked"]

FIELD_KEYS = {
    "Preconditions": ("Preconditions", "Preconditions / Test Data", "Pre-Conditions"),
    "Steps": ("Steps", "Test Steps"),
    "Expected Result": ("Expected Result", "Expected Results", "Expected Outcome"),
}

EDITOR_KEY = "case_status_table"
STATUS_KEY = "case_statuses"


def parse_markdown_table(markdown_text):
    """Yield each data row of the first markdown table in the AI output as a dict."""
    lines = markdown_text.splitlines()
    headers = None
    for line in lines:
        stripped = line.strip()
        if not (stripped.startswith('|') and stripped.endswith('|') and '|' in stripped[1:]):
            continue
        cells = [c.strip() for c in stripped.strip('|').split('|')]
        if headers is None:
            headers = cells
            continue
        if all(re.fullmatch(r':?-{2,}:?', c.replace(' ', '')) for c in cells):
            continue
        yield dict(zip(headers, cells))


def md_cell_to_lines(cell_text):
    """Split a table cell on <br> and strip markdown emphasis."""
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', cell_text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    return [p.strip() for p in text.replace('<br>', '\n').split('\n') if p.strip()]


def case_field(case, label):
    for key in FIELD_KEYS[label]:
        if case.get(key):
            return case[key]
    return None


def case_id(case, idx):
    return case.get("Test Case ID") or case.get("ID") or f"TC-{idx + 1:02d}"


def case_title(case, idx):
    title = (case.get("Title") or "").strip() or f"Test case {idx + 1}"
    if title.lower().startswith("test case"):
        steps = case_field(case, "Steps")
        if steps:
            first_line = md_cell_to_lines(steps)[0]
            title = (first_line[:90] + "…") if len(first_line) > 90 else first_line
    return title


def build_cases_table(cases):
    statuses = st.session_state.setdefault(STATUS_KEY, {})
    rows = []
    for idx, case in enumerate(cases):
        statuses.setdefault(str(idx), "Not Run")
        rows.append({
            "#": idx + 1,
            "Test Case ID": case_id(case, idx),
            "Title": case_title(case, idx),
            "Preconditions": " | ".join(md_cell_to_lines(case_field(case, "Preconditions") or "")),
            "Steps": " | ".join(md_cell_to_lines(case_field(case, "Steps") or "")),
            "Expected Result": " | ".join(md_cell_to_lines(case_field(case, "Expected Result") or "")),
            "Status": statuses[str(idx)],
        })
    return pd.DataFrame(rows)


def read_uploaded_text(uploaded_file) -> str:
    """Extract plain text from an uploaded .txt/.md/.pdf/.docx file."""
    import io as _io
    name = (uploaded_file.name or "").lower()
    data = uploaded_file.getvalue()

    if name.endswith(".pdf"):
        from pypdf import PdfReader
        reader = PdfReader(_io.BytesIO(data))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if name.endswith(".docx"):
        from docx import Document
        doc = Document(_io.BytesIO(data))
        parts = [p.text for p in doc.paragraphs if p.text.strip()]
        for table in doc.tables:
            for row in table.rows:
                parts.append(" | ".join(c.text.strip() for c in row.cells))
        return "\n".join(parts)

    for enc in ("utf-8", "utf-16", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("latin-1", errors="replace")


st.set_page_config(page_title="TestForge AI", page_icon="🧪", layout="centered")

st.title("🧪 TestForge AI")
st.caption("TestForge AI turns application requirements into ready-to-run test cases — an AI Test Analyst (crewAI + gpt-oss-120b) that writes them for you. Review in a table, mark Pass/Fail/Blocked, and export to Word.")

# ---------------------------------------------------------------- step 1 & 2
st.subheader("1️⃣  Requirements → 2️⃣  Generate")
col_req, col_gen = st.columns([2, 1], gap="large")

with col_req:
    if "loaded_from" in st.session_state:
        st.caption(f"📄 Loaded from **{st.session_state['loaded_from']}** — edit below if needed.")
    requirements = st.text_area(
        "Paste your application requirements, or upload a file below",
        value=SAMPLE_REQUIREMENTS,
        height=170,
        label_visibility="collapsed",
        placeholder="Describe the web application to test… e.g. login flow, search, forms, roles",
        key="req_input",
    )

    def _on_file_uploaded():
        # Callback: runs BEFORE widgets are instantiated, so updating req_input is allowed here.
        uploaded_file = st.session_state.get("req_file")
        st.session_state.pop("loaded_from", None)
        st.session_state.pop("req_read_error", None)
        if uploaded_file is None:
            return
        try:
            text = read_uploaded_text(uploaded_file)
        except Exception as exc:
            st.session_state["req_read_error"] = f"Could not read **{uploaded_file.name}**: {exc}"
            return
        if not text.strip():
            st.session_state["req_read_error"] = f"No readable text found in **{uploaded_file.name}**."
        else:
            st.session_state["req_input"] = text
            st.session_state["loaded_from"] = uploaded_file.name

    st.file_uploader(
        "Or upload a requirements file",
        type=["txt", "md", "pdf", "docx"],
        key="req_file",
        on_change=_on_file_uploaded,
        help="Accepted formats: .txt, .md, .pdf, .docx. The text is loaded into the box above, then the crew generates test cases from it.",
    )
    if st.session_state.get("req_read_error"):
        st.error(st.session_state["req_read_error"])

    def _load_sample():
        st.session_state["req_input"] = SAMPLE_REQUIREMENTS
        st.session_state.pop("loaded_from", None)
        st.session_state.pop("req_read_error", None)

    st.button("Load sample requirements", on_click=_load_sample)

with col_gen:
    st.markdown("**Test cases to create**")
    test_count = st.slider("Number of test cases", min_value=5, max_value=20, value=10, step=5, label_visibility="collapsed")

    if st.button("✨ Generate Test Cases", type="primary", use_container_width=True):
        if not requirements or not requirements.strip():
            st.warning("Please paste some requirements or upload a file first.")
        else:
            try:
                with st.spinner(f"Test Analyst is analyzing requirements and writing {test_count} test cases…"):
                    crew = qa_crew.build_crew(requirements=requirements, verbose=False, count=test_count)
                    result = crew.kickoff()
                md = str(result)
                st.session_state["result_md"] = md
                st.session_state["result_docx"] = io.BytesIO()
                qa_crew.build_docx(md).save(st.session_state["result_docx"])
                st.session_state.pop(EDITOR_KEY, None)  # fresh statuses for a new suite
                st.session_state.pop(STATUS_KEY, None)
                try:
                    qa_crew.save_result_to_docx(md, str(_HERE / "TestForge_Test_Cases.docx"))
                except OSError:
                    st.toast("Could not auto-save a disk copy — the .docx may be open in Word. Use the download button instead.", icon="⚠️")
            except Exception as exc:  # surface API/rate-limit errors in the UI
                st.error(f"Generation failed: {exc}")

# ---------------------------------------------------------------- step 3
st.divider()
st.subheader("3️⃣  Output")
md = st.session_state.get("result_md")

if not md:
    st.info("Paste requirements or upload a file on the left, then click **Generate Test Cases** — the suite will appear here as a table and can be downloaded as a Word doc.")
else:
    cases = list(parse_markdown_table(md))

    if not cases:
        st.markdown(md)
        st.download_button(
            "📄 Download as Word (.docx)",
            data=st.session_state["result_docx"].getvalue(),
            file_name="TestForge_Test_Cases.docx",
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            type="primary",
        )
    else:
        statuses = st.session_state.setdefault(STATUS_KEY, {})
        for idx in range(len(cases)):
            statuses.setdefault(str(idx), "Not Run")
        counts = {s: sum(1 for v in statuses.values() if v == s) for s in STATUSES}

        c1, c2, c3, c4, c5 = st.columns(5)
        c1.metric("Total", len(cases))
        c2.metric("⏳ Not Run", counts["Not Run"])
        c3.metric("✅ Pass", counts["Pass"])
        c4.metric("❌ Fail", counts["Fail"])
        c5.metric("🚫 Blocked", counts["Blocked"])

        b_dl, b_reset = st.columns(2)
        with b_dl:
            st.download_button(
                "📄 Download as Word (.docx)",
                data=st.session_state["result_docx"].getvalue(),
                file_name="TestForge_Test_Cases.docx",
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                type="primary",
                use_container_width=True,
            )
        with b_reset:
            if st.button("↺ Reset statuses", use_container_width=True):
                st.session_state.pop(EDITOR_KEY, None)
                st.session_state[STATUS_KEY] = {str(i): "Not Run" for i in range(len(cases))}
                st.rerun()

        column_config = {
            "#": st.column_config.NumberColumn(width="small"),
            "Test Case ID": st.column_config.TextColumn(width="small"),
            "Status": st.column_config.SelectboxColumn(
                "Status",
                options=STATUSES,
                width="small",
                help="Mark each case: Not Run / Pass / Fail / Blocked",
            ),
            "Title": st.column_config.TextColumn(width="medium"),
            "Preconditions": st.column_config.TextColumn(width="medium"),
            "Steps": st.column_config.TextColumn(width="medium"),
            "Expected Result": st.column_config.TextColumn(width="medium"),
        }

        def _on_table_edit():
            # Sync edits from the editable Status column back into the status dict.
            edited = st.session_state.get(EDITOR_KEY)
            if isinstance(edited, pd.DataFrame) and not edited.empty:
                for _, row in edited.iterrows():
                    case_no = int(row["#"]) - 1
                    st.session_state[STATUS_KEY][str(case_no)] = row["Status"]

        cases_table = build_cases_table(cases)
        st.data_editor(
            cases_table,
            key=EDITOR_KEY,
            hide_index=True,
            use_container_width=True,
            num_rows="fixed",
            column_order=["#", "Test Case ID", "Status", "Title", "Preconditions", "Steps", "Expected Result"],
            on_change=_on_table_edit,
            disabled=[c for c in cases_table.columns if c != "Status"],
            column_config=column_config,
        )

        # Read full details of a chosen case (table cells are compact).
        st.markdown("**Read full details:**")
        detail_idx = st.selectbox(
            "Choose a test case to see its full text",
            options=range(len(cases)),
            format_func=lambda i: f"{case_id(cases[i], i)} — {case_title(cases[i], i)}",
        )
        detail_case = cases[detail_idx]
        for label in FIELD_KEYS:
            cell = case_field(detail_case, label)
            if not cell:
                continue
            lines = md_cell_to_lines(cell)
            st.markdown(f"**{label}:**")
            if len(lines) == 1:
                st.write(lines[0])
            else:
                st.markdown("\n".join(f"- {ln}" for ln in lines))

        with st.expander("View raw AI output (markdown)", expanded=False):
            st.markdown(md)

with st.sidebar:
    st.header("About TestForge AI")
    st.markdown(
        """An **AI Test Analyst** (senior QA agent — 15 yrs, web/mobile/API) built with **crewAI** and run on **Groq gpt-oss-120b**.

It analyzes your requirements and writes a suite of **5–20 test cases** with preconditions, steps, and expected results. Review them in the table, mark execution status inline, then export to Word.

Built with Python · crewAI · Streamlit · python-docx"""
    )
