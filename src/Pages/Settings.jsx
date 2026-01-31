import './Settings.css'
import { useContext, useMemo } from 'react';
import { DatabaseConnectionContext } from '../App';
import PlayerDatabase from "../network/PlayerDatabase";

function Settings() {
    const databaseConnection = useContext(DatabaseConnectionContext);
    const playerDatabase = useMemo(
        () => new PlayerDatabase(databaseConnection)
        ,[databaseConnection]
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formData = new FormData(e.target);
    
        const player = {
            username: formData.get("username"),
            createdAt: new Date().toISOString().split('T')[0]
        }
        await playerDatabase.putPlayer(player);
    }
    

    return <form onSubmit={handleSubmit} className="settings">
        {SettingsGroup("Personal",
            <>
                <label className="usernameSetting">
                    Username:
                    <input type="text" placeholder='PLACEHOLDER' name="username"/>
                </label>  
            </>
        )}

        <hr />

        <button>Save Changes</button>

        <br />

        {SettingsGroup("Data",
            <>
                <label className="usernameSetting">
                    Download File Data:
                    <input type="text" placeholder='PLACEHOLDER' name="username"/>
                </label>  
            </>
        )}
    </form>
}

function SettingsGroup(category, inputs) {
    return <div className="settingsGroup">
        <h3>{category}</h3>
        <hr />
        {inputs}
    </div>
}

export default Settings;