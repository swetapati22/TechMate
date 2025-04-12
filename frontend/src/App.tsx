import { Routes, Route } from 'react-router-dom';
import DashBoard from "./components/DashBoard";
import EZMode from "./components/EZMode";
import AskGrandChild from "./components/AskGrandChild";
import TapTutor from "./components/TapTutor";




function App() {
  //return (<div><DashBoard></DashBoard></div>);
  return (
    <Routes>
      <Route path="/" element={<DashBoard />} />
      <Route path="/ezmode" element={<EZMode />} />
      <Route path="/ask-grandkid" element={<AskGrandChild />} />
      <Route path="/taptutor" element={<TapTutor />} />
    </Routes>
  );
}

export default App
