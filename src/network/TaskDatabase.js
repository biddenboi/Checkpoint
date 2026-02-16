class TaskDatabase {
    databaseConnection = null;

    constructor(databaseConnection) {
        this.databaseConnection = databaseConnection;  
    }
    
    async clearTaskData() {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction(["taskObjectStore"], "readwrite");
            const tasks = transaction.objectStore("taskObjectStore");

            const objectStoreRequest = tasks.clear();

            objectStoreRequest.onsuccess = (e) => {
                resolve();
            }

            objectStoreRequest.onerror = (e) => {
                reject(objectStoreRequest.error);
            }
        })
    }

    //localCreatedAt, username, taskName, taskDescription, taskDifficulty
    async addTaskLog(task) {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction(["taskObjectStore"], "readwrite");
        
            const tasks = transaction.objectStore("taskObjectStore");
            const request = tasks.put(task);  
            
            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }

            return request;
        })
    }
    async removeTaskLog(localCreatedAt) {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction(["taskObjectStore"], "readwrite");
            const tasksObjectStore = transaction.objectStore("taskObjectStore");
            const request = tasksObjectStore.delete(localCreatedAt);

            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }
        })
    }
    async getTasks() {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction("taskObjectStore", "readonly");
            const tasks = transaction.objectStore("taskObjectStore");

            const request = tasks.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        })
    }
    async getDataAsJSON() {
        await this.databaseConnection.ready;

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
        await this.databaseConnection.ready;
     
         return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction("taskObjectStore", "readonly");
            const tasks = transaction.objectStore("taskObjectStore");
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
    async getTask(localCreatedAt) {
        await this.databaseConnection.ready;
       
        return new Promise((resolve, reject) => {
           const transaction = this.databaseConnection.database.transaction("taskObjectStore", "readonly");
           const store = transaction.objectStore("taskObjectStore");
       
           const request = store.get(localCreatedAt);
       
           request.onsuccess = () => resolve(request.result);
           request.onerror = () => reject(request.error);
           transaction.onerror = () => reject(transaction.error);
         });
    }
}

export default TaskDatabase;