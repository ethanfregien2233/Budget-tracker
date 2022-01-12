let db;
const request = indexedDB.open("budget", 1);

function newRecord(record) {
  const transaction = db.transaction(["loading"], "readwrite");
  const store = transaction.objectStore("loading");

  store.add(record);
}

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;

  
  if (navigator.onLine) {
    checkDB();
  }
};

request.onerror = function (event) {
  console.log("Uh oh " + event.target.errorCode);
};

function checkDB() {
  const transaction = db.transaction(["loading"], "readwrite");
  const store = transaction.objectStore("loading");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["loading"], "readwrite");
          const store = transaction.objectStore("loading");
          store.clear();
        });
    }
  };
}
function deleteLoading() {
  const transaction = db.transaction(["loading"], "readwrite");
  const store = transaction.objectStore("loading");
  store.clear();
}

window.addEventListener("online", checkDB); 