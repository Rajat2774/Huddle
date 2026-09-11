import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import CreateRoom from './pages/CreateRoom'
import ChatRoom from './pages/ChatRoom'
import BrowseRooms from './pages/BrowseRooms'
import Profile from './pages/Profile'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateRoom />} />
          <Route path="/browse" element={<BrowseRooms />} />
          <Route path="/room/:id" element={<ChatRoom />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
