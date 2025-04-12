import { Routes, Route } from 'react-router-dom';
import DashBoard from "./components/DashBoard";
import AskMyGrandkid from './pages/Grandkid_View';

import EZMode from "./components/EZMode";
import AskGrandChild from "./components/AskGrandChild";
import TapTutor from "./components/TapTutor";
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<AuthPage />} />

      {/* Elder Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="elder">
            <DashBoard />
          </ProtectedRoute>
        }
      />

      {/* ✅ Moved these outside so they load as full pages */}
      <Route 
        path="/ezmode" 
        element={
          <ProtectedRoute requiredRole="elder">
            <EZMode />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/ask-grandkid" 
        element={
          <ProtectedRoute requiredRole="elder">
            <AskGrandChild />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/taptutor" 
        element={
          <ProtectedRoute requiredRole="elder">
            <TapTutor />
          </ProtectedRoute>
        }
      />

      {/* Grandkid View */}
      <Route 
        path="/kid_view" 
        element={
          <ProtectedRoute requiredRole="grandkid">
            <AskMyGrandkid />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
