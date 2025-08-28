export function openIDB() {
  return new Promise((resolve, reject) => {
    const indexedDB =
      window.indexedDB ||
      window.mozIndexedDB ||
      window.webkitIndexedDB ||
      window.msIndexedDB ||
      window.shimIndexedDB;

    // +1 the 2nd value if modifying anything in the onupgradeneeded
    const request = indexedDB.open("ImageDB", 9);

    request.onerror = function (event) {
      console.error(event);
      console.error("An error occurred with IndexedDB");
      reject("Error opening the IndexedDB");
    };

    request.onupgradeneeded = function () {
      const db = request.result;

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
      fullImageDataStore.createIndex("post_title", "title", { unique: false });
      fullImageDataStore.createIndex("post_url", "url", { unique: false });
      // create an index so we can search for link and have it return all the links that match will do more indexes in the future

      // and low res image store
      const lowResImageStore = db.createObjectStore("lowResImages", {
        keyPath: "id",
      });
      lowResImageStore.createIndex("image_links", "lowReslinks", {
        unique: true,
      });
      lowResImageStore.createIndex("post_date", "timestamp", { unique: false });

      // create meta table to store last fetched time
      const metaStore = db.createObjectStore("meta", { keyPath: "key" });
      metaStore.createIndex("transaction_time", "time", { unique: false });
      metaStore.createIndex("author_description", "description", {
        unique: false,
      });
    };

    request.onsuccess = (event) => {
      const db = request.result;
      console.log("IndexedDB opened successfully");
      resolve(db);
    };
  });
}

// import { key } from "./apiKey.js";
// import { createDOMAndEventHandlers } from "./DOM.js";
// import { openIDB } from "./idb-init.js";

// // dom stuff
// const imgContainer = document.querySelector(".image-gallery");
// const refreshBtn = document.querySelector(".refresh-button");

// export const galleryFetching = () => {
//   openIDB()
//     .then((db) => {
//       const currentTime = Date.now();
//       const oneDay = 60 * 60 * 24 * 1000;

//       const transaction = db.transaction("lowResImages", "readwrite");
//       const lowResImageStore = transaction.objectStore("lowResImages");

//       const allImages = lowResImageStore.getAll();

//       allImages.onsuccess = async function () {
//         // get the last time it fetched new data
//         const fetchedTime = await getLastFetchedTime();
//         const lastFetched = fetchedTime?.time || 0;

//         try {
//           // reverse image order in IDB
//           const DBImages = allImages.result;
//           DBImages.sort((a, b) => b.timestamp - a.timestamp);

//           if (lastFetched + oneDay >= currentTime) {
//             if (DBImages.length) {
//               for (let i = 0; i < DBImages.length; i++) {
//                 placeImagesInPage(DBImages[i]);

//                 console.log("db loaded it");
//               }

//               console.log("fetched from DB", DBImages);
//               db.close();
//               return;
//             }
//             // if no DB images load from tumblr user
//             await insertImages();
//             return;
//           }
//           // if its been more than a day -> data is stale so fetch new
//           await insertImages();
//         } catch (error) {
//           console.error("Error with onsuccess", error);
//           db.close();
//         }
//       };

//       const insertImages = async () => {
//         console.log("function ran");
//         let lowResData = [];
//         let fullImageData = [];

//         // this is the main logic where i can add backup images in case the fetching fails
//         try {
//           const data = await fetchImages();
//           lowResData = data.lowResData;
//           fullImageData = data.fullImageData;
//         } catch (error) {
//           const mocks = await fetch("./scripts/mocks.json")
//             .then((res) => {
//               return res.json();
//             })
//             .then((data) => {
//               return data;
//             });

//           console.log(mocks);

//           fullImageData = mocks.fullImageData;
//           lowResData = mocks.lowResData;
//         }

//         const transaction = db.transaction(
//           ["lowResImages", "fullImageData"],
//           "readwrite"
//         );

//         // start lowResData transaction
//         const lowResImageStore = transaction.objectStore("lowResImages");
//         // start fullImageDataStore transaction
//         const fullImageDataStore = transaction.objectStore("fullImageData");

//         // run a separate transaction for the time because the tx stops early if one of these fuckers complete like lowresimg or fullimgdata...
//         const metaTx = db.transaction("meta", "readwrite");
//         const metaStore = metaTx.objectStore("meta");
//         metaStore.put({ key: "lastFetched", time: Date.now() });

//         // loop through all data gathered from fetch
//         for (const dataEntries of lowResData) {
//           // dataEntries.lowReslinks = '';

//           console.log(dataEntries);
//           lowResImageStore.add(dataEntries);

//           // handle placing images in page
//           placeImagesInPage(dataEntries);
//         }

//         for (const dataEntries of fullImageData) {
//           // dataEntries.highReslinks = '';

//           // delete idb images
//           fullImageDataStore.add(dataEntries);
//         }

//         console.log("fetched images from tumblr", lowResData, fullImageData);

//         db.close();
//       };

//       const placeImagesInPage = (entry) => {
//         let imageOpened = false;
//         const imagEl = document.createElement("img");

//         imagEl.src = entry.lowReslinks;
//         imagEl.alt = "Couldn't fetch image from Tumblr or Database.";
//         imagEl.classList.add("gallery-lowres-img");
//         imagEl.dataset.id = entry.id;
//         imgContainer.append(imagEl);

//         imagEl.addEventListener("click", () => {
//           handleClickingImage(imagEl, imageOpened);
//         });
//       };

//       const handleClickingImage = async (imagEl, imageOpened) => {
//         const fullImageDataObj = await fetchImgById(imagEl.dataset.id);

//         console.log("fullImageDataObj", fullImageDataObj);
//         // if id's dont match exit early
//         if (imagEl.dataset.id !== fullImageDataObj.id) return;

//         // open the full window container
//         if (!imageOpened) {
//           imageOpened = true;

//           createDOMAndEventHandlers(fullImageDataObj, imageOpened);
//         }
//       };

//       const fetchImgById = async (id) => {
//         return new Promise((resolve, reject) => {
//           const request = indexedDB.open("ImageDB", 7);

//           request.onerror = () => reject(request.error);

//           request.onsuccess = () => {
//             const db = request.result;
//             const transaction = db.transaction("fullImageData", "readwrite");

//             // start highResData transaction
//             const fullImageDataStore = transaction.objectStore("fullImageData");
//             const getRequest = fullImageDataStore.get(id);

//             getRequest.onsuccess = () => {
//               console.log(getRequest.result);
//               resolve(getRequest.result);
//               db.close();
//             };
//           };
//         });
//       };

//       refreshBtn.addEventListener("click", (e) => {
//         openIDB().then(async (db) => {
//           imgContainer.replaceChildren(); // removes all children
//           await insertImages(db);
//         });
//       });
//     })
//     .catch((error) => {
//       console.error("Failed to open IDB:", error);
//     });
// };

// const fetchImages = async () => {
//   // api stuff
//   const apiBlogName = "wtfremex";
//   const apiPostType = "photo";
//   const apiKey = key();
//   const apiOptions = "&npf=true";

//   const response = await fetch(
//     `https://api.tumblr.com/v2/blog/${apiBlogName}/posts/${apiPostType}?api_key=${apiKey}${apiOptions}`
//   );

//   const parsed = await response.json();
//   const status = parsed.meta.status;
//   if (status < 200 || status > 299) return;

//   // highResImageStore shit in arrays instead of sending directly to the idb because i want a separate function for that
//   let fullImageData = [];
//   let lowResData = [];
//   const parsedResponse = parsed.response;

//   for (let i = 0; i < parsedResponse.posts.length; i++) {
//     // skip past reblogs (they all contain this object key)
//     if (parsedResponse.posts[i].parent_post_url) continue;

//     // every single post
//     const post = parsedResponse.posts[i];

//     for (let j = 0; j < post.content.length; j++) {
//       // all content (images,text,etc) inside of a post
//       const postContent = post.content[j];

//       // we're only interested in the image content for now
//       if (postContent.type === "image") {
//         for (let k = 0; k < postContent.media.length; k++) {
//           // console.log('post content with all dimensions:',
//           // postContent.media[k])
//           const media = postContent.media[k];

//           if (media.has_original_dimensions) {
//             fullImageData.push({
//               id: media.media_key.split(":")[0],
//               highReslinks: media.url,
//               timestamp: new Date(post.date),
//               tags: post.tags,
//               notes: post.note_count,
//               title: post.summary,
//               url: post.short_url,
//             });
//           } else if (media.width === 500) {
//             lowResData.push({
//               id: media.media_key.split(":")[0],
//               lowReslinks: media.url,
//               timestamp: new Date(post.date),
//             });
//           }
//         }
//       }
//     }
//   }

//   return { fullImageData, lowResData };
// };

// async function getLastFetchedTime() {
//   openIDB().then((db) => {
//     return new Promise((resolve, reject) => {
//       const transaction = db.transaction("meta", "readwrite");

//       // start highResData transaction
//       const metaStore = transaction.objectStore("meta");

//       const getRequest = metaStore.get("lastFetched");

//       getRequest.onsuccess = () => {
//         console.log(getRequest.result);
//         resolve(getRequest.result);
//         db.close();
//       };
//     });
//   });
// }
