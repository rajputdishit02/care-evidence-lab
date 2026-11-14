# Two-minute walkthrough
Start the server with `npm start` and open http://127.0.0.1:8765. Before recording decisions, import the two files in examples. Select S1. The service records 90 minutes at AUD 60 per hour, which gives AUD 90. Claim C1 records AUD 120. Show both records and the AUD 30 difference. The reason for the difference is unknown.

Select S2. Its duration is blank. Show how the expected amount stays unknown. If Ollama is running locally with llama3.2 installed, select **Draft with local model**. The model orders three verified facts. The server rejects extra text, invented facts and invalid selections. A reviewer can edit the draft and record a decision. Restart the server and reopen the finding to see the decision history.

For the evaluation, run `npm test` and `npm run evaluate`. The original fixture contains 25 seeded discrepancies. Discuss one limitation: exact service IDs are required, so records with inconsistent IDs need separate investigation.

