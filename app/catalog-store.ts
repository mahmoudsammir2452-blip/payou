import {catalogDefaults} from './catalog-defaults';
import {DB} from './admin-auth';
export type CatalogProduct={slug:string;nameAr:string;nameEn:string;descriptionAr:string;descriptionEn:string;price:number|null;durationAr:string;durationEn:string;featuresAr:string[];featuresEn:string[];plans:{id:string;labelAr:string;labelEn:string;price:number|null}[];visible:boolean;version:number};
export async function catalog(){const rows=await DB().prepare('SELECT slug,data,version FROM catalog_overrides').all<{slug:string,data:string,version:string}>();return catalogDefaults.map(p=>{const row=rows.results.find(r=>r.slug===p.slug);return row?{...p,...JSON.parse(row.data),version:Number(row.version)}:p})}
export function validateProduct(value:unknown):CatalogProduct|null{
 if(!value||typeof value!=='object')return null;const p=value as Record<string,unknown>;
 if(!catalogDefaults.some(d=>d.slug===p.slug))return null;
 for(const key of ['nameAr','nameEn','descriptionAr','descriptionEn','durationAr','durationEn'])if(typeof p[key]!=='string'||(p[key] as string).length>(key.startsWith('description')?500:180))return null;
 if(!(p.nameAr as string).trim()||typeof p.visible!=='boolean'||!Number.isInteger(p.version)||Number(p.version)<0)return null;
 const money=(v:unknown)=>v===null||(typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=10000000);
 if(!money(p.price))return null;
 for(const key of ['featuresAr','featuresEn'])if(!Array.isArray(p[key])||(p[key] as unknown[]).length>15||!(p[key] as unknown[]).every(v=>typeof v==='string'&&v.length<=300))return null;
 if(!Array.isArray(p.plans)||p.plans.length>30)return null;
 const ids=new Set();for(const v of p.plans){if(!v||typeof v!=='object')return null;const q=v as Record<string,unknown>;if(typeof q.id!=='string'||!q.id||q.id.length>60||ids.has(q.id)||typeof q.labelAr!=='string'||q.labelAr.length>220||typeof q.labelEn!=='string'||q.labelEn.length>220||!money(q.price))return null;ids.add(q.id)}
 return {slug:String(p.slug),nameAr:String(p.nameAr),nameEn:String(p.nameEn),descriptionAr:String(p.descriptionAr),descriptionEn:String(p.descriptionEn),price:p.price as number|null,durationAr:String(p.durationAr),durationEn:String(p.durationEn),featuresAr:p.featuresAr as string[],featuresEn:p.featuresEn as string[],plans:p.plans as CatalogProduct['plans'],visible:p.visible,version:Number(p.version)};
}
