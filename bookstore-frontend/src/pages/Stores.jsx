import * as React from 'react'
import { api } from '../lib/api'

const LANGS=['Marathi','Hindi','English']

export default function Stores(){
  const [rows,setRows]=React.useState([])
  const [owners,setOwners]=React.useState([])
  const [form,setForm]=React.useState({ book_type:'', edition:'', book_language:'', issue_date:'', owner_id:'', quantity:0, location:'', faulty_books:0 })
  const [editingId,setEditingId]=React.useState(null)
  const [err,setErr]=React.useState('')

  async function load(){ const [list,dists]=await Promise.all([ api('/api/stores'), api('/api/options/distributors') ]); setRows(list); setOwners(dists) }
  React.useEffect(()=>{ load() },[])

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }

  async function save(){
    setErr('')
    try{
      const payload={...form, edition:Number(form.edition), owner_id:Number(form.owner_id), quantity:Number(form.quantity||0), faulty_books:Number(form.faulty_books||0)}
      const path=editingId?`/api/stores/${editingId}`:'/api/stores'
      const method=editingId?'PUT':'POST'
      await api(path,{method,body:payload})
      setForm({ book_type:'', edition:'', book_language:'', issue_date:'', owner_id:'', quantity:0, location:'', faulty_books:0 }); setEditingId(null); await load()
    }catch(e){ setErr(e.message) }
  }
  async function del(id){ if(!confirm('Delete this item?')) return; await api(`/api/stores/${id}`,{method:'DELETE'}); await load() }
  function edit(r){ setEditingId(r.id); setForm({...r}) }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Store Master</h2>

      <div className="card p-4 mb-6">
        <div className="text-sm font-semibold mb-3">Add / Edit Store</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <label className="text-sm flex flex-col gap-1"><span>Book Type *</span><input className="border rounded-lg px-3 py-2" value={form.book_type} onChange={e=>setField('book_type',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Edition *</span><input type="number" className="border rounded-lg px-3 py-2" value={form.edition} onChange={e=>setField('edition',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Language *</span><select className="border rounded-lg px-3 py-2" value={form.book_language} onChange={e=>setField('book_language',e.target.value)} required>{LANGS.map(x=><option key={x} value={x}>{x}</option>)}</select></label>
          <label className="text-sm flex flex-col gap-1"><span>Issue Date *</span><input type="datetime-local" className="border rounded-lg px-3 py-2" value={form.issue_date} onChange={e=>setField('issue_date',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Owner (Distributor) *</span><select className="border rounded-lg px-3 py-2" value={form.owner_id} onChange={e=>setField('owner_id',e.target.value)} required>{owners.map(o=><option key={o.id} value={o.id}>{o.id} — {o.fname} {o.lname}</option>)}</select></label>
          <label className="text-sm flex flex-col gap-1"><span>Quantity *</span><input type="number" className="border rounded-lg px-3 py-2" value={form.quantity} onChange={e=>setField('quantity',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Location *</span><input className="border rounded-lg px-3 py-2" value={form.location} onChange={e=>setField('location',e.target.value)} required /></label>
          <label className="text-sm flex flex-col gap-1"><span>Faulty</span><input type="number" className="border rounded-lg px-3 py-2" value={form.faulty_books} onChange={e=>setField('faulty_books',e.target.value)} /></label>
        </div>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        <div className="mt-3 flex gap-2">
          <button className="btn" onClick={save}>{editingId?'Update':'Create'}</button>
          <button className="btn !bg-slate-200 !text-slate-800 hover:!bg-slate-300" onClick={()=>{ setForm({ book_type:'', edition:'', book_language:'', issue_date:'', owner_id:'', quantity:0, location:'', faulty_books:0 }); setEditingId(null) }}>Clear</button>
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50">
            <tr>
              <th className="text-left p-3">ID</th><th className="text-left p-3">Book Type</th><th className="text-left p-3">Edition</th>
              <th className="text-left p-3">Lang</th><th className="text-left p-3">Issue</th><th className="text-left p-3">Owner</th>
              <th className="text-left p-3">Qty</th><th className="text-left p-3">Loc</th><th className="text-left p-3">Faulty</th><th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id} className="border-t hover:bg-brand-50/40">
                <td className="p-3">{r.id}</td><td className="p-3">{r.book_type}</td><td className="p-3">{r.edition}</td>
                <td className="p-3">{r.book_language}</td><td className="p-3">{r.issue_date}</td><td className="p-3">{r.owner_id}</td>
                <td className="p-3">{r.quantity}</td><td className="p-3">{r.location}</td><td className="p-3">{r.faulty_books}</td>
                <td className="p-3 text-right">
                  <button className="btn mr-2" onClick={()=>edit(r)}>Edit</button>
                  <button className="btn !bg-red-500 hover:!bg-red-600" onClick={()=>del(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-4 text-center" colSpan={10}>No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
