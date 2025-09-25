import * as React from 'react'
import { api } from '../lib/api'

const FIELD_CLASSES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-3 py-2',
  lg: 'px-4 py-2 text-base'
}

export default function ReaderAssignments(){
  const [rows,setRows]=React.useState([])
  const [types,setTypes]=React.useState([])
  const [dists,setDists]=React.useState([])
  const [stores,setStores]=React.useState([])
  const [editingId,setEditingId]=React.useState(null)
  const [err,setErr]=React.useState('')

  const [form,setForm]=React.useState({
    distributor_id:'',
    store_id:'',
    reader_type_id:'',
    mediator_fname:'',
    mediator_lname:'',
    reader_fname:'',
    reader_lname:'',
    quantity:1,
    phone:'',
    assignment_date:'',
    reader_place:''
  })

  function setField(k,v){ setForm(f=>({...f,[k]:v})) }
  function setFieldTrim(k,v){ setField(k, String(v||'').trim()) }

  async function load(){
    const [view, t, ds, ss] = await Promise.all([
      api('/api/reader_assignments_view'),
      api('/api/options/reader_types'),
      api('/api/options/distributors'),
      api('/api/options/stores')
    ])
    setRows(view); setTypes(t); setDists(ds); setStores(ss)
  }
  React.useEffect(()=>{ load() },[])

  async function save(){
    setErr('')
    try{
      const payload = { ...form,
        distributor_id: Number(form.distributor_id)||null,
        store_id: Number(form.store_id)||null,
        reader_type_id: Number(form.reader_type_id)||null,
        quantity: Number(form.quantity)||1,
        phone: String(form.phone||'').trim(),
        mediator_fname: String(form.mediator_fname||'').trim(),
        mediator_lname: String(form.mediator_lname||'').trim(),
        reader_fname: String(form.reader_fname||'').trim(),
        reader_lname: String(form.reader_lname||'').trim(),
        reader_place: String(form.reader_place||'').trim()
      }
      const path = '/api/reader_assignments' + (editingId? '/' + editingId : '')
      const method = editingId? 'PUT' : 'POST'
      await api(path, { method, body: payload })
      setForm({
        distributor_id:'', store_id:'', reader_type_id:'',
        mediator_fname:'', mediator_lname:'', reader_fname:'', reader_lname:'',
        quantity:1, phone:'', assignment_date:'', reader_place:''
      })
      setEditingId(null)
      await load()
    }catch(e){ setErr(e.message) }
  }

  async function del(id){
    if(!confirm('Delete this assignment?')) return
    await api(`/api/reader_assignments/${id}`, { method:'DELETE' })
    await load()
  }

  function edit(r){
    setEditingId(r.id)
    setForm({
      distributor_id: String(r.distributor_id||''),
      store_id: String(r.store_id||''),
      reader_type_id: String(r.reader_type_id||''),
      mediator_fname: r.mediator_fname||'',
      mediator_lname: r.mediator_lname||'',
      reader_fname: r.reader_fname||'',
      reader_lname: r.reader_lname||'',
      quantity: String(r.quantity||1),
      phone: r.phone||'',
      assignment_date: r.assignment_date? String(r.assignment_date).substring(0,10) : '',
      reader_place: r.reader_place||''
    })
  }

  const col = 'flex flex-col gap-1'
  const input = 'border rounded-lg ' + FIELD_CLASSES.md + ' w-full'
  const select = 'border rounded-lg ' + FIELD_CLASSES.md + ' w-full'

  function rowClass(i){ return i%2===0? 'bg-white' : 'bg-slate-50' }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Distributor → Reader Assignments</h1>

      {err && <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded">{err}</div>}

      <div className="card p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className={col}><span>Distributor *</span>
            <select className={select} value={form.distributor_id} onChange={e=>setField('distributor_id', e.target.value)} required>
              <option value="">Select distributor</option>
              {dists.map(d=><option key={d.id} value={d.id}>{d.fname} {d.lname}</option>)}
            </select>
          </label>

          <label className={col}><span>Store Item *</span>
            <select className={select} value={form.store_id} onChange={e=>setField('store_id', e.target.value)} required>
              <option value="">Select item</option>
              {stores.map(s=><option key={s.id} value={s.id}>{s.book_type} / {s.book_language} / ed {s.edition}</option>)}
            </select>
          </label>

          <label className={col}><span>Reader Type *</span>
            <select className={select} value={form.reader_type_id} onChange={e=>setField('reader_type_id', e.target.value)} required>
              <option value="">Select reader type</option>
              {types.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>

          <label className={col}><span>Mediator First Name</span>
            <input className={input} value={form.mediator_fname} onChange={e=>setFieldTrim('mediator_fname', e.target.value)} placeholder="Optional" />
          </label>
          <label className={col}><span>Mediator Last Name</span>
            <input className={input} value={form.mediator_lname} onChange={e=>setFieldTrim('mediator_lname', e.target.value)} placeholder="Optional" />
          </label>

          <label className={col}><span>Reader First Name *</span>
            <input className={input} value={form.reader_fname} onChange={e=>setFieldTrim('reader_fname', e.target.value)} required />
          </label>
          <label className={col}><span>Reader Last Name</span>
            <input className={input} value={form.reader_lname} onChange={e=>setFieldTrim('reader_lname', e.target.value)} />
          </label>

          <label className={col}><span>Quantity *</span>
            <input className={input} type="number" min="1" value={form.quantity} onChange={e=>setField('quantity', e.target.value)} required />
          </label>

          <label className={col}><span>Phone</span>
            <input className={input} type="tel" value={form.phone} onChange={e=>setFieldTrim('phone', e.target.value)} placeholder="+91..." />
          </label>

          <label className={col}><span>Assignment Date</span>
            <input className={input} type="date" value={form.assignment_date} onChange={e=>setField('assignment_date', e.target.value)} />
          </label>

          <label className="md:col-span-3 flex flex-col gap-1"><span>Reader Place</span>
            <input className={input} value={form.reader_place} onChange={e=>setFieldTrim('reader_place', e.target.value)} placeholder="City / Area / Notes" />
          </label>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <button className="btn" onClick={save}>{editingId? 'Update' : 'Add'}</button>
          <button className="btn !bg-slate-200 text-slate-800 hover:!bg-slate-300" onClick={()=>{ 
            setForm({ distributor_id:'', store_id:'', reader_type_id:'', mediator_fname:'', mediator_lname:'', reader_fname:'', reader_lname:'', quantity:1, phone:'', assignment_date:'', reader_place:'' });
            setEditingId(null);
          }}>Clear</button>
        </div>
      </div>

      <div className="card overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Distributor</th>
              <th className="p-3 text-left">Item</th>
              <th className="p-3 text-left">Reader Type</th>
              <th className="p-3 text-left">Mediator</th>
              <th className="p-3 text-left">Reader</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Place</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i)=>(
              <tr key={r.id} className={rowClass(i)}>
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.distributor_name}</td>
                <td className="p-3">{r.store_item}</td>
                <td className="p-3">{r.reader_type}</td>
                <td className="p-3">{[r.mediator_fname,r.mediator_lname].filter(Boolean).join(' ')}</td>
                <td className="p-3">{[r.reader_fname,r.reader_lname].filter(Boolean).join(' ')}</td>
                <td className="p-3">{r.quantity}</td>
                <td className="p-3">{r.phone||''}</td>
                <td className="p-3">{r.assignment_date}</td>
                <td className="p-3">{r.reader_place||''}</td>
                <td className="p-3 text-right">
                  <button className="btn mr-2" onClick={()=>edit(r)}>Edit</button>
                  <button className="btn !bg-red-500 hover:!bg-red-600" onClick={()=>del(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="p-4 text-center" colSpan={11}>No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
