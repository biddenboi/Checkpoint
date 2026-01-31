import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import './App.css';
import { useState, createContext, useEffect } from 'react';
import DatabaseConnection from "./network/DatabaseConnection";

export const DatabaseConnectionContext = createContext();

function App() {
  const databaseConnection = new DatabaseConnection();

  useEffect(() => {
    const player = {
      createdAt: new Date().toISOString().split('T')[0],
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
    <DatabaseConnectionContext.Provider value={databaseConnection}>
      {
        currentPage == "dashboard" ?
        <Dashboard></Dashboard>
        : <Settings></Settings>
      }
    </DatabaseConnectionContext.Provider>
  </>
}
export default App;