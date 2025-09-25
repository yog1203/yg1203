import * as React from 'react'
import { api } from '../lib/api'
export default function ReaderAssignments(){
  const [rows,setRows]=React.useState([])
  const [types,setTypes]=React.useState([])
  const [dists,setDists]=React.useState([])
  const [stores,setStores]=React.useState([])
  const [form,setForm]=React.useState({ distributor_id:'', store_id:'', reader_type_id:'', mediator_fname:'', mediator_lname:'', reader_fname:'', reader_lname:'', quantity:1, phone:'', assignment_date:'', reader_place:'' })
  const [editingId,setEditingId]=React.useState(null)
  const [err,setErr]=React.useState('')
  async function load(){ const [view,t,ds,ss]=await Promise.all([ api('/api/reader_assignments_view'), api('/api/reader_types'), api('/api/options/distributors'), api('/api/options/stores') ]); setRows(view); setTypes(t); setDists(ds); setStores(ss) }
  React.useEffect(()=>{ load() },[])
  function setField(k,v){ setForm(f=>({...f,[k]:v})) }
  async function save(){ setErr(''); try{ const payload={...form, distributor_id:Number(form.distributor_id), store_id:Number(form.store_id), reader_type_id:Number(form.reader_type_id), quantity:Number(form.quantity||1)}; const path=editingId?`/api/reader_assignments/${editingId}`:'/api/reader_assignments'; const method=editingId?'PUT':'POST'; await api(path,{method,body:payload}); setForm({ distributor_id:'', store_id:'', reader_type_id:'', mediator_fname:'', mediator_lname:'', reader_fname:'', reader_lname:'', quantity:1, phone:'', assignment_date:'', reader_place:'' }); setEditingId(null); await load() }catch(e){ setErr(e.message) } }
  async function del(id){ if(!confirm('Delete this assignment?')) return; await api(`/api/reader_assignments/${id}`,{method:'DELETE'}); await load() }
  function edit(r){ setEditingId(r.id); setForm({ distributor_id:r.distributor_id, store_id:r.store_id, reader_type_id:r.reader_type_id, mediator_fname:r.mediator_fname||'', mediator_lname:r.mediator_lname||'', reader_fname:r.reader_fname||'', reader_lname:r.reader_lname||'', quantity:r.quantity||1, phone:r.phone||'', assignment_date:r.assignment_date||'', reader_place:r.reader_place||'' }) }
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Reader Assignments</h2>
      <div className="card p-4 mb-6">
        <div className="text-sm font-semibold mb-3">Add / Edit Assignment</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Distributor *</span><select className="border rounded-lg px-3 py-2" value={form.distributor_id} onChange={e=>setField('distributor_id',e.target.value)} required>{dists.map(d=><option key={d.id} value={d.id}>{d.id} — {d.fname} {d.lname}</option>)}</select></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Store *</span><select className="border rounded-lg px-3 py-2" value={form.store_id} onChange={e=>setField('store_id',e.target.value)} required>{stores.map(s=><option key={s.id} value={s.id}>{s.id} — {s.book_type} / {s.book_language} / ed {s.edition}</option>)}</select></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Reader Type *</span><select className="border rounded-lg px-3 py-2" value={form.reader_type_id} onChange={e=>setField('reader_type_id',e.target.value)} required>{types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Mediator First</span><input className="border rounded-lg px-3 py-2" value={form.mediator_fname} onChange={e=>setField('mediator_fname',e.target.value)} /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Mediator Last</span><input className="border rounded-lg px-3 py-2" value={form.mediator_lname} onChange={e=>setField('mediator_lname',e.target.value)} /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Reader First *</span><input className="border rounded-lg px-3 py-2" value={form.reader_fname} onChange={e=>setField('reader_fname',e.target.value)} required /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Reader Last</span><input className="border rounded-lg px-3 py-2" value={form.reader_lname} onChange={e=>setField('reader_lname',e.target.value)} /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Quantity *</span><input type="number" className="border rounded-lg px-3 py-2" value={form.quantity} onChange={e=>setField('quantity',e.target.value)} required /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Phone</span><input className="border rounded-lg px-3 py-2" value={form.phone} onChange={e=>setField('phone',e.target.value)} /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Date</span><input type="date" className="border rounded-lg px-3 py-2" value={form.assignment_date} onChange={e=>setField('assignment_date',e.target.value)} /></label>
          <label className="border border-gray-300 rounded px-2 py-1 text-xs w-full"><span>Place</span><input className="border rounded-lg px-3 py-2" value={form.reader_place} onChange={e=>setField('reader_place',e.target.value)} /></label>
        </div>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        <div className="mt-3 flex gap-2">
          <button className="btn" onClick={save}>{editingId?'Update':'Create'}</button>
          <button className="btn !bg-slate-200 !text-slate-800 hover:!bg-slate-300" onClick={()=>{ setForm({ distributor_id:'', store_id:'', reader_type_id:'', mediator_fname:'', mediator_lname:'', reader_fname:'', reader_lname:'', quantity:1, phone:'', assignment_date:'', reader_place:'' }); setEditingId(null) }}>Clear</button>
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50"><tr>
            <th className="text-left p-3">ID</th>
            <th className="text-left p-3">Distributor</th>
            <th className="text-left p-3">Store Item</th>
            <th className="text-left p-3">Reader Type</th>
            <th className="text-left p-3">Reader</th>
            <th className="text-left p-3">Qty</th>
            <th className="text-left p-3">Date</th>
            <th className="text-left p-3">Place</th>
            <th className="text-right p-3">Actions</th>
          </tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t hover:bg-brand-50/40">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.distributor_name} (#{r.distributor_id})</td>
                <td className="p-3">{r.store_item} (#{r.store_id})</td>
                <td className="p-3">{r.reader_type}</td>
                <td className="p-3">{`${r.reader_fname||''} ${r.reader_lname||''}`.trim()}</td>
                <td className="p-3">{r.quantity}</td>
                <td className="p-3">{r.assignment_date}</td>
                <td className="p-3">{r.reader_place||''}</td>
                <td className="p-3 text-right">
                  <button className="btn mr-2" onClick={()=>edit(r)}>Edit</button>
                  <button className="btn !bg-red-500 hover:!bg-red-600" onClick={()=>del(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-4 text-center" colSpan={9}>No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
