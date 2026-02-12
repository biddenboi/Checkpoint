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
  
  //First fetch all the players, then use getTasksFromRange for each player and sum up the points. We discard the actual task object after we calculate total # of tasks so at most like 100 tasks in memory at a time before being reduced to a integer.
  const [playerData, setPlayerData] = useState({});
  const [taskStartTime, setTaskStartTime] = useState(null);
  const [durationPenalty, setDurationPenalty] = useState(null);

   // Player updates are ignored from parameters list due to infrequency and that people will likely complete a task by time of first task completion.
   useEffect(() => {
    //empty
  }, [inTaskSession]);

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

  const getTaskDuration = () => {
    return taskStartTime ? Date.now() - taskStartTime : 0;
  }

  const getTaskPoints = () => {
    return Math.floor(getTaskDuration() / 10000);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const duration = getTaskDuration();

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
      duration: getTaskDuration(),  
      points: Math.floor(getTaskPoints() - durationPenalty)
    }

    await taskDatabase.addTaskLog(task);

    // Reload tasks after adding  
    const tasks = await taskDatabase.getTasks();
    setInTaskSession(false); // Reset the start time
    setTaskStartTime(null);  
    setDurationPenalty(null);
    e.target.reset();
  }


  const handleStartTask = () => {
    setInTaskSession(true); //changes visual menu
    setTaskStartTime(Date.now());  // Record when task started
    setDurationPenalty(0);
  }

  const handleGiveUpTask = async (e) => {
    e.target.form.reset();
    setInTaskSession(false);
    setTaskStartTime(null);  // Reset start time when giving up
    setDurationPenalty(0);
  }

  const handleBrokeFocus = async(e) => {
    const penalty = (getTaskPoints() - durationPenalty) / 2;
    setDurationPenalty(Math.floor(penalty + durationPenalty));
    //uses old value of durationpenalty for console log (to simulate fix that)
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
          Where will you work:
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
          Is this being done early:
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
          Est. Duration (minutes):
          <input type="number" name="estimatedDuration" readOnly={inTaskSession}/>
        </label>
        <label>
          Est. Buffer (minutes):
          <input type="number" name="estimatedBuffer" readOnly={inTaskSession}/>
        </label>
      </div>
      {/*[TODO] Consolidate alternative views into seperate react functions */}
      {
        inTaskSession ? 
        <div className="task-session-container">
          <div className="task-form-buttons">
            <button>Complete</button>
            <button type="button" onClick={handleBrokeFocus}>Broke Focus</button>
            <button type="button" onClick={handleGiveUpTask}>Give Up</button>
          </div>
          <Stopwatch startTime={taskStartTime} durationPenalty={durationPenalty}/> 
          
        </div>
        : <button onClick={handleStartTask} className="task-form-buttons" type="button">Start</button>
      }
    </form>
    <div className="rank-list">
      <table className="rank-table">
        <thead>
          <tr>
            <th>Player Name</th>
            <th>Name</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {
            /** 
            tasksState.sort((a, b) => b.points - a.points)
              .map((element, index) => (
              <tr key={element.createdAt}>
                <td>{playerData[element.createdAt.split('T')[0]]?.username || ""}</td>
                <td>{element.taskName}</td>
                <td>{element.points}</td>
              </tr>))
              */
          }
        </tbody>
      </table>
    </div>
  </div>
}

export default Dashboard;