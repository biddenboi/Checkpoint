import Dashboard from "./Pages/Dashboard/Dashboard";
import Events from "./Pages/Events/Events";
import Settings from "./Pages/Settings/Settings";
import Journal from "./Pages/Journal/Journal";
import Shop from "./Pages/Shop/Shop";

import './App.css';
import { useState, createContext, useEffect, useMemo } from 'react';
import DatabaseConnection from "./network/DatabaseConnection";
import PlayerDatabase from "./network/Database/PlayerDatabase";

export const DatabaseConnectionContext = createContext();

function App() {
  const [inTaskSession, setInTaskSession] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  
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

  const loadPage = () => {
    if (currentPage === "dashboard") {
      return <Dashboard inTaskSession={inTaskSession} setInTaskSession={setInTaskSession}></Dashboard>
    } else if (currentPage === "events") {
      return <Events></Events>
    } else if (currentPage === "shop") {
      return <Shop></Shop>
    } else if (currentPage === "journal") {
      return <Journal></Journal>
    } else {
      return <Settings></Settings>
    }
  }

  useEffect(() => {
    //FINISH PUSHING PLAYER DATA  
    const createPlayer = async () => {
      const player = {
        username: "Guest",
        createdAt: new Date().toISOString(),
        localCreatedAt: new Date().toLocaleString('sv').split(' ')[0]
      }
      await playerDatabase.createPlayer(player);
    }

    createPlayer();
  }, [playerDatabase])

  
  return <>
    <div className={inTaskSession ? "navigation-bar task-in-session" : "navigation-bar"}>
      <a onClick={() => setPage("dashboard")}>Dashboard</a>
      <a onClick={() => setPage("events")}>Events</a>
      <a onClick={() => setPage("shop")}>Shop</a>
      <a onClick={() => setPage("journal")}>Journal</a>
      <a onClick={() => setPage("settings")}>Settings</a>
    </div>
    <DatabaseConnectionContext.Provider value={databaseConnection}>
      {loadPage()}
    </DatabaseConnectionContext.Provider>
  </>
}
export default App;