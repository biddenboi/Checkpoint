import './Dashboard.css'
import { useState, useEffect, useContext, useMemo } from 'react'
import { DatabaseConnectionContext } from '../App';
import TaskDatabase from '../network/TaskDatabase.js';
import PlayerDatabase from '../network/PlayerDatabase.js';
import Stopwatch from '../components/Stopwatch.jsx';

//pass along whether a task session is currently active
function Dashboard({ inTaskSession, setInTaskSession }) {
  const databaseConnection = useContext(DatabaseConnectionContext);
  const taskDatabase = useMemo(
    () => new TaskDatabase(databaseConnection)
    ,[databaseConnection]
  );
  const playerDatabase = useMemo(
    () => new PlayerDatabase(databaseConnection),
    [databaseConnection]
  );

  const [tasksState, setTasksState] = useState([]);
  const [playerData, setPlayerData] = useState({});
  const [taskStartTime, setTaskStartTime] = useState(null);

   // Load tasks when component mounts
   useEffect(() => {
    const loadTasks = async () => {
      const tasks = await taskDatabase.getTasks();
      setTasksState(tasks);
    };
    loadTasks();
  }, [taskDatabase]);

  useEffect(() => {
    //creates map of players due to inability to directly use promise in html
    const loadPlayers = async () => {
      const data = await playerDatabase.getPlayers()
      const playerMap = {};
      data.forEach(player => {
        playerMap[player.createdAt] = player;
      })

      setPlayerData(playerMap);
    }

    loadPlayers();
   
  }, [playerDatabase])

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const duration = taskStartTime ? Date.now() - taskStartTime : 0;

    const task = {
      createdAt: new Date().toISOString(),
      taskName: formData.get("taskName"),
      location: formData.get("location"),
      similarity: formData.get("similarity"),
      distractions: formData.get("distractions"),
      timeOfStart: formData.get("timeOfStart"),
      reasonToSelect: formData.get("reasonToSelect"),
      efficiency: formData.get("efficiency"),
      estimatedDuration: formData.get("estimatedDuration"),
      estimatedBuffer: formData.get("estimatedBuffer"),
      duration: duration,  
    }

    await taskDatabase.addTaskLog(task);

    // Reload tasks after adding  
    const tasks = await taskDatabase.getTasks();
    setTasksState(tasks); //updates task database and re-render
    setInTaskSession(false); // Reset the start time
    setTaskStartTime(null);  
    e.target.reset();
  }


  const handleStartTask = () => {
    setInTaskSession(true); //changes visual menu
    setTaskStartTime(Date.now());  // Record when task started
  }

  const handleGiveUpTask = async (e) => {
    e.target.form.reset();
    setInTaskSession(false);
    setTaskStartTime(null);  // Reset start time when giving up
  }

  // double implementation of time formatting, should probably be consolidated into a utility function
  const formatDuration = (ms) => {
    if (!ms) return "—";  // Show em dash if no duration data
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  return <div className="dashboard">
    <form action="" className="task-creation-menu"
      onSubmit={handleSubmit}>
      <div className="form-inputs">
        <label>
          Task Name:
          <input type="text" name="taskName" readOnly={inTaskSession}/>
        </label>
        <label>
          Where did you pick to work:
          <input type="text" name="location" readOnly={inTaskSession}/>
        </label>
        <label>
          Where are your distractions:
          <input type="text" name="distractions" readOnly={inTaskSession}/>
        </label>
        <label>
          Is this task similar to what you did before:
          <input type="text" name="similarity" readOnly={inTaskSession}/>
        </label>
        <label>
          Is this being done early in the day:
          <input type="text" name="timeOfStart" readOnly={inTaskSession}/>
        </label>
        <label>
          Why did you pick this task:
          <input type="text" name="reasonToSelect" readOnly={inTaskSession}/>
        </label>
        <label>
          How will you maximize efficiency:
          <input type="text" name="efficiency" readOnly={inTaskSession}/>
        </label>
        <label>
          Estimated Duration(minutes):
          <input type="number" name="estimatedDuration" readOnly={inTaskSession}/>
        </label>
        <label>
          Estimated Buffer Time (minutes):
          <input type="number" name="estimatedBuffer" readOnly={inTaskSession}/>
        </label>
      </div>
      {/*[TODO] Consolidate alternative views into seperate react functions */}
      {
        inTaskSession ? 
        <div className="task-session-container">
          <div className="task-form-buttons">
            <button>Complete</button>
            <button type="button">Broke Focus</button>
            <button type="button" onClick={handleGiveUpTask}>Give Up</button>
          </div>
          <Stopwatch startTime={taskStartTime} /> {/*[CHECK] stopwatch isn't a state why doesn't its data reset*/}
        </div>
        : <button onClick={handleStartTask} className="task-form-buttons" type="button">Start</button>
      }
    </form>
    <div className="rank-list">
      <table className="task-list">
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Name</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {
            tasksState.map((element, index) => (
              <tr key={element.createdAt}>
                <td>{playerData[element.createdAt.split('T')[0]]?.username || ""}</td>
                <td>{element.taskName}</td>
                <td>{formatDuration(element.duration)}</td>
              </tr>))
          }
        </tbody>
      </table>
    </div>
  </div>
}

export default Dashboard;