import { openIDB } from "./IDBInit.js";

export function searchIDB() {
  const mainEl = document.querySelector("main");
  const input = document.querySelector(".search-bar");
  const searchResultBox = document.getElementById("js-result-box");
  const searchBtn = document.getElementById("js-search-btn");

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      searchResultBox.replaceChildren();
      handleIDBSearch(searchResultBox, input);
    }
  });

  searchBtn.addEventListener("click", () => {
    searchResultBox.replaceChildren();
    handleIDBSearch(searchResultBox, input);
  });
  searchBtn.addEventListener("touchend", () => {
    searchResultBox.replaceChildren();
    handleIDBSearch(searchResultBox, input);
  });

  input.addEventListener("click", () => {
    searchResultBox.classList.add("result-box-shown");
  });

  input.addEventListener("touchstart", () => {
    searchResultBox.classList.add("result-box-shown");
  });

  mainEl.addEventListener("click", () => {
    searchResultBox.classList.remove("result-box-shown");
  });

  mainEl.addEventListener("touchstart", () => {
    searchResultBox.classList.remove("result-box-shown");
  });
}

const handleIDBSearch = (searchResultBox, input) => {
  openIDB().then((db) => {
    const transaction = db.transaction(["fullImageData"], "readonly");
    const fullImageDataStore = transaction.objectStore("fullImageData");
    const index = fullImageDataStore.index("post_date");
    const getCursorRequest = index.openCursor(null, "prev");

    getCursorRequest.onsuccess = (action) => {
      const cursor = action.target.result;
      const inputValue = input.value;

      if (!cursor) {
        console.log("exhausted all entries");
        return;
      }

      if (cursor.value.tags.find((tag) => tag.match(inputValue))) {
        console.log("found a match", cursor.value);
        const resultContent = document.createElement("div");
        const resultImg = document.createElement("img");
        const resultP = document.createElement("p");
        const hr = document.createElement("hr");
        resultImg.src = cursor.value.highReslinks;
        resultImg.classList.add("search-result-img");
        resultImg.setAttribute("data-high-res-img-id", cursor.value.id);
        resultP.textContent = cursor.value.title;
        resultP.classList.add("search-result-p");
        resultContent.classList.add("search-result-content");

        resultContent.append(resultImg, resultP);
        searchResultBox.append(resultContent, hr);
      }
      cursor.continue();
    };
  });
};
