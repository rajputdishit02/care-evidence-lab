'use strict';
const crypto = require('node:crypto');
function fixture() {
  const services=[], claims=[], truth=[];
  for(let i=1;i<=120;i++) {
    const id=`S${String(i).padStart(3,'0')}`;
    services.push({id,participant:`DEMO-${Math.ceil(i/4)}`,date:'2026-11-01',minutes:60,rateCents:6000});
    claims.push({id:`C${i}`,serviceId:id,amountCents:6000});
    if(i%20===0) { claims.at(-1).amountCents=9000; truth.push(`${id}:amount_mismatch`); }
    if(i%20===1) { services.at(-1).minutes=null; truth.push(`${id}:missing_evidence`); }
    if(i%20===2) { claims.push({id:`C${i}-DUP`,serviceId:id,amountCents:6000}); truth.push(`${id}:duplicate_claim`); }
    if(i%20===3) { claims.pop(); truth.push(`${id}:unclaimed_service`); }
  }
  claims.push({id:'C-ORPHAN',serviceId:'S999',amountCents:6000});truth.push('S999:orphan_claim');
  return {services,claims,truth};
}
function reconcile(data) {
  const findings=[];
  const add=(id,type,refs,expectedCents,claimedCents,explanation)=>findings.push({id:`${id}:${type}`,serviceId:id,type,refs,expectedCents,claimedCents,explanation,status:'pending'});
  for(const service of data.services) {
    const lines=data.claims.filter(c=>c.serviceId===service.id);
    const refs=[service.id,...lines.map(c=>c.id)];
    const amount=lines.reduce((sum,c)=>sum+c.amountCents,0);
    if(!Number.isInteger(service.minutes)||service.minutes<0||!Number.isInteger(service.rateCents)||service.rateCents<0) {
      add(service.id,'missing_evidence',refs,null,amount,'Duration or rate evidence is missing or invalid. A reviewer must resolve this before an expected amount can be calculated.');continue;
    }
    const expected=Math.round(service.minutes*service.rateCents/60);
    if(lines.length>1) add(service.id,'duplicate_claim',refs,expected,amount,'Multiple claim lines reference the same service. Review whether this is a duplicate; no recovery is assumed.');
    else if(!lines.length) add(service.id,'unclaimed_service',refs,expected,0,'No claim line matches this service. This is a review candidate, not a determination of claim eligibility.');
    else if(amount!==expected) add(service.id,'amount_mismatch',refs,expected,amount,'The claimed amount differs from the duration multiplied by the fictional hourly rate. The records do not establish why.');
  }
  const ids=new Set(data.services.map(s=>s.id));
  for(const line of data.claims) if(!ids.has(line.serviceId)) add(line.serviceId,'orphan_claim',[line.id],null,line.amountCents,'A claim has no matching service record. Supporting evidence is required.');
  return findings;
}
function checkExplanation(draft,finding) {
  // Structural checks only: these do not prove semantic entailment.
  const allowed=new Set(finding.refs);
  const unknown=draft.refs.filter(r=>!allowed.has(r));
  const missing=finding.refs.filter(r=>!draft.refs.includes(r));
  const unsupportedNumbers=draft.amountsCents.filter(n=>![finding.expectedCents,finding.claimedCents].includes(n));
  return {pass:!unknown.length&&!missing.length&&!unsupportedNumbers.length,unknown,missing,unsupportedNumbers,semanticReviewRequired:true};
}
function hash(value) {return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');}
module.exports={fixture,reconcile,checkExplanation,hash};
