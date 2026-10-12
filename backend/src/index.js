const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bdA02913";
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const EVM = {
  "ethereum": { id:"1", slug:"ethereum", explorer:"https://etherscan.io", goplus:"1" },
  "base": { id:"8453", slug:"base", explorer:"https://basescan.org", goplus:"8453" },
  "optimism": { id:"10", slug:"optimism", explorer:"https://optimistic.etherscan.io", goplus:"10" },
  "arbitrum": { id:"42161", slug:"arbitrum", explorer:"https://arbiscan.io", goplus:"42161" },
  "bnb": { id:"56", slug:"bsc", explorer:"https://bscscan.com", goplus:"56" },
  "polygon": { id:"137", slug:"polygon", explorer:"https://polygonscan.com", goplus:"137" },
  "avalanche": { id:"43114", slug:"avalanche", explorer:"https://snowtrace.io", goplus:"43114" },
  "linea": { id:"59144", slug:"linea", explorer:"https://lineascan.build", goplus:"59144" },
  "zksync": { id:"324", slug:"zksync", explorer:"https://explorer.zksync.io", goplus:"324" },
  "mantle": { id:"5000", slug:"mantle", explorer:"https://explorer.mantle.xyz", goplus:"5000" },
  "blast": { id:"81457", slug:"blast", explorer:"https://blastscan.io", goplus:"81457" },
  "gnosis": { id:"100", slug:"gnosis", explorer:"https://gnosisscan.io", goplus:"100" },
  "cronos": { id:"25", slug:"cronos", explorer:"https://cronoscan.com", goplus:"25" },
  "fantom": { id:"250", slug:"fantom", explorer:"https://ftmscan.com", goplus:"250" }
};
const json = (data, status=200, headers={}) => new Response(JSON.stringify(data), {status, headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers}});
const bad = (message,status=400) => json({ok:false,error:message},status);
const validEmail = s => typeof s==="string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length<=254;
const validEvm = s => typeof s==="string" && /^0x[a-fA-F0-9]{40}$/.test(s) && !/^0x0{40}$/i.test(s);
const normalNetwork = s => String(s||"").trim().toLowerCase().replace(/[^a-z0-9]/g,"");
const networkKey = s => ({eth:"ethereum",ethereum:"ethereum",base:"base",op:"optimism",optimism:"optimism",arb:"arbitrum",arbitrum:"arbitrum",bnb:"bnb",bsc:"bnb",binancesmartchain:"bnb",polygon:"polygon",matic:"polygon",avalanche:"avalanche",avaxcchain:"avalanche",linea:"linea",zksync:"zksync",mantle:"mantle",blast:"blast",gnosis:"gnosis",xdai:"gnosis",cronos:"cronos",fantom:"fantom",sol:"solana",solana:"solana",sui:"sui",ton:"ton",bitcoin:"bitcoin",btc:"bitcoin"})[normalNetwork(s)] || "";
function cors(env, origin) { const allowed=env.SITE_ORIGIN||"*"; return {"access-control-allow-origin":allowed==="*"? "*":(origin===allowed?origin:allowed),"access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type,authorization","vary":"Origin"}; }
async function providerFetch(url, init={}) { const r=await fetch(url,{...init,signal:AbortSignal.timeout(9000)}); if(!r.ok) throw new Error("Provider HTTP "+r.status); return r.json(); }
async function scanAsset(network, asset) {
  if(typeof asset!=="string" || asset.trim().length<2 || asset.trim().length>128) throw new Error("Enter a token address, mint, or symbol.");
  const key=networkKey(network), q=asset.trim(), isEvm=validEvm(q), findings=[], sources=[], result={ok:true,network:network||"unspecified",asset:q,generatedAt:new Date().toISOString(),coverage:"partial",findings,markets:[],links:[],disclaimer:"Automated indicators only; not an audit or a guarantee. Unknown means no verified result."};
  if(isEvm && EVM[key]) {
    result.links.push({label:"Block explorer",url:EVM[key].explorer+"/address/"+q});
    try {
      const d=await providerFetch("https://api.gopluslabs.io/api/v1/token_security/"+EVM[key].goplus+"?contract_addresses="+encodeURIComponent(q));
      const sec=d?.result?.[q.toLowerCase()] || d?.result?.[q] || (d?.result?Object.values(d.result)[0]:null);
      if(sec) {
        sources.push("GoPlus Token Security");
        const flags=[["is_honeypot","Honeypot indicator",true],["is_mintable","Owner minting",true],["is_blacklisted","Blacklist function",true],["transfer_pausable","Transfer pause capability",true],["hidden_owner","Hidden owner indicator",true],["can_take_back_ownership","Ownership reclaim capability",true],["selfdestruct","Self-destruct capability",true],["owner_change_balance","Owner balance-change capability",true],["is_open_source","Source verification",false],["is_proxy","Proxy contract",false]];
        for(const [k,label,dangerPositive] of flags) {
          if(sec[k]===undefined || sec[k]===null || sec[k]==="") { findings.push({type:"unknown",label,detail:"Provider did not return this field."}); continue; }
          const yes=String(sec[k])==="1" || String(sec[k]).toLowerCase()==="true";
          const isSource=k==="is_open_source";
          findings.push({type:isSource?(yes?"info":"warning"):(dangerPositive&&yes?"warning":"info"),label,detail:isSource?(yes?"Provider reports source verified; this is not proof of safety.":"Provider reports source is not verified."):(yes?"Provider flags this capability. Review the contract and potential impact.":"Provider did not flag this field; this is not proof of safety."),value:String(sec[k])});
        }
        for(const k of ["buy_tax","sell_tax"]) if(sec[k]!==undefined) findings.push({type:"info",label:k==="buy_tax"?"Reported buy tax":"Reported sell tax",detail:"Provider value; interpret using provider documentation.",value:String(sec[k])});
      } else findings.push({type:"unknown",label:"EVM token security",detail:"Provider returned no security record. Unsupported or missing data is not a pass."});
    } catch(e) { findings.push({type:"unknown",label:"EVM security provider unavailable",detail:e.message}); }
  } else if(key==="solana" && !isEvm && q.length>=32 && q.length<=50) {
    result.links.push({label:"Solscan",url:"https://solscan.io/token/"+encodeURIComponent(q)});
    try {
      const d=await providerFetch("https://api.rugcheck.xyz/v1/tokens/"+encodeURIComponent(q)+"/report");
      sources.push("RugCheck (Solana)");
      if(Array.isArray(d?.risks)) for(const risk of d.risks.slice(0,40)) findings.push({type:/danger|critical|high|warn/i.test(String(risk.level||risk.score||""))?"warning":"info",label:String(risk.name||risk.description||"RugCheck risk").slice(0,160),detail:String(risk.description||risk.value||risk.level||"Provider risk record").slice(0,500)});
      findings.push({type:"info",label:"RugCheck summary",detail:"Provider response received. Read the full source report and independently verify each finding.",value:d?.score!==undefined?String(d.score):"Score not returned"});
    } catch(e) { findings.push({type:"unknown",label:"Solana security provider unavailable",detail:e.message+" Check current provider availability and rate limits."}); }
  } else {
    result.links.push({label:"Search market data",url:"https://dexscreener.com/search?q="+encodeURIComponent(q)});
    findings.push({type:"unknown",label:"Chain-native security coverage",detail:"No configured chain-specific security adapter for this asset/network. Market discovery alone cannot establish safety."});
  }
  try {
    const url=isEvm && EVM[key] ? "https://api.dexscreener.com/tokens/v1/"+EVM[key].slug+"/"+encodeURIComponent(q) : "https://api.dexscreener.com/latest/dex/search?q="+encodeURIComponent(q);
    const d=await providerFetch(url);
    const pairs=(Array.isArray(d)?d:(d?.pairs||[])).filter(p=>!isEvm || !EVM[key] || p.chainId===EVM[key].slug).slice(0,12);
    result.markets=pairs.map(p=>({chain:p.chainId||"unknown",dex:p.dexId||"unknown",baseSymbol:p.baseToken?.symbol||"",baseName:p.baseToken?.name||"",baseAddress:p.baseToken?.address||"",quoteSymbol:p.quoteToken?.symbol||"",priceUsd:p.priceUsd||null,liquidityUsd:p.liquidity?.usd??null,volume24h:p.volume?.h24??null,buys24h:p.txns?.h24?.buys??null,sells24h:p.txns?.h24?.sells??null,url:p.url||null}));
    sources.push("DEX Screener");
    if(!result.markets.length) findings.push({type:"unknown",label:"Indexed market data",detail:"No matching market was returned. This does not mean an asset is safe or a scam."});
  } catch(e) { findings.push({type:"unknown",label:"Market data unavailable",detail:e.message}); }
  result.sources=[...new Set(sources)];
  result.coverage=result.sources.length?"partial":"unavailable";
  return result;
}
async function currentBlock(env) {
  const d=await providerFetch(env.BASE_RPC_URL||"https://mainnet.base.org",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_blockNumber",params:[]})});
  if(!d.result) throw new Error("Base RPC did not return block height"); return parseInt(d.result,16);
}
async function verifyPayments(env) {
  const db=env.DB;if(!db||!env.PAYMENT_RECIPIENT) throw new Error("D1 DB and PAYMENT_RECIPIENT must be configured.");
  const recipient=env.PAYMENT_RECIPIENT.toLowerCase();if(!validEvm(recipient)) throw new Error("PAYMENT_RECIPIENT is invalid.");
  const head=await currentBlock(env), safe=head-Number(env.CONFIRMATIONS||12);if(safe<1)return {head,checked:0,paid:0};
  const cursor=await db.prepare("SELECT value FROM settings WHERE key='last_checked_block'").first();
  let from=cursor?Number(cursor.value):Math.max(0,safe-1800);
  if(from>safe) from=safe;
  let checked=0,paid=0;
  while(from<=safe) {
    const to=Math.min(safe,from+Math.min(1999,Number(env.MAX_BLOCK_RANGE||1500)-1));
    const logs=await providerFetch(env.BASE_RPC_URL||"https://mainnet.base.org",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_getLogs",params:[{fromBlock:"0x"+from.toString(16),toBlock:"0x"+to.toString(16),address:USDC,topics:[TRANSFER_TOPIC,null,"0x000000000000000000000000"+recipient.slice(2)]}]})});
    if(logs.error) throw new Error("Base RPC log query failed: "+logs.error.message);
    for(const log of (logs.result||[])) {
      checked++;const sender="0x"+String(log.topics?.[1]||"").slice(-40).toLowerCase();const units=BigInt(log.data||"0x0").toString();const tx=String(log.transactionHash||"").toLowerCase();const block=parseInt(log.blockNumber,16);
      if(!validEvm(sender)||!tx)continue;
      const order=await db.prepare("SELECT * FROM orders WHERE status='pending' AND payer_address=? AND amount_units=? AND created_block<=? AND expires_at>? ORDER BY created_at ASC LIMIT 1").bind(sender,units,block,Date.now()).first();
      if(!order)continue;
      try {
        const upd=await db.prepare("UPDATE orders SET status='paid',tx_hash=?,paid_block=?,updated_at=? WHERE id=? AND status='pending'").bind(tx,block,Date.now(),order.id).run();
        if(upd.meta?.changes) { paid++; await deliverOrder(env,order,tx,block); }
      } catch(e) { console.error("order fulfillment error",order.id,e.message); }
    }
    from=to+1;
  }
  await db.prepare("INSERT INTO settings(key,value) VALUES('last_checked_block',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(safe)).run().catch(async()=>db.prepare("INSERT INTO settings(key,value) VALUES('last_checked_block',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(String(safe)).run());
  return {head,safe,checked,paid};
}
async function summarizeWithAI(env,scan) {
  if(!env.OPENAI_API_KEY)return null;
  const payload={network:scan.network,asset:scan.asset,coverage:scan.coverage,sources:scan.sources,findings:scan.findings,markets:(scan.markets||[]).slice(0,8).map(m=>({chain:m.chain,dex:m.dex,symbol:m.baseSymbol+"/"+m.quoteSymbol,priceUsd:m.priceUsd,liquidityUsd:m.liquidityUsd,volume24h:m.volume24h}))};
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"authorization":"Bearer "+env.OPENAI_API_KEY,"content-type":"application/json"},body:JSON.stringify({model:env.AI_MODEL||"gpt-4.1-mini",input:[{role:"system",content:"Explain crypto risk data cautiously using only supplied JSON. Never claim a token is safe, audited, a scam, or guaranteed. Distinguish reported facts from unknowns. Never invent data, prices, permissions, or conclusions. Give a concise plain-language summary, top concerns, and next checks. State this is not financial advice or an audit."},{role:"user",content:JSON.stringify(payload)}],max_output_tokens:500})});
  if(!response.ok)throw new Error("AI summarizer HTTP "+response.status);
  const data=await response.json();
  const output=(data.output||[]).flatMap(item=>item.content||[]).filter(c=>c.type==="output_text").map(c=>c.text).join("\\n").trim();
  return output?output.slice(0,6000):null;
}
async function deliverOrder(env,order,tx,block) {
  const scan=await scanAsset(order.network,order.asset);
  await env.DB.prepare("INSERT INTO reports(order_id,report_json,created_at) VALUES(?,?,?) ON CONFLICT(order_id) DO UPDATE SET report_json=excluded.report_json,created_at=excluded.created_at").bind(order.id,JSON.stringify(scan),Date.now()).run();
  await env.DB.prepare("UPDATE orders SET status='report_ready',updated_at=? WHERE id=? AND status='paid'").bind(Date.now(),order.id).run();
  if(env.RESEND_API_KEY && env.FROM_EMAIL && order.email) {
    const html="<h1>Token safety brief</h1><p>Network: "+esc(order.network)+"</p><p>Asset: "+esc(order.asset)+"</p><p>Payment verified: "+esc(tx)+" (Base block "+block+")</p><p>Sources: "+esc((scan.sources||[]).join(", ")||"No provider data")+"</p>"+(scan.aiSummary?"<h2>AI-assisted explanation</h2><p>"+esc(scan.aiSummary)+"</p>":"")+"<h2>Findings</h2><ul>"+scan.findings.map(f=>"<li><b>"+esc(f.label)+"</b>: "+esc(f.detail)+(f.value?" ("+esc(f.value)+")":"")+"</li>").join("")+"</ul><h2>Markets</h2><ul>"+scan.markets.map(m=>"<li>"+esc(m.chain+" "+m.baseSymbol+"/"+m.quoteSymbol)+" price "+esc(m.priceUsd||"unknown")+", liquidity "+esc(m.liquidityUsd==null?"unknown":String(m.liquidityUsd))+"</li>").join("")+"</ul><p>This automated brief is not an audit or investment advice. Unknown means unknown.</p>";
    const mail=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"authorization":"Bearer "+env.RESEND_API_KEY,"content-type":"application/json"},body:JSON.stringify({from:env.FROM_EMAIL,to:[order.email],subject:"Your Token Safety Brief · "+order.network,html})});
    if(mail.ok) await env.DB.prepare("UPDATE orders SET status='delivered',updated_at=? WHERE id=?").bind(Date.now(),order.id).run();
    else {console.error("email provider failed",await mail.text());await env.DB.prepare("UPDATE orders SET status='report_ready',updated_at=? WHERE id=?").bind(Date.now(),order.id).run();}
  }
}
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function handle(request,env) {
  const origin=request.headers.get("Origin")||"";
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors(env,origin)});
  const url=new URL(request.url),path=url.pathname.replace(/\/+$/,"")||"/";
  if(env.SITE_ORIGIN && origin && origin!==env.SITE_ORIGIN)return json({ok:false,error:"Origin not allowed"},403,cors(env,origin));
  if(path==="/api/health"&&request.method==="GET")return json({ok:true,service:"BaseGrid Safety API",time:new Date().toISOString(),paymentVerifierConfigured:!!(env.DB&&env.PAYMENT_RECIPIENT),emailConfigured:!!(env.RESEND_API_KEY&&env.FROM_EMAIL),paymentRecipient:env.PAYMENT_RECIPIENT||null,priceUSDC:"1.49",paymentNetwork:"Base Mainnet"},200,cors(env,origin));
  if(path==="/api/scan"&&request.method==="GET"){
    const asset=url.searchParams.get("asset")||"",network=url.searchParams.get("network")||"";
    if(!asset||!network)return json({ok:false,error:"network and asset are required"},400,cors(env,origin));
    try{return json(await scanAsset(network,asset),200,cors(env,origin));}catch(e){return json({ok:false,error:e.message},502,cors(env,origin));}
  }
  if(path==="/api/order"&&request.method==="POST"){
    if(!env.DB||!env.PAYMENT_RECIPIENT)return json({ok:false,error:"Checkout backend is not configured."},503,cors(env,origin));
    let b;try{b=await request.json()}catch{return json({ok:false,error:"Invalid JSON."},400,cors(env,origin))}
    const network=String(b.network||"").trim().slice(0,80),asset=String(b.asset||"").trim(),payer=String(b.payerAddress||"").toLowerCase(),email=String(b.email||"").trim();
    if(!network||!asset||asset.length>128||!validEvm(payer)||!validEmail(email))return json({ok:false,error:"Provide network, token address/mint/ticker, valid Base payer address, and delivery email."},400,cors(env,origin));
    const active=await env.DB.prepare("SELECT id FROM orders WHERE payer_address=? AND status='pending' AND expires_at>? LIMIT 1").bind(payer,Date.now()).first();
    if(active)return json({ok:false,error:"You already have an unpaid order for this wallet. Finish it or wait 30 minutes before creating another."},409,cors(env,origin));
    const id=crypto.randomUUID(),now=Date.now(),expires=now+30*60*1000;
    const block=await currentBlock(env);
    const inserted=await env.DB.prepare("INSERT INTO orders(id,network,asset,payer_address,email,amount_units,amount_usdc,status,created_at,updated_at,expires_at,created_block) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,network,asset,payer,email,"1490000","1.49","pending",now,now,expires,block).run();
    return json({ok:true,id,network,asset,amountUSDC:"1.49",token:USDC,recipient:env.PAYMENT_RECIPIENT,chainId:8453,createdBlock:block,expiresAt:expires,status:"pending"},201,cors(env,origin));
  }
  const reportMatch=path.match(/^\/api\/order\/([0-9a-f-]{36})\/report$/i);
  if(reportMatch&&request.method==="GET"){
    if(!env.DB)return json({ok:false,error:"Database not configured"},503,cors(env,origin));
    const row=await env.DB.prepare("SELECT o.status,r.report_json FROM orders o LEFT JOIN reports r ON r.order_id=o.id WHERE o.id=?").bind(reportMatch[1]).first();
    if(!row)return json({ok:false,error:"Order not found"},404,cors(env,origin));
    if(!row.report_json)return json({ok:false,status:row.status,error:"Report is not ready yet."},202,cors(env,origin));
    return json({ok:true,status:row.status,report:JSON.parse(row.report_json)},200,cors(env,origin));
  }
  const statusMatch=path.match(/^\/api\/order\/([0-9a-f-]{36})$/i);
  if(statusMatch&&request.method==="GET"){
    if(!env.DB)return json({ok:false,error:"Database not configured"},503,cors(env,origin));
    const row=await env.DB.prepare("SELECT id,network,asset,amount_usdc,status,tx_hash,created_at,expires_at,updated_at FROM orders WHERE id=?").bind(statusMatch[1]).first();
    if(!row)return json({ok:false,error:"Order not found"},404,cors(env,origin));
    return json({ok:true,order:row},200,cors(env,origin));
  }
  if(path==="/api/admin/verify"&&request.method==="POST"){
    const auth=request.headers.get("authorization")||"";
    if(!env.ADMIN_SECRET||auth!=="Bearer "+env.ADMIN_SECRET)return json({ok:false,error:"Unauthorized"},401,cors(env,origin));
    try{return json({ok:true,...await verifyPayments(env)},200,cors(env,origin))}catch(e){return json({ok:false,error:e.message},502,cors(env,origin))}
  }
  return json({ok:false,error:"Not found"},404,cors(env,origin));
}
export default {fetch:handle,async scheduled(_event,env,ctx){ctx.waitUntil(verifyPayments(env).catch(e=>console.error("scheduled payment verifier failed",e.message)));}};
