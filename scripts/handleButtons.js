import { insertImages } from "./gallery.js";
import { openIDB } from "./IDBInit.js";

export function handleButtons() {
  handleLinkBtns();
  handleRefreshBtn();
  handleDeleteIDBBtn();
}

function handleLinkBtns() {
  const xBtn = document.getElementById("x-link");
  const tumblrBtn = document.getElementById("tumblr-link");
  const pixivBtn = document.getElementById("pixiv-link");

  console.log(xBtn, tumblrBtn, pixivBtn);

  xBtn.addEventListener("click", () => {
    location.href = "https://x.com/wtfremex";
  });
  tumblrBtn.addEventListener("click", () => {
    location.href = "https://wtfremex.tumblr.com/";
  });
  pixivBtn.addEventListener("click", () => {
    location.href = "https://pixiv.net/users/52178837";
  });
}

function handleRefreshBtn() {
  const refreshBtn = document.querySelector(".refresh-button");
  const imgContainer = document.querySelector(".image-gallery");

  refreshBtn.addEventListener("click", (e) => {
    openIDB().then(async (newDB) => {
      imgContainer.replaceChildren(); // removes all children
      await insertImages(newDB);
    });
  });
}

function handleDeleteIDBBtn() {
  const deleteIDBBtn = document.getElementById("js-delete-idb");
  deleteIDBBtn.addEventListener("click", () => {
    const indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;
    const request = indexedDB.deleteDatabase("ImageDB");

    request.onerror = () => {
      console.error("Error deleting database");
    };

    request.onsuccess = (e) => {
      console.log("IndexedDB deleted successfully.");

      setTimeout(() => {
        location.reload();
      }, 1000);
    };
  });
}

export function handleLikeBtn(postNoteCountBtn, fullImageDataObj) {
  postNoteCountBtn.addEventListener("click", (e) => {
    location.href = fullImageDataObj.url;
  });
}

export function handleCloseBtn(
  closeBtn,
  fullSizeImgEl,
  fullSizeImgContainer,
  imageOpened
) {
  closeBtn.addEventListener("click", (e) => {
    if (!fullSizeImgEl.contains(e.target)) {
      fullSizeImgContainer.remove();
      imageOpened = false;
    }
  });
}
