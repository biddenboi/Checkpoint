import Dashboard from "./Pages/Dashboard";
import './App.css';
import { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  return <>
    <div className="navigation-bar">
      <a onClick={() => setCurrentPage("dashboard")}>Dashboard</a>
      <a onClick={() => setCurrentPage("s")}>Settings</a>
    </div>
    <hr />
    {
      currentPage == "dashboard" ?
      <Dashboard></Dashboard>
      : <></>
    }
  </>
}
export default App;