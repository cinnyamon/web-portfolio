import { createDOMAndEventHandlers } from "./DOM.js";
import { openIDB } from "./idb-init.js";
import { fetchImages } from "./fetchScript.js";

// dom stuff
const imgContainer = document.querySelector(".image-gallery");
const refreshBtn = document.querySelector(".refresh-button");

export const galleryFetching = () => {
  openIDB()
    .then((db) => {
      const currentTime = Date.now();
      const oneDay = 60 * 60 * 24 * 1000;
      const tenSec = 10000;

      const transaction = db.transaction("lowResImages", "readwrite");
      const lowResImageStore = transaction.objectStore("lowResImages");

      const allImages = lowResImageStore.getAll();

      allImages.onsuccess = async function () {
        // get the last time it fetched new data
        const metadata = await fetchIDBMetadata();
        const lastFetchedTime = metadata.resolvedTime?.time || 0;
        const authorDescription = metadata.resolvedDesc?.summary;
        console.log("author_description", authorDescription);

        try {
          // reverse image order in IDB
          const DBImages = allImages.result;
          DBImages.sort((a, b) => b.timestamp - a.timestamp);
          console.log(
            "currenttime:",
            currentTime,
            "lastFetchedTime:",
            lastFetchedTime,
            "one day:",
            oneDay,
            "fetched time + one day",
            lastFetchedTime + oneDay
          );

          if (lastFetchedTime + oneDay >= currentTime) {
            if (DBImages.length) {
              for (let i = 0; i < DBImages.length; i++) {
                placeImagesInPage(DBImages[i]);
                useAuthorDescription(authorDescription);
              }

              console.log("fetched from DB", DBImages);
              db.close();
              return;
            }
            // if no DB images load from tumblr user
            await insertImages();
            return;
          }
          // if its been more than a day -> data is stale so fetch new
          await insertImages();
        } catch (error) {
          console.error("Error with onsuccess", error);
          db.close();
        }
      };

      refreshBtn.addEventListener("click", (e) => {
        openIDB().then(async (newDB) => {
          console.log("hello");
          imgContainer.replaceChildren(); // removes all children
          await insertImages(newDB);
        });
      });

      const insertImages = async (providedDb = db) => {
        let lowResData = [];
        let fullImageData = [];
        let blogMetadata = [];

        // this is the main logic where i can add backup images in case the fetching fails
        try {
          const data = await fetchImages();
          lowResData = data.lowResData;
          fullImageData = data.fullImageData;
          blogMetadata = data.blogMetadata;
        } catch (error) {
          console.log("fetching images failed");
          const mocks = await fetch("./scripts/mocks.json")
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              return data;
            });

          console.log(mocks);

          fullImageData = mocks.fullImageData;
          lowResData = mocks.lowResData;
        }

        const transaction = providedDb.transaction(
          ["lowResImages", "fullImageData"],
          "readwrite"
        );
        // start lowResData transaction
        const lowResImageStore = transaction.objectStore("lowResImages");
        // start fullImageDataStore transaction
        const fullImageDataStore = transaction.objectStore("fullImageData");

        // run a separate transaction for the time because the tx stops early if one of these fuckers complete like lowresimg or fullimgdata...
        const metaTx = providedDb.transaction("meta", "readwrite");
        const metaStore = metaTx.objectStore("meta");
        const lastFetchedPutReq = metaStore.put({
          key: "lastFetched",
          time: Date.now(),
        });
        const descPutReq = metaStore.put({
          key: "description",
          summary: blogMetadata[0],
        });

        lastFetchedPutReq.onsuccess = () => {
          console.log("successfully added lastFetched to the metastore");
        };
        descPutReq.onsuccess = () => {
          console.log("successfully added description to the metastore");
        };

        // loop through all data gathered from fetch
        for (const dataEntries of lowResData) {
          // dataEntries.lowReslinks = '';
          lowResImageStore.add(dataEntries);
          // handle placing images in page
          placeImagesInPage(dataEntries);
        }
        for (const dataEntries of fullImageData) {
          // dataEntries.highReslinks = '';
          fullImageDataStore.add(dataEntries);
        }

        useAuthorDescription(blogMetadata);

        console.log("fetched images from tumblr", lowResData, fullImageData);
        providedDb.close();
      };

      const placeImagesInPage = (entry) => {
        let imageOpened = false;
        const imagEl = document.createElement("img");

        imagEl.src = entry.lowReslinks;
        imagEl.alt = "Couldn't fetch image from Tumblr or Database.";
        imagEl.classList.add("gallery-lowres-img");
        imagEl.dataset.id = entry.id;
        imgContainer.append(imagEl);

        imagEl.addEventListener("click", () => {
          handleClickingImage(imagEl, imageOpened);
        });
      };

      const handleClickingImage = async (imagEl, imageOpened) => {
        const fullImageDataObj = await fetchImgById(imagEl.dataset.id);

        console.log("fullImageDataObj", fullImageDataObj);
        // if id's dont match exit early
        if (imagEl.dataset.id !== fullImageDataObj.id) return;

        // open the full window container
        if (!imageOpened) {
          imageOpened = true;

          createDOMAndEventHandlers(fullImageDataObj, imageOpened);
        }
      };

      const fetchImgById = async (id) => {
        const fullImgId = openIDB().then((db) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction("fullImageData", "readwrite");

            // start highResData transaction
            const fullImageDataStore = transaction.objectStore("fullImageData");
            const getRequest = fullImageDataStore.get(id);

            getRequest.onsuccess = () => {
              console.log(getRequest.result);
              resolve(getRequest.result);
              db.close();
            };
          });
        });
        return fullImgId;
      };
    })

    .catch((error) => {
      console.error("Failed to open IDB:", error);
    });
};

async function fetchIDBMetadata() {
  const db = await openIDB();
  const transaction = db.transaction("meta", "readwrite");
  const metaStore = transaction.objectStore("meta");

  const lastFetchedTime = new Promise((resolve, reject) => {
    const getLastFetchedRequest = metaStore.get("lastFetched");
    getLastFetchedRequest.onsuccess = () => {
      console.log(getLastFetchedRequest.result);
      resolve(getLastFetchedRequest.result);
      db.close();
    };
  });

  const fetchedDescription = new Promise((resolve, reject) => {
    const getDescriptionRequest = metaStore.get("description");
    getDescriptionRequest.onsuccess = () => {
      console.log(getDescriptionRequest.result);
      resolve(getDescriptionRequest.result);
      db.close();
    };
  });

  const [resolvedTime, resolvedDesc] = await Promise.all([
    lastFetchedTime,
    fetchedDescription,
  ]);

  console.log("resolvedTime:", resolvedTime, "resolvedDesc", resolvedDesc);
  return { resolvedTime, resolvedDesc };
}

const useAuthorDescription = (entry) => {
  const description = document.querySelector(".author-description");
  description.innerHTML = entry;
};
