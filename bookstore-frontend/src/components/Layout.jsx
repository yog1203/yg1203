import * as React from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UsersRound, Store, Boxes, Share2, BookOpenCheck } from 'lucide-react'

const NAV = [
  { to:'/', label:'Dashboard', icon: LayoutDashboard, roles:['admin','distributor','user'] },
  { to:'/users', label:'User Master', icon: UsersRound, roles:['admin'] },
  { to:'/distributors', label:'Distributor Master', icon: UsersRound, roles:['admin','distributor'] },
  { to:'/stores', label:'Store Master', icon: Store, roles:['admin','distributor'] },
  { to:'/store-to-distributor', label:'Store → Distributor', icon: Share2, roles:['admin','distributor'] },
  { to:'/reader-types', label:'Reader Types', icon: BookOpenCheck, roles:['admin'] },
  { to:'/reader-assignments', label:'Reader Assignments', icon: Boxes, roles:['admin','distributor'] }
]

export default function Layout(){
  const loc = useLocation()
  const nav = useNavigate()
  const [open, setOpen] = React.useState(true)
  const user = JSON.parse(localStorage.getItem('user')||'{}')
  const items = NAV.filter(i => i.roles.includes(user.role||'user'))
  function logout(){ localStorage.removeItem('user'); nav('/login') }

  return (
    <div className="min-h-screen grid" style={{ gridTemplateColumns: open ? '220px 1fr' : '72px 1fr' }}>
      <aside className="bg-gradient-to-b from-brand-700 to-brand-900 text-white sticky top-0 h-screen">
        <div className="px-3 py-4 flex items-center gap-2">
          <button className="btn !bg-white/20 !hover:bg-white/30" onClick={()=>setOpen(v=>!v)}>{open ? '≡' : '☰'}</button>
          {open && <span className="font-bold">Book Store</span>}
        </div>
        <nav className="px-2 space-y-1">
          {items.map(it => {
            const Icon = it.icon
            const active = loc.pathname === it.to
            return (
              <Link key={it.to} to={it.to} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${active ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                <Icon size={18}/>
                {open && <span>{it.label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-3 w-full px-3">
          {open && <div className="text-xs opacity-80 mb-2">Signed in as<br/><b>{user?.name}</b> <span className="opacity-70">({user?.role})</span></div>}
          <button onClick={logout} className="btn w-full">Logout</button>
        </div>
      </aside>

      <main className="p-6">
        <Outlet/>
      </main>
    </div>
  )
}
