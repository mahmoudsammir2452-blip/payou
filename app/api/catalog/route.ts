import {catalog} from '../../catalog-store';
export async function GET(){return new Response(JSON.stringify({products:await catalog()}),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
