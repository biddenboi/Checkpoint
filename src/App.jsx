import './App.css'
import { useState, useEffect } from 'react'
import DataHandler from './DataHandler.js'

function App() {
  const [DataHandlerState, setDataHandlerState] = useState(() => new DataHandler());
  const [tasksState, setTasksState] = useState([]);
  const [fileData, setFileData] = useState(null);


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

  const handleUpload = async (e) => {
    
    const tasksAsJSONString = await fileData.text();
    DataHandlerState.clearTaskData();

    JSON.parse(tasksAsJSONString).forEach((task) => {
      DataHandlerState.addTaskLog(task);
    })

    const tasks = await DataHandlerState.getTasks();
    setTasksState(tasks);
  } 

  const handleDownload = async (e) => {
    await DataHandlerState.getDataAsJSON();
  }

  return <div className="taskDisplay">
    <form action="" className="taskCreationMenu"
      onSubmit={handleSubmit}>
      <div className="formInputs">
        <label>
          Task Name:
          <input type="text" name="taskName"/>
        </label>
        <label>
          Where did you pick to work and why:
          <input type="text" name="taskName"/>
        </label>
        <label>
          Where are your distractions:
          <input type="text" name="taskName"/>
        </label>
        <label>
          Is this task similar to what you did before:
          <input type="text" name="taskName"/>
        </label>
        <label>
          Is this being done early in the day:
          <input type="text" name="taskName"/>
        </label>
        <label>
          Why did you pick this task:
          <input type="text" name="taskName"/>
        </label>
        <label>
          How will you maximize efficiency:
          <input type="text" name="taskName"/>
        </label>
        <label>
          How long will this take:
          <input type="text" name="taskName"/>
        </label>
        <label>
          How much time for buffer:
          <input type="text" name="taskName"/>
        </label>
      </div>
      <input type="submit" name="fileData"/>
    </form>
    <div className="rankList">
      <div>
        <input type="file"
          accept=".json"
          onChange={
          async e => setFileData(e.target.files[0])} />
        <button onClick={handleUpload}>Upload</button>
        <button onClick={handleDownload}>Download</button>
      </div>
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
              </tr>))
          }
        </tbody>
      </table>
    </div>
  </div>
}

export default App
  