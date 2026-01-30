

class DataHandler {
    database = null;

    constructor() {
        if (!this.isCompatable()) {
            alert("Browser incompatability with IndexDB.");
        } 

        this.ready = new Promise((resolve, reject) => {
            const request = window.indexedDB.open("CheckpointDatabase", 1);

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

                    /** 
                    tasksObjectStore.transaction.oncomplete = (event) => {
                        const testData = [
                            {createdAt: "2024-01-02T01:55:57.459Z", username: "hello", taskName: "calc", taskDescription: "calc hw", taskDifficulty: 2}
                        ];
        
                        const tasksObjectStore = this.database
                            .transaction("tasks", "readwrite")
                            .objectStore("tasks");
                        testData.forEach((task) => {
                            tasksObjectStore.add(task);
                        })
                    }*/
                    
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