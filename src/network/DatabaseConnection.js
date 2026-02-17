class DatabaseConnection {
    database = null;

    isCompatable() {
        return window.indexedDB;
    }

    async handleVersionUpgrades(event) {
    this.database = event.target.result;
    const oldVersion = event.oldVersion;
    const transaction = event.target.transaction;

    if (oldVersion > 0 && oldVersion < 8) {
        console.warn("Database version too old. Please clear your data and refresh.");
    }

    if (oldVersion < 8) {
        const newPlayerStore = this.database.createObjectStore("playerObjectStore", { keyPath: "localCreatedAt" });
        newPlayerStore.createIndex("username", "username", { unique: false });
        newPlayerStore.createIndex("createdAt", "createdAt", { unique: false });

        const newTaskStore = this.database.createObjectStore("taskObjectStore", { keyPath: "localCreatedAt" });
        newTaskStore.createIndex("createdAt", "createdAt", { unique: false });
        newTaskStore.createIndex("distractions", "distractions", { unique: false });
        newTaskStore.createIndex("duration", "duration", { unique: false });
        newTaskStore.createIndex("efficiency", "efficiency", { unique: false });
        newTaskStore.createIndex("estimatedBuffer", "estimatedBuffer", { unique: false });
        newTaskStore.createIndex("estimatedDuration", "estimatedDuration", { unique: false });
        newTaskStore.createIndex("location", "location", { unique: false });
        newTaskStore.createIndex("points", "points", { unique: false });
        newTaskStore.createIndex("reasonToSelect", "reasonToSelect", { unique: false });
        newTaskStore.createIndex("similarity", "similarity", { unique: false });
        newTaskStore.createIndex("taskName", "taskName", { unique: false });
        newTaskStore.createIndex("timeOfStart", "timeOfStart", { unique: false });
    }

    if (oldVersion < 9) {
        const playerStore = transaction.objectStore("playerObjectStore");
        playerStore.createIndex("description", "description", { unique: false });
    }
}
    constructor() {
        if (!this.isCompatable()) {
            alert("Browser incompatability with IndexDB.");
        } 

        this.ready = new Promise((resolve, reject) => {

            //Reminder: when testing version updates change db version and version update if functions at same time
            const request = window.indexedDB.open("CheckpointDatabase", 9);

            request.onerror = (event) => {
                console.error(`Database error: ${event.target.error?.message}`);
                reject(request.error);
            }

            request.onupgradeneeded = async (event) => {
                await this.handleVersionUpgrades(event);
            }

            request.onsuccess = (event) => {
                this.database = event.target.result;
                resolve();
            }
        })
    }
}

export default DatabaseConnection;