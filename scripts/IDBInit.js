export function openIDB() {
  return new Promise((resolve, reject) => {
    const indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    const IDB_CURRENT_VERSION = 10;
    const IDB_NAME = "ImageDB";

    // +1 the 2nd value if modifying anything in the onupgradeneeded
    const request = indexedDB.open(IDB_NAME, IDB_CURRENT_VERSION);

    request.onblocked = (event) => {
      // If some other tab is loaded with the database, then it needs to be closed
      // before we can proceed.
      alert("Please close all other tabs with this site open!");
    };

    request.onerror = function (event) {
      console.error(event);
      console.error("An error occurred with IndexedDB");
      reject("Error opening the IndexedDB");
    };

    request.onupgradeneeded = function (event) {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion < 1) {
        // create low res image store
        const lowResImageStore = db.createObjectStore("lowResImages", {
          keyPath: "id",
        });
        lowResImageStore.createIndex("image_links", "lowReslinks", {
          unique: true,
        });
        lowResImageStore.createIndex("post_date", "timestamp", {
          unique: false,
        });
      }

      if (oldVersion < 3) {
        // create full post data store
        const fullImageDataStore = db.createObjectStore("fullImageData", {
          keyPath: "id",
        });
        fullImageDataStore.createIndex("image_links", "highReslinks", {
          unique: true,
        });
        fullImageDataStore.createIndex("post_date", "timestamp", {
          unique: false,
        });
        fullImageDataStore.createIndex("post_tags", "tags", { unique: false });
        fullImageDataStore.createIndex("post_note_count", "notes", {
          unique: false,
        });
        fullImageDataStore.createIndex("post_title", "title", {
          unique: false,
        });
        fullImageDataStore.createIndex("post_url", "url", { unique: false });
      }

      if (oldVersion < 5) {
        const fullImageDataStore =
          event.target.transaction.objectStore("fullImageData");

        // Only add this index if it doesn't already exist
        if (!fullImageDataStore.indexNames.contains("post_url")) {
          fullImageDataStore.createIndex("post_url", "url", { unique: false });
          // create an index so we can search for link and have it return all the links that match will do more indexes in the future
        }
      }

      if (oldVersion < 7) {
        // create meta table to store last fetched time
        const metaStore = db.createObjectStore("meta", { keyPath: "key" });
        metaStore.createIndex("transaction_time", "time", { unique: false });
        metaStore.createIndex("author_description", "description", {
          unique: false,
        });
      }
    };

    request.onsuccess = (event) => {
      const db = request.result;

      db.onversionchange = () => {
        db.close();
        alert(
          "A new version of this page is ready. Please reload or close this tab!"
        );
      };
      console.log("IndexedDB opened successfully");
      resolve(db);
    };
  });
}
