class PlayerDatabase {
    databaseConnection = null;

    constructor(databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    async putPlayer(player) {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction(["players"], "readwrite");

            const players = transaction.objectStore("players");
            const request = players.put(player);

            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }

            return request;
        })
    }

    async createPlayer(username) {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction(["players"], "readwrite");
            const players = transaction.objectStore("players");

            const dateKey = new Date().toISOString().split('T')[0];
            const request = players.get(dateKey);

            request.onsuccess = (event) => {
                const result = request.result;

                if (result === undefined) {
                    const player = {
                        createdAt: dateKey,
                        username: username
                    }
                    players.add(player)
                }else {
                    //player already exists
                }
            }

            request.onerror = (event) => {
                reject(request.error);
            }

            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }
        })
    }

    async clearPlayerData() {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction(["players"], "readwrite");
            const players = transaction.objectStore("players");

            const objectStoreRequest = players.clear();

            objectStoreRequest.onsuccess = (e) => {
                resolve();
            }

            objectStoreRequest.onerror = (e) => {
                reject(objectStoreRequest.error);
            }
        })
    }

    async getPlayers() {
        await this.databaseConnection.ready;

        return new Promise((resolve, reject) => {
            const transaction = this.databaseConnection.database.transaction("players", "readonly");
            const players = transaction.objectStore("players");

            const request = players.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            transaction.onerror = () => reject(transaction.error);
        })
    }

    async getDataAsJSON() {
        await this.databaseConnection.ready;

        return new Promise(async (resolve, reject) => {
            //so what this does is basically convert the data into a string, blob gives the data a location which is in url, and then we create an attribute with download using HTML 5 download method
            const data = await this.getPlayers();

            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'playerData.json';
            link.click();

            URL.revokeObjectURL(url); //revoke since blob urls don't get collected by garbage collector
        })
    }
}

export default PlayerDatabase;