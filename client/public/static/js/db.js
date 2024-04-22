const DB_VERSION = 1;

const db = new Dexie("roocket");
db.version(DB_VERSION).stores({
    products: 'id',
    syncProducts : 'title'
});
