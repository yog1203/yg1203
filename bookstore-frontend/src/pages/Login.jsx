import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
export default function Login(){
  const nav=useNavigate()
  const [email,setEmail]=React.useState('admin@example.com')
  const [password,setPassword]=React.useState('admin123')
  const [err,setErr]=React.useState('')
  async function submit(e){ e.preventDefault(); setErr(''); try{ const d=await api('/api/auth/login',{method:'POST',body:{email,password}}); localStorage.setItem('user',JSON.stringify(d.user)); nav('/') }catch(e){ setErr(e.message) } }
  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={submit} className="card p-6 w-96">
        <h2 className="text-xl font-bold mb-2">Sign in</h2>
        <label className="text-sm flex flex-col gap-1 mb-2">
          <span>Email</span>
          <input className="border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
        </label>
        <label className="text-sm flex flex-col gap-1 mb-2">
          <span>Password</span>
          <input className="border rounded-lg px-3 py-2" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        </label>
        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}
        <button className="btn w-full">Login</button>
        <div className="mt-3 text-xs text-slate-600">Try: admin/admin123, dist/dist123, user/user123</div>
      </form>
    </div>
  )
}
