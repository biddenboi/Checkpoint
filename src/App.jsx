import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import './App.css';
import { useState } from 'react';

function App() {
  useEffect(() => {
    player = {
      createdAt: newDate().toISOString().split('T')[0],
      username: "testingUser",
    }
    //FINISH PUSHING PLAYER DATA
  })

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
      : <Settings></Settings>
    }
  </>
}
export default App;