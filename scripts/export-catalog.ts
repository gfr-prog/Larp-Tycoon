import {writeFileSync} from 'node:fs';
import {jobs,industries,items,upgrades,employees,achievements} from '../lib/catalog';
const q=(v:unknown)=>typeof v==='number'?String(v):`'${String(v).replaceAll("'","''")}'`;
const insert=(table:string,columns:string[],rows:unknown[][])=>`insert into public.${table} (${columns.join(',')}) values\n${rows.map(r=>'('+r.map(q).join(',')+')').join(',\n')}\non conflict (id) do nothing;\n`;
const sql='-- Generated from lib/catalog.ts. Apply after schema.sql.\n'+[
 insert('jobs',['id','name','category','pay','xp','seconds','required_level','prompt','choices','answer'],jobs.map(j=>[j.id,j.name,j.category,j.pay*100,j.xp,j.seconds,j.level,j.prompt,JSON.stringify(j.choices),j.answer])),
 insert('industries',['id','name','icon','founding_cost','base_revenue','base_costs'],industries.map(i=>[i.id,i.name,i.icon,i.cost*100,i.revenue*100,i.costs*100])),
 insert('items',['id','name','brand','slot','color','price','aura','rarity'],items.map(i=>[i.id,i.name,i.brand,i.slot,i.color,i.price*100,i.aura,i.rarity])),
 insert('upgrades',['id','name','type','price','boost'],upgrades.map(u=>[u.id,u.name,u.type,u.price*100,u.boost])),
 insert('employee_candidates',['id','name','role','skill','salary','hire_cost','boost'],employees.map(e=>[e.id,e.name,e.role,e.skill,e.salary*100,e.hireCost*100,e.boost])),
 insert('achievements',['id','name','description','target'],achievements.map(a=>[a.id,a.name,a.description,a.target]))
].join('\n');
writeFileSync('supabase/seed.sql',sql);
console.log('Catalog seed written: 10 jobs, 4 industries, 30 items, 10 upgrades, 15 employees, 20 achievements.');
