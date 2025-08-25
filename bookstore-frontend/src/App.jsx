import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Users from './pages/Users.jsx'
import Distributors from './pages/Distributors.jsx'
import Stores from './pages/Stores.jsx'
import StoreToDistributor from './pages/StoreToDistributor.jsx'
import ReaderTypes from './pages/ReaderTypes.jsx'
import ReaderAssignments from './pages/ReaderAssignments.jsx'
import Layout from './components/Layout.jsx'

function PrivateRoute({ children }) {
  return localStorage.getItem('user') ? children : <Navigate to="/login" replace />
}
export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/" element={<PrivateRoute><Layout/></PrivateRoute>}>
        <Route index element={<Dashboard/>} />
        <Route path="users" element={<Users/>} />
        <Route path="distributors" element={<Distributors/>} />
        <Route path="stores" element={<Stores/>} />
        <Route path="store-to-distributor" element={<StoreToDistributor/>} />
        <Route path="reader-types" element={<ReaderTypes/>} />
        <Route path="reader-assignments" element={<ReaderAssignments/>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
