import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StationList from './pages/StationList';
import StationDetail from './pages/StationDetail';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import NavigateToStation from './pages/Navigate';
import Dashboard from './pages/Dashboard';
import './App.css';

// Redirects to /login if there's no saved token
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/stations" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/stations" element={<ProtectedRoute><StationList /></ProtectedRoute>} />
          <Route path="/stations/:id" element={<ProtectedRoute><StationDetail /></ProtectedRoute>} />
          <Route path="/payment/:id" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/confirmation/:id" element={<ProtectedRoute><Confirmation /></ProtectedRoute>} />
          <Route path="/navigate/:id" element={<ProtectedRoute><NavigateToStation /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
