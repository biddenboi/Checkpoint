import './App.css'
import { useState, useEffect } from 'react'
import DataHandler from './DataHandler.js'

function App() {
  const [DataHandlerState, setDataHandlerState] = useState(() => new DataHandler());
  const [tasksState, setTasksState] = useState([]);


   // Load tasks when component mounts
   useEffect(() => {
    const loadTasks = async () => {
      const tasks = await DataHandlerState.getTasks();
      setTasksState(tasks);
    };
    loadTasks();
  }, [DataHandlerState]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const task = {
      createdAt: new Date().toISOString(),
      taskName: formData.get("taskName"),
    }

    await DataHandlerState.addTaskLog(task);

    // Reload tasks after adding
    const tasks = await DataHandlerState.getTasks();
    setTasksState(tasks);

    e.target.reset();
  }

  return <div className="taskDisplay">
    <form action="" className="taskCreationMenu"
      onSubmit={handleSubmit}>
      <label>
          Task Name:
          <input type="text" name="taskName"/>
      </label>
      <input type="submit"/>
    </form>
    <table className="taskList">
      <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {
        tasksState.map((element, index) => (
          <tr key={element.createdAt}>
            <td>{new Date(element.createdAt).toLocaleDateString()}</td>
            <td>{element.taskName}</td>
          </tr>
        ))
      }
    </tbody>
    </table>
  </div>
}

export default App
  