const {test}=require('node:test');
const assert=require('node:assert/strict');
const {draft}=require('./draft');
const finding={explanation:'No matching service.',expectedCents:null,claimedCents:1200,refs:['C1']};
const reply=value=>async()=>({ok:true,json:async()=>({response:JSON.stringify(value)})});
test('local draft uses verified facts in selected order and preserves citations',async()=>{
 const result=await draft(finding,reply({order:[1,2,0]}));
 assert.equal(result.text,'The expected amount is unknown. Recorded claim total: AUD 12.00. No matching service.');
 assert.deepEqual(result.refs,['C1']);
});
test('fabricated prose or invalid selections are withheld',async()=>{
 for(const value of [{order:[0,1,2],cause:'fraud'},{order:[2,2,1]},{order:[3,1,0]},{}])
   await assert.rejects(draft(finding,reply(value)));
});
