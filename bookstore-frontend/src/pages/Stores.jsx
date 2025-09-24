import * as React from 'react'
import { api } from '../lib/api'

// Allowed enums (align with your DB/business rules)
const BOOK_TYPES = ['BhaktiChaitanya-I','BhaktiChaitanya-II','BhaktiChaitanya-III']
const LANGS = ['Marathi','Hindi','English']
const LOCATIONS = ['Mumbai','Pune'] // adjust if you have more

export default function Stores(){
  const [rows,setRows] = React.useState([])
  const [owners,setOwners] = React.useState([]) // distributors
  const [editingId,setEditingId] = React.useState(null)
  const [err,setErr] = React.useState('')
  const [busy,setBusy] = React.useState(false)

  const emptyForm = {
    book_type: '',
    edition: '',
    book_language: '',
    issue_date: '',
    owner_id: '',
    quantity: 0,
    location: '',
    faulty_books: 0,
  }
  const [form,setForm] = React.useState(emptyForm)

  function setField(k,v){ setForm(f => ({...f,[k]:v})) }

  async function load(){
    try{
      setErr('')
      const [list, dists] = await Promise.all([
        api('/api/stores'),
        api('/api/options/distributors'),
      ])
      setRows(list)
      setOwners(dists)
    }catch(e){
      setErr(e.message || 'Failed to load data')
    }
  }
  React.useEffect(()=>{ load() },[])

  function edit(row){
    setEditingId(row.id)
    setForm({
      book_type: row.book_type || '',
      edition: String(row.edition ?? ''),
      book_language: row.book_language || '',
      // Convert ISO/UTC to yyyy-MM-ddThh:mm for <input type="datetime-local">
      issue_date: row.issue_date ? new Date(row.issue_date).toISOString().slice(0,16) : '',
      owner_id: String(row.owner_id ?? ''),
      quantity: Number(row.quantity ?? 0),
      location: row.location || '',
      faulty_books: Number(row.faulty_books ?? 0),
    })
  }

  function resetForm(){
    setEditingId(null)
    setForm(emptyForm)
  }

  // Basic client-side validation to avoid common FK / check violations
  function validate(){
    if(!form.book_type || !BOOK_TYPES.includes(form.book_type)) return 'Select a valid Book Type'
    if(form.edition === '' || isNaN(Number(form.edition))) return 'Edition must be a number (can be 0 or negative)'
    if(!form.book_language || !LANGS.includes(form.book_language)) return 'Select a valid Language'
    if(!form.issue_date) return 'Issue date is required'
    if(!form.owner_id) return 'Please select a Distributor (Owner)'
    if(form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) return 'Quantity must be 0 or more'
    if(!form.location) return 'Location is required'
    if(form.faulty_books === '' || isNaN(Number(form.faulty_books)) || Number(form.faulty_books) < 0) return 'Faulty books must be 0 or more'
    return ''
  }

  async function submit(e){
    e.preventDefault()
    const v = validate()
    if(v){ setErr(v); return }
    setBusy(true); setErr('')
    try{
      const payload = {
        book_type: form.book_type,
        edition: Number(form.edition),
        book_language: form.book_language,
        // Ensure server receives ISO string
        issue_date: new Date(form.issue_date).toISOString(),
        owner_id: Number(form.owner_id),         // FK to distributors(id)
        quantity: Number(form.quantity),
        location: form.location,
        faulty_books: Number(form.faulty_books),
      }
      const url = editingId ? `/api/stores/${editingId}` : '/api/stores'
      await api(url, { method: editingId ? 'PUT' : 'POST', body: payload })
      resetForm()
      await load()
    }catch(e){
      // Friendly messages for common DB errors
      const msg = String(e.message || e)
      if(/foreign key/i.test(msg)){
        setErr('Selected owner does not exist. Please pick a valid Distributor.')
      }else if(/check constraint/i.test(msg) && /book_language/i.test(msg)){
        setErr('Language must be one of Marathi, Hindi, or English.')
      }else{
        setErr(msg)
      }
    }finally{
      setBusy(false)
    }
  }

  async function del(id){
    if(!confirm('Delete this record?')) return
    setBusy(true); setErr('')
    try{
      await api(`/api/stores/${id}`, { method: 'DELETE' })
      await load()
    }catch(e){
      const msg = String(e.message || e)
      if(/foreign key/i.test(msg)){
        setErr('Cannot delete. This record is referenced by other data.')
      }else{
        setErr(msg)
      }
    }finally{
      setBusy(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Store Master</h2>

      {err && <div className="mb-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg">{err}</div>}

      <div className="card p-4 mb-6">
        <div className="text-sm font-semibold mb-3">{editingId ? 'Edit Store Item' : 'Add Store Item'}</div>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          
          <label className="text-sm flex flex-col gap-1">
            <span>Book Type</span>
            <select className="input" value={form.book_type} onChange={e=>setField('book_type', e.target.value)} required>
              <option value="">Select</option>
              {BOOK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Edition</span>
            <input className="input" type="number" value={form.edition} onChange={e=>setField('edition', e.target.value)} placeholder="e.g. 1 or 0 or -1"/>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Language</span>
            <select className="input" value={form.book_language} onChange={e=>setField('book_language', e.target.value)} required>
              <option value="">Select</option>
              {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Issue Date & Time</span>
            <input className="input" type="datetime-local" value={form.issue_date} onChange={e=>setField('issue_date', e.target.value)} required/>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Owner (Distributor)</span>
            <select className="input" value={form.owner_id} onChange={e=>setField('owner_id', e.target.value)} required>
              <option value="">Select distributor</option>
              {owners.map(o => <option key={o.id} value={o.id}>{[o.fname,o.lname].filter(Boolean).join(' ') || o.id}</option>)}
            </select>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Quantity</span>
            <input className="input" type="number" min="0" value={form.quantity} onChange={e=>setField('quantity', e.target.value)} required/>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Location</span>
            <select className="input" value={form.location} onChange={e=>setField('location', e.target.value)} required>
              <option value="">Select</option>
              {LOCATIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label className="text-sm flex flex-col gap-1">
            <span>Faulty Books</span>
            <input className="input" type="number" min="0" value={form.faulty_books} onChange={e=>setField('faulty_books', e.target.value)} />
          </label>

          <div className="md:col-span-4 flex gap-2 pt-2">
            <button className="btn" disabled={busy} type="submit">{editingId ? 'Update' : 'Create'}</button>
            <button className="btn !bg-gray-200 !text-gray-900 hover:!bg-gray-300" type="button" onClick={resetForm}>Reset</button>
          </div>
        </form>
      </div>

      <div className="card p-0 overflow-auto">
        <table className="table-auto w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Book Type</th>
              <th className="p-3">Edition</th>
              <th className="p-3">Language</th>
              <th className="p-3">Issue Date</th>
              <th className="p-3">Owner</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Location</th>
              <th className="p-3">Faulty</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.book_type}</td>
                <td className="p-3">{r.edition}</td>
                <td className="p-3">{r.book_language}</td>
                <td className="p-3">{new Date(r.issue_date).toLocaleString()}</td>
                <td className="p-3">{r.fname ? `${r.fname} ${r.lname||''}`.trim() : r.owner_id}</td>
                <td className="p-3">{r.quantity}</td>
                <td className="p-3">{r.location}</td>
                <td className="p-3">{r.faulty_books}</td>
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
