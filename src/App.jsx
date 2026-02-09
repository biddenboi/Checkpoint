import Dashboard from "./Pages/Dashboard";
import Settings from "./Pages/Settings";
import './App.css';
import { useState, createContext, useEffect, useMemo } from 'react';
import DatabaseConnection from "./network/DatabaseConnection";
import PlayerDatabase from "./network/PlayerDatabase";

export const DatabaseConnectionContext = createContext();

function App() {
  const databaseConnection = useMemo(() => new DatabaseConnection(), []);
  const playerDatabase = useMemo(
    () => new PlayerDatabase(databaseConnection),
    [databaseConnection]
  );

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
    <div className="navigation-bar">
      <a onClick={() => setCurrentPage("dashboard")}>Dashboard</a>
      <a onClick={() => setCurrentPage("settings")}>Settings</a>
    </div>
    <hr />
    <DatabaseConnectionContext.Provider value={databaseConnection}>
      {
        currentPage === "dashboard" ?
        <Dashboard></Dashboard>
        : <Settings></Settings>
      }
    </DatabaseConnectionContext.Provider>
  </>
}
export default App;