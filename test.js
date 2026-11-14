const {test}=require('node:test');const assert=require('node:assert/strict');
const {fixture,reconcile,checkExplanation,hash}=require('./engine');
test('seeded discrepancies exactly match labelled ground truth',()=>{const d=fixture();assert.deepEqual(reconcile(d).map(f=>f.id).sort(),d.truth.sort());});
test('independent clean service produces no alert',()=>assert.deepEqual(reconcile({services:[{id:'X',minutes:90,rateCents:4050}],claims:[{id:'Y',serviceId:'X',amountCents:6075}]}),[]));
test('missing duration cannot be interpreted as zero cost',()=>{const f=reconcile({services:[{id:'X',minutes:null,rateCents:6000}],claims:[]})[0];assert.equal(f.expectedCents,null);assert.equal(f.type,'missing_evidence');});
test('evidence checker rejects fabricated citations and amounts',()=>{const f=reconcile(fixture())[0];assert.equal(checkExplanation({refs:['FAKE'],amountsCents:[999999]},f).pass,false);});
test('prose semantics always require review',()=>{const f=reconcile(fixture())[0];assert.equal(checkExplanation({refs:f.refs,amountsCents:[]},f).semanticReviewRequired,true);});
test('record changes alter fingerprint',()=>assert.notEqual(hash({a:1}),hash({a:2})));
