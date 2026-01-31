import './Dashboard.css'
import { useState, useEffect, useContext, useMemo } from 'react'
import { DatabaseConnectionContext } from '../App';
import TaskDatabase from '../network/TaskDatabase.js';

function Dashboard() {
  const databaseConnection = useContext(DatabaseConnectionContext);
  const taskDatabase = useMemo(
    () => new TaskDatabase(databaseConnection)
    ,[databaseConnection]
  );

  const [tasksState, setTasksState] = useState([]);
  const [fileData, setFileData] = useState(null);
  const [inTaskSession, setInTaskSession] = useState(false);


   // Load tasks when component mounts
   useEffect(() => {
    const loadTasks = async () => {
      const tasks = await taskDatabase.getTasks();
      setTasksState(tasks);
    };
    loadTasks();
  }, [taskDatabase]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

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
    }

    await taskDatabase.addTaskLog(task);

    // Reload tasks after adding  
    const tasks = await taskDatabase.getTasks();
    setTasksState(tasks);
    setInTaskSession(false);

    e.target.reset();
  }

  const handleGiveUpTask = async (e) => {
    e.target.form.reset();
    setInTaskSession(false);
  }

  return <div className="taskDisplay">
    <form action="" className="taskCreationMenu"
      onSubmit={handleSubmit}>
      <div className="formInputs">
        <label>
          Task Name:
          <input type="text" name="taskName" readOnly={inTaskSession}/>
        </label>
        <label>
          Where did you pick to work and why:
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
          How long will this take (minutes):
          <input type="number" name="estimatedDuration" readOnly={inTaskSession}/>
        </label>
        <label>
          How much time for buffer (minutes):
          <input type="number" name="estimatedBuffer" readOnly={inTaskSession}/>
        </label>
      </div>
      {
        inTaskSession ? 
        <div className="taskFormButtons">
          <button>Complete</button>
          <button type="button">Broke Focus</button>
          <button type="button" onClick={handleGiveUpTask}>Give Up</button>
        </div> 
        : <button onClick={() => setInTaskSession(true)} className="taskFormButtons" type="button">Start</button>
      }
    </form>
    <div className="rankList">
      <table className="taskList">
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Est. Time</th>
            <th>Est. Buffer</th>
          </tr>
        </thead>
        <tbody>
          {
            tasksState.map((element, index) => (
              <tr key={element.createdAt}>
                <td>{new Date(element.createdAt).toLocaleDateString()}</td>
                <td>{element.taskName}</td>
                <td>{element.estimatedDuration}</td>
                <td>{element.estimatedBuffer}</td>
              </tr>))
          }
        </tbody>
      </table>
    </div>
  </div>
}

export default Dashboard;
  