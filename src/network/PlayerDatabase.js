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
            const request = players.add(player);

            transaction.oncomplete = (event) => {
                resolve();
            }

            transaction.onerror = (event) => {
                reject(transaction.error);
            }

            return request;
        })
    }
}

export default PlayerDatabase;