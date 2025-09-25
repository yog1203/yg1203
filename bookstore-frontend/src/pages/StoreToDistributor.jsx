import * as React from 'react'
import { api } from '../lib/api'
const BOOK_TYPES=['BhaktiChaitanya-I','BhaktiChaitanya-II','BhaktiChaitanya-III']
const LANGS=['Marathi','Hindi','English']
const LOCS=['Mumbai','Pune']
export default function StoreToDistributor(){
  const [rows,setRows]=React.useState([])
  const [dists,setDists]=React.useState([])
  const [form,setForm]=React.useState({ distributor_id:'', book_type:'', book_language:'', edition:'', quantity:1, location:'', distribution_date:'' })
  const [editingId,setEditingId]=React.useState(null)
  const [err,setErr]=React.useState('')
  async function load(){ const [list,ds]=await Promise.all([ api('/api/storetodistributor'), api('/api/options/distributors') ]); setRows(list); setDists(ds) }
  React.useEffect(()=>{ load() },[])
  function getDistName(id){ const d=dists.find(x=>String(x.id)===String(id)); return d?`${d.fname} ${d.lname}`:`#${id}` }
  function edit(r){ setEditingId(r.id); setForm({ distributor_id: String(r.distributor_id||''), book_type: r.book_type||'', book_language: r.book_language||'', edition: String(r.edition||''), quantity: String(r.quantity||1), location: r.location||'', distribution_date: r.distribution_date? String(r.distribution_date).substring(0,10):'' }) }
  function setField(k,v){ setForm(f=>({...f,[k]:v})) }
  async function save(){ setErr(''); try{ const payload={...form, distributor_id:Number(form.distributor_id), edition:Number(form.edition), quantity:Number(form.quantity||1)}; const path=editingId?`/api/storetodistributor/${editingId}`:'/api/storetodistributor'; const method=editingId?'PUT':'POST'; await api(path,{method,body:payload}); setForm({ distributor_id:'', book_type:'', book_language:'', edition:'', quantity:1, location:'', distribution_date:'' }); setEditingId(null); await load() }catch(e){ setErr(e.message) } }
  async function del(id){ if(!confirm('Delete this record?')) return; await api(`/api/storetodistributor/${id}`,{method:'DELETE'}); await load() }
  function edit(r){ setEditingId(r.id); setForm({...r}) }
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Store → Distributor</h2>
      <div className="card p-4 mb-6">
        <div className="text-sm font-semibold mb-3">Add / Edit Distribution</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm flex flex-col gap-1"><span>Distributor *</span><select className="border rounded-lg px-3 py-2" value={form.distributor_id} onChange={e=>setField('distributor_id',e.target.value)} required>{dists.map(d=><option key={d.id} value={d.id}>{d.id} — {d.fname} {d.lname}</option>)}</select></label>
          <label className="text-sm flex flex-col gap-1"><span>Book Type *</span><select className="border rounded-lg px-3 py-2" value={form.book_type} onChange={e=>setField('book_type',e.target.value)} required>{BOOK_TYPES.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          <label className="text-sm flex flex-col gap-1"><span>Language *</span><select className="border rounded-lg px-3 py-2" value={form.book_language} onChange={e=>setField('book_language',e.target.value)} required>{LANGS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          <label className="text-sm flex flex-col gap-1"><span>Edition *</span><input type="number" className="border rounded-lg px-3 py-2" value={form.edition} onChange={e=>setField('edition',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Quantity *</span><input type="number" className="border rounded-lg px-3 py-2" value={form.quantity} onChange={e=>setField('quantity',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Location *</span><select className="border rounded-lg px-3 py-2" value={form.location} onChange={e=>setField('location',e.target.value)} required>{LOCS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          <label className="text-sm flex flex-col gap-1"><span>Distribution Date</span><input type="date" className="border rounded-lg px-3 py-2" value={form.distribution_date} onChange={e=>setField('distribution_date',e.target.value)} /></label>
        </div>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        <div className="mt-3 flex gap-2">
          <button className="btn" onClick={save}>{editingId?'Update':'Create'}</button>
          <button className="btn !bg-slate-200 !text-slate-800 hover:!bg-slate-300" onClick={()=>{ setForm({ distributor_id:'', book_type:'', book_language:'', edition:'', quantity:1, location:'', distribution_date:'' }); setEditingId(null) }}>Clear</button>
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50">
            <tr>
              <th className="text-left p-3">ID</th><th className="text-left p-3">Distributor</th><th className="text-left p-3">Book Type</th>
              <th className="text-left p-3">Language</th><th className="text-left p-3">Edition</th><th className="text-left p-3">Qty</th>
              <th className="text-left p-3">Location</th><th className="text-left p-3">Date</th><th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t hover:bg-brand-50/40">
                <td className="p-3">{r.id}</td><td className="p-3">{getDistName(r.distributor_id)}</td><td className="p-3">{r.book_type}</td>
                <td className="p-3">{r.book_language}</td><td className="p-3">{r.edition}</td><td className="p-3">{r.quantity}</td>
                <td className="p-3">{r.location}</td><td className="p-3">{r.distribution_date}</td>
                <td className="p-3 text-right"><button className="btn mr-2" onClick={()=>edit(r)}>Edit</button><button className="btn !bg-red-500 hover:!bg-red-600" onClick={()=>del(r.id)}>Delete</button>
                  <button className="btn ml-2" onClick={()=>edit(r)}>Edit</button></td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-4 text-center" colSpan={9}>No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
