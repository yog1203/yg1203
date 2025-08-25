import * as React from 'react'
import { api } from '../lib/api'
export default function CrudPage({ title, listPath, columns, initialForm, toPayload }){
  const [rows,setRows]=React.useState([])
  const [form,setForm]=React.useState(initialForm)
  const [editingId,setEditingId]=React.useState(null)
  const [err,setErr]=React.useState('')
  async function load(){ setRows(await api(listPath)) }
  React.useEffect(()=>{ load() },[])
  function setField(k,v){ setForm(f=>({...f,[k]:v})) }
  async function save(){ setErr(''); try{ const method=editingId?'PUT':'POST'; const path=editingId?`${listPath}/${editingId}`:listPath; await api(path,{method,body:toPayload(form)}); setForm(initialForm); setEditingId(null); await load() }catch(e){ setErr(e.message) } }
  async function del(id){ if(!confirm('Delete this item?')) return; await api(`${listPath}/${id}`,{method:'DELETE'}); await load() }
  function edit(r){ setEditingId(r.id); setForm({ ...initialForm, ...r }) }
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="card p-4 mb-6">
        <div className="text-sm font-semibold mb-3">{editingId?'Edit':'Add'} {title}</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {columns.map(c => (
            <label key={c.key} className="flex flex-col text-sm gap-1">
              <span className="text-slate-700">{c.label}{c.required && ' *'}</span>
              <input className="border rounded-lg px-3 py-2 focus:outline-brand-500"
                type={c.type || 'text'} required={c.required||false}
                value={form[c.key] ?? ''} onChange={e=>setField(c.key, e.target.value)} />
            </label>
          ))}
        </div>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
        <div className="mt-3 flex gap-2">
          <button className="btn" onClick={save}>{editingId?'Update':'Create'}</button>
          <button className="btn !bg-slate-200 !text-slate-800 hover:!bg-slate-300" onClick={()=>{ setForm(initialForm); setEditingId(null) }}>Clear</button>
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-brand-50">
            <tr>
              <th className="text-left p-3">ID</th>
              {columns.map(c => <th key={c.key} className="text-left p-3">{c.label}</th>)}
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t hover:bg-brand-50/40">
                <td className="p-3">{r.id}</td>
                {columns.map(c => <td key={c.key} className="p-3">{String(r[c.key] ?? '')}</td>)}
                <td className="p-3 text-right">
                  <button className="btn mr-2" onClick={()=>edit(r)}>Edit</button>
                  <button className="btn !bg-red-500 hover:!bg-red-600" onClick={()=>del(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-4 text-center" colSpan={columns.length+2}>No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
