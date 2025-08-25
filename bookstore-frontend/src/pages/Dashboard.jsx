import * as React from 'react'
import { api } from '../lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#06b6d4','#22d3ee','#0ea5e9','#a78bfa','#f97316','#10b981','#f43f5e']

function Card({ title, children }){
  return <div className="card p-4">{title && <div className="font-semibold mb-2">{title}</div>}{children}</div>
}

export default function Dashboard(){
  const [sum,setSum]=React.useState({users:0,distributors:0,storeItems:0,storeToDistributor:0,readerAssignments:0})
  const [data,setData]=React.useState({storesByLanguage:[], distributionByLocation:[], assignmentsByReaderType:[], monthlyDistributions:[]})
  React.useEffect(()=>{ api('/api/dashboard/summary').then(setSum); api('/api/dashboard/charts').then(setData) },[])

  const Metric = ({label,value}) => (
    <div className="card p-4">
      <div className="text-xs uppercase text-slate-600">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Metric label="Users" value={sum.users}/>
        <Metric label="Distributors" value={sum.distributors}/>
        <Metric label="Store Items" value={sum.storeItems}/>
        <Metric label="Store → Distributor" value={sum.storeToDistributor}/>
        <Metric label="Assignments" value={sum.readerAssignments}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Stores by Language">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.storesByLanguage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/>
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Distribution by Location">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.distributionByLocation} dataKey="value" nameKey="name" outerRadius={88} label>
                  {data.distributionByLocation.map((_,i)=>(<Cell key={i} fill={COLORS[i%COLORS.length]} />))}
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Assignments by Reader Type">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.assignmentsByReaderType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/>
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly Distributions (Qty)">
          <div className="h-64 lg:col-span-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyDistributions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name"/><YAxis allowDecimals={false}/><Tooltip/>
                <Line type="monotone" dataKey="value" stroke="#06b6d4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  )
}
