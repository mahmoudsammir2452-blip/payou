import { env } from 'cloudflare:workers';
import { products } from '../../products';
export async function POST(request:Request){
 const origin=request.headers.get('origin');
 if(!origin||origin!==new URL(request.url).origin)return new Response(null,{status:403});
 if(Number(request.headers.get('content-length')||0)>1024)return new Response(null,{status:413});
 let data;try{const raw=await request.text();if(raw.length>1024)return new Response(null,{status:413});data=JSON.parse(raw)}catch{return new Response(null,{status:400})}
 const {product,event,session}=data||{};
 if(!products.some(x=>x.slug===product)||!['details','order','cart_request','renew','support'].includes(event)||typeof session!=='string'||!/^[a-f0-9-]{36}$/i.test(session))return new Response(null,{status:400});
 const day=new Date().toISOString().slice(0,10);
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(day+session));
 const visit=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 await env.DB!.prepare('INSERT OR IGNORE INTO product_interest (day,product,event,visit) VALUES (?,?,?,?)').bind(day,product,event,visit).run();
 return new Response(null,{status:204,headers:{'Cache-Control':'no-store'}});
}
