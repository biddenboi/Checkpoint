import './Settings.css'

function Settings() {
    return <div className="settings">
        {SettingsGroup(
            <>
                <label className="usernameSetting">
                    Username:
                    <input type="text" />
                </label>  
            </>
        )}
    </div>
}

function SettingsGroup(inputs) {
    return <div className="settingsGroup">
        <h3>Personal</h3>
        <hr />
        {inputs}
    </div>
}

export default Settings;