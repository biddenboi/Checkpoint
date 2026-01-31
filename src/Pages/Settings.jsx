import './Settings.css'
import { useContext, useMemo, useState } from 'react';
import { DatabaseConnectionContext } from '../App';
import PlayerDatabase from "../network/PlayerDatabase";
import TaskDatabase from '../network/TaskDatabase';

function Settings() {
    const databaseConnection = useContext(DatabaseConnectionContext);
    const playerDatabase = useMemo(
        () => new PlayerDatabase(databaseConnection)
        ,[databaseConnection]
    );
    const taskDatabase = useMemo(
        () => new TaskDatabase(databaseConnection)
        ,[databaseConnection]
    );

    const [playerFileData, setPlayerFileData] = useState(null);
    const [taskFileData, setTaskFileData] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData(e.target);
    
        const player = {
            username: formData.get("username"),
            createdAt: new Date().toISOString().split('T')[0]
        }
        await playerDatabase.putPlayer(player);
    }

    //task data interaction methods
    const handleTaskUpload = async (e) => {
    
        const tasksAsJSONString = await taskFileData.text();
        taskDatabase.clearTaskData();
    
        JSON.parse(tasksAsJSONString).forEach((task) => {
          taskDatabase.addTaskLog(task);
        })
    
        const tasks = await taskDatabase.getTasks();
        setTasksState(tasks);
      } 
      const handleTaskDownload = async (e) => {
        await taskDatabase.getDataAsJSON();
      }

      //player data interaction methods
      const handlePlayerUpload = async (e) => {
    
        const playersAsJSONString = await playerFileData.text();
        playerDatabase.clearTaskData();
    
        JSON.parse(playersAsJSONString).forEach((player) => {
            playerDatabase.addTaskLog(player);
        })
    
        const players = await playerDatabase.getTasks();
        setTasksState(players);
      } 
      const handlePlayerDownload = async (e) => {
        await playerDatabase.getDataAsJSON();
      }
      

    return <form onSubmit={handleSubmit} className="settings">
        {SettingsGroup("Personal",
            <>
                <label className="username-settings">
                    Username:
                    <input type="text" placeholder='PLACEHOLDER' name="username"/>
                </label>  
            </>
        )}

        <hr />

        <button className="save-changes">Save Changes</button>

        <br />

        {SettingsGroup("Data",
            <>
                <label>
                    Download Task Data:
                    <button type="button" onClick={handleTaskDownload}>Download</button>
                </label>  
                <label>
                    Download Player Data:
                    <button type="button" onClick={handlePlayerDownload}>Download</button>
                </label>  
                <label>
                    Upload Task Data:
                    <div>
                        <input type="file" 
                        accept=".json" 
                        onChange={
                            async e => setTaskFileData(e.target.files[0])
                        }/>
                        <button type="button" onClick={handleTaskUpload}>Upload</button>
                    </div>
                </label>  
                <label>
                    Upload Player Data:
                    <div>
                        <input type="file" 
                        accept=".json" 
                        onChange={
                            async e => setPlayerFileData(e.target.files[0])
                        }/>
                        <button type="button" onClick={handlePlayerUpload}>Upload</button>
                    </div>
                </label>  
            </>
        )}
    </form>
}

function SettingsGroup(category, inputs) {
    return <div className="settings-group">
        <h3>{category}</h3>
        <hr />
        {inputs}
    </div>
}

export default Settings;