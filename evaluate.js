const {fixture,reconcile,checkExplanation}=require('./engine');
const fs=require('node:fs');
const data=fixture(), actual=reconcile(data), predicted=new Set(actual.map(f=>f.id)), truth=new Set(data.truth);
const tp=[...predicted].filter(id=>truth.has(id)).length;
const report={scope:'Synthetic seeded benchmark; not independent validation or evidence of production safety',services:data.services.length,claims:data.claims.length,expectedFindings:truth.size,detectedFindings:predicted.size,truePositives:tp,falsePositives:predicted.size-tp,falseNegatives:truth.size-tp,precision:tp/predicted.size,recall:tp/truth.size,checks:actual.map(f=>({id:f.id,...checkExplanation({refs:f.refs,amountsCents:[f.claimedCents]},f)})),limitations:['Ground truth and detector authored together; this measures fixture consistency.','Citation checks verify references and allowed amounts, not whether arbitrary prose is supported.','Fictional rates and matching rules; no legal, clinical or billing eligibility judgments.']};
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/evaluation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({...report,checks:`${report.checks.length} structural checks`},null,2));
