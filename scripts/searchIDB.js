import { openIDB } from "./idb-init.js";

export async function searchIDB() {
  const input = document.querySelector(".search-bar");
  console.log(input.value);
  const db = await openIDB();

  const transaction = db.transaction(["fullImageData"], "readonly");
  const fullImageDataStore = transaction.objectStore("fullImageData");
  const getCursorRequest = fullImageDataStore.openCursor();

  getCursorRequest.onsuccess = (e) => {
    const cursor = e.target.result;

    if (cursor) {
      console.log(cursor.value);
      cursor.continue();
    } else {
      console.log("exhausted all entries");
    }
  };
}
