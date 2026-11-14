const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {openStore}=require('./store');const {importData}=require('./import');
function createApp(store){return http.createServer(async(req,res)=>{
  const send=(code,value)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
  if(req.method==='GET'&&req.url==='/api/data') return send(200,store.snapshot());
  if(req.method==='POST'&&['/api/review','/api/import'].includes(req.url)) {
    if(![`http://127.0.0.1:${req.socket.localPort}`,`http://localhost:${req.socket.localPort}`].includes(req.headers.origin)) return send(403,{error:'Origin rejected'});
    try {let raw='',size=0;for await(const chunk of req){size+=chunk.length;if(size>1100000)return send(413,{error:'Request exceeds 1.1 MB'});raw+=chunk;}
      const input=JSON.parse(raw);
      if(req.url==='/api/import'){store.import(importData(input.servicesCSV,input.claimsCSV));return send(200,{ok:true});}
      return send(200,store.review(input));
    }catch(e){return send(400,{error:e.message});}
  }
  if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(fs.readFileSync(path.join(__dirname,'index.html')));}
  send(404,{error:'Not found'});
});}
if(require.main===module){const port=Number(process.env.PORT||8765);createApp(openStore(process.env.CARE_LAB_STORE||path.join(__dirname,'local-data','session.json'))).listen(port,'127.0.0.1',()=>console.log(`Care Evidence Lab: http://127.0.0.1:${port}`));}
module.exports={createApp};
