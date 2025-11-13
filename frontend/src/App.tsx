import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Fonds from './pages/Fonds'
import Inventories from './pages/Inventories'
import Records from './pages/Records'
import Requests from './pages/Requests'
import Users from './pages/Users'
import Stats from './pages/Stats'
import Audit from './pages/Audit'
import About from './pages/About'
import NotFound from './pages/NotFound'
import Forbidden from './pages/Forbidden'
import ServerError from './pages/ServerError'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="fonds" element={<Fonds />} />
          <Route path="inventories" element={<Inventories />} />
          <Route path="records" element={<Records />} />
          <Route path="requests" element={<Requests />} />
          <Route path="users" element={<Users />} />
          <Route path="stats" element={<Stats />} />
          <Route path="audit" element={<Audit />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  )
}

export default App

