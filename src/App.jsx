import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import './App.css';
import { useState, createContext, useEffect, useMemo } from 'react';
import DatabaseConnection from "./network/DatabaseConnection";
import PlayerDatabase from "./network/PlayerDatabase";

export const DatabaseConnectionContext = createContext();

function App() {
  const [inTaskSession, setInTaskSession] = useState(false);
  
  const databaseConnection = useMemo(() => new DatabaseConnection(), []);
  const playerDatabase = useMemo(
    () => new PlayerDatabase(databaseConnection),
    [databaseConnection]
  );

  //maybe improve the function name. Checks if task is in session and changes page if not.
  const setPage = (page) => {
    if (!inTaskSession) {
      setCurrentPage(page);
    }
  }

  useEffect(() => {

    //FINISH PUSHING PLAYER DATA
    const createPlayer = async () => {
      const player = {
        username: "Guest",
        createdAt: new Date().toISOString().split('T')[0]
      }
      await playerDatabase.createPlayer(player);
    }

    createPlayer();
  }, [playerDatabase])

  const [currentPage, setCurrentPage] = useState("dashboard");
  return <>
    <div className={inTaskSession ? "navigation-bar task-in-session" : "navigation-bar"}>
      <a onClick={() => setPage("dashboard")}>Dashboard</a>
      <a onClick={() => setPage("settings")}>Settings</a>
    </div>
    <DatabaseConnectionContext.Provider value={databaseConnection}>
      {
        currentPage === "dashboard" ?
        <Dashboard inTaskSession={inTaskSession} setInTaskSession={setInTaskSession}></Dashboard>
        : <Settings></Settings>
      }
    </DatabaseConnectionContext.Provider>
  </>
}
export default App;