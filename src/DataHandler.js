

class DataHandler {
    database = null;

    constructor() {
        if (!this.isCompatable()) {
            alert("Browser incompatability with IndexDB.");
        } 

        this.ready = new Promise((resolve, reject) => {
            const request = window.indexedDB.open("CheckpointDatabase", 2);

            request.onerror = (event) => {
                console.error(`Database error: ${event.target.error?.message}`);
                reject(request.error);
            }

            request.onupgradeneeded = (event) => {
                //in future versions - do not recreate object stores that exist.
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
                }
            }

            request.onsuccess = (event) => {
                this.database = event.target.result;
                resolve();
            }
        })
    }
    
    isCompatable() {2
        return window.indexedDB;
    }

    async clearTaskData() {
        return new Promise((resolve, reject) => {
            const transaction = this.database.transaction(["tasks"], "readwrite");
            const tasks = transaction.objectStore("tasks");

            const objectStoreRequest = tasks.clear();

            objectStoreRequest.onsuccess = (e) => {
                resolve();
            }

            objectStoreRequest.onerror = (e) => {
                reject(objectStoreRequest.error);
            }
        })
    }

    //createdAt, username, taskName, taskDescription, taskDifficulty
    async addTaskLog(task) {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.database.transaction(["tasks"], "readwrite");
        
            const tasks = transaction.objectStore("tasks");
            const request = tasks.add(task);  
            
            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }

            return request;
        })
    }

    async removeTaskLog(createdAt) {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.database.transaction(["tasks"], "readwrite");
            const tasksObjectStore = transaction.objectStore("tasks");
            const request = tasksObjectStore.delete(createdAt);

            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }
        })
    }

    async getTasks() {
        await this.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.database.transaction("tasks", "readonly");
            const tasks = transaction.objectStore("tasks");

            const request = tasks.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        })
    }

    async getDataAsJSON() {
        await this.ready;

        return new Promise(async (resolve, reject) => {
            //so what this does is basically convert the data into a string, blob gives the data a location which is in url, and then we create an attribute with download using HTML 5 download method
            const data = await this.getTasks();

            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'taskData.json';
            link.click();

            URL.revokeObjectURL(url); //revoke since blob urls don't get collected by garbage collector
        })
    }

    async getTasksFromRange(startDate, endDate) {
        await this.ready;
     
         return new Promise((resolve, reject) => {
             const transaction = this.database.transaction("tasks", "readonly");
             const tasks = transaction.objectStore("tasks");
             const dateRange = IDBKeyRange.bound(startDate, endDate, false, false);
             const results = [];
     
             tasks.openCursor(dateRange).onsuccess = (event) => {
                 const cursor = event.target.result;
     
                 if (cursor) {
                     results.push(cursor.value);
                     cursor.continue();
                 } else {
                     resolve(results);
                 }
             }
             
             transaction.onerror = () => reject(transaction.error);
         })
     }
     
     async getTask(createdAt) {
         await this.ready;
       
         return new Promise((resolve, reject) => {
           const transaction = this.database.transaction("tasks", "readonly");
           const store = transaction.objectStore("tasks");
       
           const request = store.get(createdAt);
       
           request.onsuccess = () => resolve(request.result);
           request.onerror = () => reject(request.error);
           transaction.onerror = () => reject(transaction.error);
         });
     }
}

export default DataHandler;