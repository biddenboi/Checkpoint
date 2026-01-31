import './Settings.css'

function Settings() {
    return <form action="" className="settings">
        {SettingsGroup(
            <>
                <label className="usernameSetting">
                    Username:
                    <input type="text" />
                </label>  
            </>
        )}
        <hr />
        <button>Save Changes</button>
    </form>
        
}

function SettingsGroup(inputs) {
    return <div className="settingsGroup">
        <h3>Personal</h3>
        <hr />
        {inputs}
    </div>
}

export default Settings;