class DatabaseConnection {
    database = null;

    isCompatable() {
        return window.indexedDB;
    }

    async handleVersionUpgrades(event) {
        this.database = event.target.result;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
            const tasksObjectStore = this.database.createObjectStore("tasks", { keyPath: "createdAt"});
            tasksObjectStore.createIndex("taskName", "taskName", { unique:false });

        }
        if (oldVersion < 2) {
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
        }
        if (oldVersion < 3) {
            const playersObjectStore = this.database.createObjectStore("players", { keyPath: "createdAt"});
            playersObjectStore.createIndex("username", "username", { unique:false });
        }

        if (oldVersion < 4) {
            /** Note: Tasks existing without being associated without a player is 
             * handled here as future versions, it is impossible for a task to exist
             * without a player entry corresponding it. (due to App.jsx useEffect).
             */
            const transaction = event.target.transaction;
            const playersObjectStore = transaction.objectStore("players");
            const tasksObjectStore = transaction.objectStore("tasks");

            const getTasksRequest = tasksObjectStore.getAll();

            getTasksRequest.onsuccess = () => {
                const tasks = getTasksRequest.result;
                

                tasks.forEach((task) => {
                    const dateKey = task.createdAt.split('T')[0];

                    const getPlayerRequest = playersObjectStore.get(dateKey);

                    getPlayerRequest.onsuccess = () => {
                        if (!getPlayerRequest.result) {
                            const player = {
                                username: "Unnamed",
                                createdAt: dateKey
                            };
                            
                            playersObjectStore.put(player);
                        }
                    };
                })
            }
        }

        if (oldVersion < 5) {
            const transaction = event.target.transaction;
            const tasksObjectStore = transaction.objectStore("tasks");
            
            //time in milliseconds
            tasksObjectStore.createIndex("duration", "duration");

            // Update all existing tasks to have duration = 0
            const getTasksRequest = tasksObjectStore.getAll();

            getTasksRequest.onsuccess = () => {
                const tasks = getTasksRequest.result;
                
                tasks.forEach((task) => {
                    if (task.duration === undefined) {
                        task.duration = 0;  
                        tasksObjectStore.put(task);
                    }
                });
            };
        }

        if (oldVersion < 6) {
            const transaction = event.target.transaction;
            const tasksObjectStore = transaction.objectStore("tasks");
            
            tasksObjectStore.createIndex("points", "points");

            const getTasksRequest = tasksObjectStore.getAll();

            getTasksRequest.onsuccess = () => {
                const tasks = getTasksRequest.result;
                
                tasks.forEach((task) => {
                    const duration = Number(task.duration) || 0;

                    if (task.points === undefined) {
                        task.points = Math.floor(task.duration / 10000); //miliseconds
                        tasksObjectStore.put(task);
                    }
                });
            };
        }
    }

    constructor() {
        if (!this.isCompatable()) {
            alert("Browser incompatability with IndexDB.");
        } 

        this.ready = new Promise((resolve, reject) => {

            const request = window.indexedDB.open("CheckpointDatabase", 6);

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