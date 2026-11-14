# Care Evidence Lab

Independent portfolio prototype demonstrating evidence-linked reconciliation and human review for fictional care-provider records. Not affiliated with or endorsed by Amalthea Health. Not for real patient data, clinical decisions, compliance certification or production billing.

## Run

Install Node.js 20 or later. No dependencies or API key are required.

```sh
npm test
npm run evaluate
npm start
```

Open http://127.0.0.1:8765. The server binds only to loopback. On Windows, if PowerShell blocks npm.ps1, use npm.cmd instead.

## Demo in two minutes

1. Open an amount mismatch and inspect the two source records.
2. Open missing evidence: the expected amount is unknown, never invented.
3. Enter a demo reviewer name and record a decision.
4. Export the session, then inspect reports/evaluation.json.

## Scope

120 fictional services and seeded examples of mismatched amounts, duplicate claims, unclaimed services, missing evidence and an orphan claim. All rates are fictional. Matching uses exact service IDs, intentionally avoiding uncertain entity resolution. Amounts use integer cents; duration-based rates round to the nearest cent.

## Optional local AI drafts

Install Ollama, run `ollama pull llama3.2`, and start Ollama locally. Select a finding and choose **Draft with local model**. The model orders verified sentences. The server validates its selection and attaches source references. A human reviews the draft before saving. The default workflow runs without a model or API key.

See [the walkthrough](DEMO.md).

## Honest security boundaries

Local single-user demonstration with no authentication or tenant isolation. Reviewer identity is self-declared. Decisions persist in local-data/session.json (excluded from Git), using write-then-rename saves. Hash-linked events are verified at startup and bound to the dataset, but an operator could rewrite the full chain. No claim of immutable audit storage or ISO/SOC certification. POST origin checks limit browser cross-origin writes, but this is not a production security boundary. Do not expose the server to a network or upload real personal information. Run only one server process per store file.

## CSV import and saved reviews

Use the dashboard to upload examples/services.csv and examples/claims.csv together. Headers and their order must match the examples. IDs must be unique across both files; participant identifiers should be fictional codes. Durations are whole minutes and amounts/rates are integer cents. Blank duration or rate remains unknown and generates a missing-evidence finding. Invalid dates, negative numbers, duplicate IDs and malformed CSV are rejected before replacing the dataset. Each file is limited to 500 KB and 5000 records.

Imports replace the current dataset only before reviews exist. After recording decisions, export the session and start a separate store for a new dataset. In PowerShell:

```powershell
$env:CARE_LAB_STORE = 'local-data/another-demo.json'
node server.js
```

The edit decision stores the reviewer's proposed text as a decision note while retaining the original finding. Approving a finding does not approve or submit a claim. Saved history is local to your computer; GitHub contains code and synthetic examples only.

## Validation

Run tests and evaluation locally. The seeded benchmark shares authorship with the detector and is not independent validation. Tests include an additional clean fractional-rate case, missing evidence, citation fabrication and numeric fabrication. Report benchmark scores as synthetic only.

## Why this project

Amalthea's public materials emphasise human approval, evidence provenance and governed AI. This project demonstrates relevant engineering skills without claiming to extend their software or identify a gap in their roadmap.

Research references (reviewed 14 November 2026):
- https://www.linkedin.com/in/jake-kiran/
- https://www.linkedin.com/company/amalthea-health/about/
- https://amaltheahealth.com/care/platform/
- https://amaltheahealth.com/clinical/

## Next development milestones

- Independently authored edge-case benchmark and external CSV schema validation.
- Authentication and role separation before shared use; persistence is implemented locally.
- Evaluated AI explanations with claim-level evidence labels; no automatic approvals.
- Provider interviews to validate workflow and measure actual review effort.
