import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import CreateRoom from './pages/CreateRoom'
import ChatRoom from './pages/ChatRoom'
import BrowseRooms from './pages/BrowseRooms'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/browse" element={<BrowseRooms />} />
        <Route path="/room/:id" element={<ChatRoom />} />
      </Route>
    </Routes>
  )
}
