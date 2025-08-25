import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import dotenv from 'dotenv'
import pkg from 'pg'
dotenv.config()
const { Pool } = pkg
const useSSL=(process.env.USE_SSL||'false').toLowerCase()==='true'
const pool=new Pool({ connectionString:process.env.DATABASE_URL, ...(useSSL?{ssl:{rejectUnauthorized:false}}:{}) })

const app=express()
app.use(helmet()); app.use(compression()); app.use(morgan('dev'))

const originsEnv = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || '*';
const allowedOrigins = originsEnv.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, cb) {
    if (!origin) return cb(null, true); // allow curl/health
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return cb(null, true);
    }
    return cb(new Error('Not allowed by CORS: ' + origin), false);
  },
 methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Accept'],
}));

// const allowOrigin=process.env.FRONTEND_ORIGIN||'*'
// app.use(cors({ origin: allowOrigin==='*'?true:allowOrigin, methods:['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders:['Content-Type','Accept'] }))
app.use(express.json())

app.get('/api/health',(_req,res)=>res.json({ok:true,time:new Date().toISOString()}))

// Auth (no tokens/hashing per request)
app.post('/api/auth/login',async(req,res)=>{
  try{
    const {email,password}=req.body||{}
    if(!email||!password) return res.status(400).json({error:'email & password required'})
    const q=await pool.query('SELECT id,email,name,role FROM users WHERE email=$1 AND password=$2 LIMIT 1',[email,password])
    if(!q.rows.length) return res.status(401).json({error:'Invalid credentials'})
    res.json({user:q.rows[0]})
  }catch(e){ res.status(500).json({error:e.message}) }
})

// CRUD helper
function crudRoutes(table, cols){
  const base=`/api/${table}`
  app.get(base, async (_req,res)=>{ try{ const q=await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`); res.json(q.rows) }catch(e){ res.status(500).json({error:e.message}) } })
  app.post(base, async (req,res)=>{ try{ const vals=cols.map(c=>req.body[c]); const ph=cols.map((_,i)=>`$${i+1}`).join(','); const q=await pool.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${ph}) RETURNING *`, vals); res.status(201).json(q.rows[0]) }catch(e){ res.status(500).json({error:e.message}) } })
  app.put(`${base}/:id`, async (req,res)=>{ try{ const sets=cols.map((c,i)=>`${c}=$${i+1}`).join(','); const vals=cols.map(c=>req.body[c]); vals.push(req.params.id); const q=await pool.query(`UPDATE ${table} SET ${sets} WHERE id=$${cols.length+1} RETURNING *`, vals); if(!q.rows.length) return res.status(404).json({error:'Not found'}); res.json(q.rows[0]) }catch(e){ res.status(500).json({error:e.message}) } })
  app.delete(`${base}/:id`, async (req,res)=>{ try{ const q=await pool.query(`DELETE FROM ${table} WHERE id=$1 RETURNING id`,[req.params.id]); if(!q.rows.length) return res.status(404).json({error:'Not found'}); res.json({ok:true}) }catch(e){ res.status(500).json({error:e.message}) } })
}
crudRoutes('users',['email','password','name','role'])
crudRoutes('reader_types',['name'])
crudRoutes('distributors',['fname','mname','lname','address','mobile1','mobile2','email','location'])
crudRoutes('stores',['book_type','edition','book_language','issue_date','owner_id','quantity','location','faulty_books'])
crudRoutes('storetodistributor',['distributor_id','book_type','book_language','edition','quantity','location','distribution_date'])
crudRoutes('reader_assignments',['distributor_id','store_id','reader_type_id','mediator_fname','mediator_lname','reader_fname','reader_lname','quantity','phone','assignment_date','reader_place'])

// Options endpoints
app.get('/api/options/distributors', async (_req,res)=>{
  try{ const q=await pool.query('SELECT id,fname,lname FROM distributors ORDER BY id ASC'); res.json(q.rows) }catch(e){ res.status(500).json({error:e.message}) }
})
app.get('/api/options/stores', async (_req,res)=>{
  try{ const q=await pool.query('SELECT id,book_type,edition,book_language FROM stores ORDER BY id ASC'); res.json(q.rows) }catch(e){ res.status(500).json({error:e.message}) }
})

// Reader assignment view
app.get('/api/reader_assignments_view', async (_req,res)=>{
  try{
    const q=await pool.query(`SELECT ra.id, ra.distributor_id, d.fname||' '||d.lname AS distributor_name, ra.store_id,
      (s.book_type || ' / ' || s.book_language || ' / ed ' || s.edition) AS store_item,
      ra.reader_type_id, rt.name AS reader_type, ra.mediator_fname, ra.mediator_lname, ra.reader_fname, ra.reader_lname,
      ra.quantity, ra.phone, ra.assignment_date, ra.reader_place
      FROM reader_assignments ra
      JOIN distributors d ON d.id=ra.distributor_id
      JOIN stores s ON s.id=ra.store_id
      JOIN reader_types rt ON rt.id=ra.reader_type_id
      ORDER BY ra.id DESC`)
    res.json(q.rows)
  }catch(e){ res.status(500).json({error:e.message}) }
})

// Dashboard summary + chart data
app.get('/api/dashboard/summary', async (_req,res)=>{
  try{
    const [u,d,s,sd,ra]=await Promise.all([
      pool.query('SELECT COUNT(*)::int AS n FROM users'),
      pool.query('SELECT COUNT(*)::int AS n FROM distributors'),
      pool.query('SELECT COUNT(*)::int AS n FROM stores'),
      pool.query('SELECT COUNT(*)::int AS n FROM storetodistributor'),
      pool.query('SELECT COUNT(*)::int AS n FROM reader_assignments')
    ])
    res.json({ users:u.rows[0].n, distributors:d.rows[0].n, storeItems:s.rows[0].n, storeToDistributor:sd.rows[0].n, readerAssignments:ra.rows[0].n })
  }catch(e){ res.status(500).json({error:e.message}) }
})

app.get('/api/dashboard/charts', async (_req,res)=>{
  try{
    const [lang,loc,rt,month]=await Promise.all([
      pool.query("SELECT book_language AS name, COUNT(*)::int AS value FROM stores GROUP BY 1 ORDER BY 1"),
      pool.query("SELECT location AS name, SUM(quantity)::int AS value FROM storetodistributor GROUP BY 1 ORDER BY 1"),
      pool.query("SELECT rt.name AS name, SUM(ra.quantity)::int AS value FROM reader_assignments ra JOIN reader_types rt ON rt.id=ra.reader_type_id GROUP BY 1 ORDER BY 1"),
      pool.query("SELECT to_char(date_trunc('month', distribution_date),'YYYY-MM') AS name, SUM(quantity)::int AS value FROM storetodistributor GROUP BY 1 ORDER BY 1")
    ])
    res.json({ storesByLanguage: lang.rows, distributionByLocation: loc.rows, assignmentsByReaderType: rt.rows, monthlyDistributions: month.rows })
  }catch(e){ res.status(500).json({error:e.message}) }
})

app.listen(process.env.PORT||5000, ()=>console.log('API running :'+(process.env.PORT||5000)))
