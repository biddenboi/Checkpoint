import './Settings.css'

const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    console.log(formData.get("username"))
}

function Settings() {
    return <form onSubmit={handleSubmit} className="settings">
        {SettingsGroup(
            <>
                <label className="usernameSetting">
                    Username:
                    <input type="text" placeholder='PLACEHOLDER' name="username"/>
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