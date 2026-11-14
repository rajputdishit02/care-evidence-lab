function csv(text, headers) {
  if(typeof text!=='string'||text.length>500000)throw Error('CSV must be text under 500 KB');
  text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
    if(c==='"'){if(field||closed)throw Error('Invalid CSV quoting');quoted=true;continue;}
    if(c===','||c==='\n'||c==='\r'){row.push(field);field='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;rows.push(row);row=[];}continue;}
    if(closed)throw Error('Unexpected text after closing quote');field+=c;
  }
  if(quoted)throw Error('Unclosed CSV quote');if(field||row.length||closed){row.push(field);rows.push(row);}
  if(!rows.length||rows[0].join(',')!==headers.join(','))throw Error(`Expected headers: ${headers.join(',')}`);
  if(rows.length>5001)throw Error('Maximum 5000 records per file');
  return rows.slice(1).map((r,i)=>{if(r.length!==headers.length)throw Error(`Row ${i+2}: incorrect column count`);return Object.fromEntries(headers.map((h,j)=>[h,r[j]]));});
}
function importData(servicesCSV,claimsCSV){
  const services=csv(servicesCSV,['id','participant','date','minutes','rateCents']),claims=csv(claimsCSV,['id','serviceId','amountCents']),ids=new Set();
  const id=v=>{if(!/^[A-Za-z0-9_-]{1,64}$/.test(v))throw Error('IDs must use 1-64 letters, digits, underscores or hyphens');};
  const integer=(v,nullable)=>{if(v===''&&nullable)return null;if(!/^\d+$/.test(v)||!Number.isSafeInteger(Number(v))||Number(v)>10000000)throw Error('Amounts and durations must be integers from 0 to 10000000; blank duration/rate is allowed');return Number(v);};
  for(const s of services){id(s.id);id(s.participant);if(ids.has(s.id))throw Error('Record IDs must be unique across both files');ids.add(s.id);if(!/^\d{4}-\d{2}-\d{2}$/.test(s.date)||!Number.isFinite(Date.parse(s.date))||new Date(s.date).toISOString().slice(0,10)!==s.date)throw Error('Dates must be valid YYYY-MM-DD');s.minutes=integer(s.minutes,true);s.rateCents=integer(s.rateCents,true);}
  for(const c of claims){id(c.id);id(c.serviceId);if(ids.has(c.id))throw Error('Record IDs must be unique across both files');ids.add(c.id);c.amountCents=integer(c.amountCents,false);}
  if(!services.length)throw Error('At least one service is required');return {services,claims};
}
module.exports={csv,importData};
