// The model selects evidence sentences. Only server-generated text reaches the reviewer.
async function draft(finding, request = fetch) {
  const money = cents => (cents / 100).toFixed(2);
  const facts = [
    finding.explanation,
    finding.expectedCents === null ? 'The expected amount is unknown.' : 'Expected amount: AUD ' + money(finding.expectedCents) + '.',
    'Recorded claim total: AUD ' + money(finding.claimedCents) + '.'
  ];
  const response = await request('http://127.0.0.1:11434/api/generate', {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(60000),
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({model:'llama3.2', stream:false, format:'json', options:{temperature:0},
      prompt:'Arrange the following three facts for a care finance reviewer, most important first. Return only {"order":[0,1,2]} using each fact index exactly once in your chosen order. Facts: '+JSON.stringify(facts)})
  });
  if (!response.ok) throw Error('Local model unavailable. Check that llama3.2 is installed.');
  const output = JSON.parse((await response.json()).response);
  if (!output || Object.keys(output).length !== 1 || !Array.isArray(output.order) ||
      output.order.length !== 3 || new Set(output.order).size !== 3 ||
      !output.order.every(i => Number.isInteger(i) && i >= 0 && i < 3)) {
    throw Error('Model draft withheld: unsupported output.');
  }
  return {text:output.order.map(i=>facts[i]).join(' '), refs:finding.refs};
}
module.exports={draft};
