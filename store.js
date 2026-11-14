const fs=require('node:fs'),path=require('node:path');const {fixture,reconcile,hash}=require('./engine');
function openStore(filename){
  let saved=fs.existsSync(filename)?JSON.parse(fs.readFileSync(filename,'utf8')):{data:fixture(),events:[]};
  let previous=null;for(let i=0;i<saved.events.length;i++){const {hash:digest,...event}=saved.events[i];if(event.sequence!==i+1||event.previousHash!==previous||hash(event)!==digest||event.datasetHash!==hash(saved.data))throw Error('Saved review history failed integrity check');previous=digest;}
  function persist(next){fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename+'.tmp',JSON.stringify(next,null,2),{mode:0o600});fs.renameSync(filename+'.tmp',filename);saved=next;}
  return {
    snapshot(){const findings=reconcile(saved.data);for(const event of saved.events){const f=findings.find(f=>f.id===event.id);if(f)f.status=event.action;}return {data:saved.data,findings,events:saved.events,datasetHash:hash(saved.data)};},
    import(data){if(saved.events.length)throw Error('This dataset has decisions. Export them and use a different CARE_LAB_STORE path for a new dataset.');persist({data,events:[]});},
    review(input){const finding=this.snapshot().findings.find(f=>f.id===input.id);if(!finding||!['approved','edited','rejected'].includes(input.action)||typeof input.reviewer!=='string'||!input.reviewer.trim()||input.reviewer.length>100||typeof input.note!=='string'||input.note.length>1000)throw Error('Invalid review');if(input.action==='edited'&&!input.note.trim())throw Error('Describe the edit');const event={sequence:saved.events.length+1,id:finding.id,action:input.action,reviewer:input.reviewer.trim(),note:input.note,time:new Date().toISOString(),datasetHash:hash(saved.data),previousHash:saved.events.at(-1)?.hash||null};event.hash=hash(event);persist({data:saved.data,events:[...saved.events,event]});return event;}
  };
}
module.exports={openStore};
