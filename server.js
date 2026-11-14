const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {fixture,reconcile,hash}=require('./engine');
const data=fixture(),findings=reconcile(data),events=[];
const port=Number(process.env.PORT||8765);
const server=http.createServer(async(req,res)=>{
  const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(req.method==='GET'&&req.url==='/api/data') return send(200,{data,findings,events,datasetHash:hash(data)});
  if(req.method==='POST'&&req.url==='/api/review') {
    if(req.headers.origin!==`http://127.0.0.1:${port}`&&req.headers.origin!==`http://localhost:${port}`) return send(403,{error:'Origin rejected'});
    try {let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)return send(413,{error:'Too large'});}
      const input=JSON.parse(raw),finding=findings.find(f=>f.id===input.id);
      if(!finding||!['approved','rejected','edited'].includes(input.action)||typeof input.reviewer!=='string'||!input.reviewer.trim()||input.reviewer.length>100||typeof input.note!=='string'||input.note.length>1000) return send(400,{error:'Invalid review'});
      if(input.action==='edited'&&!input.note.trim())return send(400,{error:'Describe the edit'});
      const event={sequence:events.length+1,id:finding.id,action:input.action,reviewer:input.reviewer.trim(),note:input.note,time:new Date().toISOString(),previousHash:events.at(-1)?.hash||null};event.hash=hash(event);events.push(event);finding.status=input.action;return send(200,event);
    }catch{return send(400,{error:'Invalid request'});}
  }
  if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'index.html')));}
  send(404,{error:'Not found'});
});
server.listen(port,'127.0.0.1',()=>console.log(`Care Evidence Lab: http://127.0.0.1:${port}`));
