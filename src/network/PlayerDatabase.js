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
}

export default PlayerDatabase;