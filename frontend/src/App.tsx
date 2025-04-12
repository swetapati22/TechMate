import { Routes, Route } from 'react-router-dom';
import DashBoard from "./components/DashBoard";
import EZMode from "./components/EZMode";
import AskGrandChild from "./components/AskGrandChild";
import TapTutor from "./components/TapTutor";
// import Login from "./components/login";
import AuthPage from './components/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';



function App() {
  //return (<div><DashBoard></DashBoard></div>);
  return (
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
        <DashBoard />
      </ProtectedRoute>
    } />
      <Route path="/ezmode" element={<EZMode />} />
      <Route path="/ask-grandkid" element={<AskGrandChild />} />
      <Route path="/taptutor" element={<TapTutor />} />
    </Routes>
  );
}

export default App
