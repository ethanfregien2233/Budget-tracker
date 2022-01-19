const indexedDB = window.indexedDB || window.mozIndexedDB || window.msIndexedDB;

let db;

const request = indexedDB.open("budget_db", 1);

request.onsuccess = ({target}) => {
    db = target.result;
    console.log(db);
    if (navigator.onLine) {
        checkDatabase ();
    }
};

request.onupgradeneeded = ({target}) => {
    let db = target.result;
    db.createObjectStore("Pending", {
        autoIncrement: true
    });
};

request.onerror = (event) => {
    console.log("Something went wrong!" + event.target.errorCode);
}

function saveRecord (record) {
    const transaction = db.transaction([ "Pending" ], "readwrite");
    const store = transaction.objectStore("Pending");
    store.add(record);
};

function checkDatabase () {
    const transaction = db.transaction([ "Pending" ], "readwrite");
    const store = transaction.objectStore("Pending");

    const getAll = store.getAll();
    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*", 
                    "Content-Type": "application/json"
                }
            }).then(response => {
                return response.json();
            }).then(() => {
                const transaction = db.transaction([ "Pending" ], "readwrite");
                const store = transaction.objectStore("Pending");

                store.clear();
            })
        }
    }
};

window.addEventListener("online", checkDatabase);