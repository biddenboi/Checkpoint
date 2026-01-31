class DatabaseConnection {
    database = null;

    isCompatable() {2
        return window.indexedDB;
    }

    async handleVersionUpgrades(event) {
        this.database = event.target.result;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
            const tasksObjectStore = this.database.createObjectStore("tasks", { keyPath: "createdAt"});
            tasksObjectStore.createIndex("taskName", "taskName", { unique:false });

        }else if (oldVersion < 2) {
            this.database = event.target.result;
            const transaction = event.target.transaction; //special type of transaction for versionchange
            const tasksObjectStore = transaction.objectStore("tasks");
            
            tasksObjectStore.createIndex("location", "location");
            tasksObjectStore.createIndex("distractions", "distractions");
            tasksObjectStore.createIndex("similarity", "similarity");
            tasksObjectStore.createIndex("timeOfStart", "timeOfStart");
            tasksObjectStore.createIndex("reasonToSelect", "reasonToSelect");
            tasksObjectStore.createIndex("efficiency", "efficiency");
            tasksObjectStore.createIndex("estimatedDuration", "estimatedDuration");
            tasksObjectStore.createIndex("estimatedBuffer", "estimatedBuffer");

            tasksObjectStore.oncomplete = (event) => {
                const tasksObjectStore = this.database
                    .transaction("tasks", "readwrite")
                    .objectStore("tasks");
                
                    const getAllRequest = tasksObjectStore.getAll();

                    getAllRequest.oncomplete = () => {
                        const tasks = getAllRequest.result;

                        tasks.forEach((task) => {
                            task.location = task.location || "";
                            task.distractions = task.distractions || "";
                            task.similarity = task.similarity || "";
                            task.timeOfStart = task.timeOfStart || "";
                            task.reasonToSelect = task.reasonToSelect || "";
                            task.efficiency = task.efficiency || "";
                            task.estimatedDuration = task.estimatedDuration || "";
                            task.estimatedBuffer = task.estimatedBuffer || "";
                            
                            tasksObjectStore.put(task);
                        })
                    }
            }
            
        /** to store (existing) data
            https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
        */  
        }else if (oldVersion < 3) {
            const playersObjectStore = this.database.createObjectStore("players", { keyPath: "createdAt"});
            playersObjectStore.createIndex("username", "username", { unique:false });
        }
    }

    constructor() {
        if (!this.isCompatable()) {
            alert("Browser incompatability with IndexDB.");
        } 

        this.ready = new Promise((resolve, reject) => {
            const request = window.indexedDB.open("CheckpointDatabase", 3);

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