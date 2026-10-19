import {env} from 'cloudflare:workers';
export const DB=()=>env.DB!;
export const settings=()=>env as unknown as {PAYOU_ADMIN_PEPPER?:string;PAYOU_ADMIN_SETUP_HASH?:string};
export const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
export const sha=async(s:string)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
export const equal=(a:string,b:string)=>{let v=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)v|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return v===0};
export async function passwordHash(password:string,salt:string){
 const pepper=settings().PAYOU_ADMIN_PEPPER;if(!pepper)throw new Error('Admin authentication is not configured');
 const hmac=await crypto.subtle.importKey('raw',new TextEncoder().encode(pepper),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const input=await crypto.subtle.sign('HMAC',hmac,new TextEncoder().encode(password));
 const key=await crypto.subtle.importKey('raw',input,'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function authenticated(request:Request){const token=request.headers.get('cookie')?.match(/(?:^|;\s*)__Host-payou_admin=([a-f0-9]{64})(?:;|$)/)?.[1];if(!token)return false;const row=await DB().prepare('SELECT expires FROM admin_sessions WHERE token=? AND expires>?').bind(await sha(token),String(Date.now())).first();return !!row}
export async function limited(request:Request){const bucket=Math.floor(Date.now()/900000);const ip=request.headers.get('CF-Connecting-IP')||'unknown';const key=await sha(settings().PAYOU_ADMIN_PEPPER+ip+bucket);const row=await DB().prepare("INSERT INTO admin_limits(key,count) VALUES (?, '1') ON CONFLICT(key) DO UPDATE SET count=CAST(CAST(count AS INTEGER)+1 AS TEXT) RETURNING count").bind(key).first<{count:string}>();return Number(row?.count)>10}
export async function newSession(){const token=random();await DB().prepare('DELETE FROM admin_sessions WHERE expires<?').bind(String(Date.now())).run();await DB().prepare('INSERT INTO admin_sessions(token,expires) VALUES (?,?)').bind(await sha(token),String(Date.now()+7*86400000)).run();return '__Host-payou_admin='+token+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800'}
export const json=(data:unknown,status=200,headers:Record<string,string>={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}});
