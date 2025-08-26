import { key } from "./apiKey.js";


export const galleryFetching = () => {
  // dom stuff
  const imgContainer = document.querySelector('.image-gallery');
  const mainEl = document.querySelector('main');

  // DB stuff
  const indexedDB = 
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

  //sec value is the version of the db can increment on update
  const request = indexedDB.open('ImageDB', 3);

  // api stuff
  const apiBlogName = 'wtfremex';
  const apiPostType = 'photo'
  const apiKey = key();
  const apiOptions = '&npf=true'


  request.onerror = function (event) {
    console.error(event);
    console.error('An error occurred with IndexedDB');
  }

  request.onupgradeneeded = function () {
    const db = request.result;

    // create full post data store
    const fullImageDataStore = db.createObjectStore('fullImageData', { keyPath: 'id' });
    fullImageDataStore.createIndex('image_links', 'highReslinks', { unique: true });
    fullImageDataStore.createIndex('post_date', 'timestamp', { unique: false });
    fullImageDataStore.createIndex('post_tags', 'tags', { unique: false });
    fullImageDataStore.createIndex('post_note_count', 'notes', { unique: false });
    fullImageDataStore.createIndex('post_title', 'title', { unique: false });
    fullImageDataStore.createIndex('post_url', 'url', { unique: false });
    // create an index so we can search for link and have it return all the links that match will do more indexes in the future

    // and low res image store
    const lowResImageStore = db.createObjectStore('lowResImages', { keyPath: 'id'});
    lowResImageStore.createIndex('image_links', 'lowReslinks', { unique: true });
    lowResImageStore.createIndex('post_date', 'timestamp', { unique: false })

  }

  request.onsuccess = async function () {
    
    const db = request.result;
    const transaction = db.transaction('lowResImages', 'readwrite');
    const lowResImageStore = transaction.objectStore('lowResImages');
    const allImages = lowResImageStore.getAll();

    try {
      allImages.onsuccess = async function () {
        // reverse DBImages because the oldest post is first in returned array
        const DBImages = allImages.result;

        // sort db array in descending order from latest to oldest
        DBImages.sort((a, b) => b.timestamp - a.timestamp)
        
        // handle loading images from DB if there are any 
        if (DBImages.length) {
          for (let i = 0; i < DBImages.length; i++) {
            placeImagesInPage(allImages.result[i]);

            console.log('fetched from DB', allImages.result[i].lowReslinks)

            console.log('date in seconds', Date.now())
          }

          db.close()
          return
        }
        // if no DB images load from tumblr user
        insertImages();
      }
    } catch (error) {
      console.error(error)
      db.close();
    }
  };


  const fetchImages = async () => {
    const response = await fetch(`https://api.tumblr.com/v2/blog/${apiBlogName}/posts/${apiPostType}?api_key=${apiKey}${apiOptions}`);
    
    const parsed = await response.json();
    const status = parsed.meta.status
    if (status < 200 || status > 299) return;


    // highResImageStore shit in arrays instead of sending directly to the idb because i want a separate function for that
    let fullImageData = [];
    let lowResData = [];
    const parsedResponse = parsed.response;
    
    for (let i = 0; i < parsedResponse.posts.length; i++) {
      // skip past reblogs (they all contain this object key)
      if (parsedResponse.posts[i].parent_post_url) continue;

      // every single post
      const post = parsedResponse.posts[i];


      for (let j = 0; j < post.content.length; j++) {
        // all content (images,text,etc) inside of a post
        const postContent = post.content[j];

        // we're only interested in the image content for now
        if (postContent.type === 'image') {
          for (let k = 0; k < postContent.media.length; k++) {
            // console.log('post content with all dimensions:', 
            // postContent.media[k])
            const media = postContent.media[k];
            
            if (media.has_original_dimensions) {
              fullImageData.push({
                id: media.media_key.split(':')[0],
                highReslinks: media.url,
                timestamp: new Date(post.date),
                tags: post.tags,
                notes: post.note_count,
                title: post.summary,
                url: post.short_url
              })
            } else if (media.width === 500) {
              lowResData.push({
                id: media.media_key.split(':')[0],
                lowReslinks: media.url,
                timestamp: new Date(post.date)
              })
            }
          }
        }
      }
    }
    
    return { fullImageData, lowResData }
  }


  const insertImages = async () => {
    // wait to fetch all images
    const { fullImageData, lowResData } = await fetchImages()

    const db = request.result;
    const transaction = db.transaction(['lowResImages', 'fullImageData'], 'readwrite');

    // start lowResData transaction
    const lowResImageStore = transaction.objectStore('lowResImages');
    // start fullImageDataStore transaction
    const fullImageDataStore = transaction.objectStore('fullImageData');



    // loop through all data gathered from fetch
    for ( const dataEntries of lowResData ) {
      // add to IDB lowResImageStore
      lowResImageStore.add(dataEntries)

      // handle placing images in page
      placeImagesInPage(dataEntries)
      console.log('fetched images from tumblr', dataEntries.lowReslinks);
    }

    for ( const dataEntries of fullImageData ) {
      // add to IDB highResImageStore
      fullImageDataStore.add(dataEntries)
    }
    db.close()

  }

  const placeImagesInPage = (entry) => {
    let imageOpened = false;
    const imagEl = document.createElement('img');
  
    imagEl.src = entry.lowReslinks;
    imagEl.alt = "Couldn't fetch image from Tumblr or Database.";
    imagEl.classList.add('gallery-lowres-img')
    imagEl.dataset.id = entry.id
    imgContainer.append(imagEl);

    imagEl.addEventListener('click', () => {
      handleClickingImage(imagEl, imageOpened)
    })
  }

  const handleClickingImage = async (imagEl, imageOpened) => {
    const fullImageDataObj = await fetchImgById(imagEl.dataset.id);

    console.log('fullImageDataObj', fullImageDataObj)
    // if id's dont match exit early
    if(imagEl.dataset.id !== fullImageDataObj.id) return; 
    

    
    if (!imageOpened) {
      imageOpened = true;



      // image viewer 
      const fullSizeImgContainer = document.createElement('div');
  
      // actual full size img
      const fullSizeImgWrapper = document.createElement('div');
      const fullSizeImgEl = document.createElement('img');
      

      // create post data elements


      // post info container
      const postInfoEl = document.createElement('div');

      // post title
      const postTitle = document.createElement('h2');

      // post likes and icon
      const postNoteCountBtn = document.createElement('button');
      const postNoteHeart = document.createElement('img');
      const postNoteCount = document.createElement('p');

      // post tags 
      const postTagsDiv = document.createElement('div');

      // post links
      const postLinkDiv = document.createElement('div')
      const postLink = document.createElement('a');




      // image and info container 
      fullSizeImgContainer.classList.add('full-size-img-container');

      // full size image 
      fullSizeImgWrapper.classList.add('full-size-img-wrapper');
      fullSizeImgEl.src = fullImageDataObj.highReslinks;
      fullSizeImgEl.classList.add('full-size-image')

      // post info container
      postInfoEl.classList.add('post-info-container');

      // post title
      postTitle.textContent = `[ ${fullImageDataObj.title} ]`;
      postTitle.classList.add('post-title');

      // post likes and icon
      postNoteHeart.src = '../assets/pixel-heart.svg'
      postNoteHeart.classList.add('post-heart-icon');
      postNoteCount.innerHTML = fullImageDataObj.notes;
      postNoteCountBtn.classList.add('post-notes-btn');

      // post tags
      postTagsDiv.classList.add('post-tags-div');
      for (let x of fullImageDataObj.tags) {
        console.log(x)
        const postTags = document.createElement('p');
        postTags.textContent = x;
        postTagsDiv.append(postTags);
      }

      // post original link
      postLink.href = fullImageDataObj.url;
      postLink.textContent = 'Original Post';
      postLink.classList.add('post-link-text');
      postLinkDiv.classList.add('post-link-div');


      // append elements to respective divs
      postNoteCountBtn.append(postNoteHeart, postNoteCount);
      postLinkDiv.append(postLink);
      postInfoEl.append(
        postTitle,
        postNoteCountBtn,
        postTagsDiv,
        postLinkDiv,
      )

      fullSizeImgWrapper.append(
        fullSizeImgEl,
      )

      fullSizeImgContainer.append(
        fullSizeImgWrapper,
        postInfoEl
      )
      mainEl.append(fullSizeImgContainer);



      // handle clicking outside the image to close it.
      fullSizeImgContainer.addEventListener('click', (e) => {
        if (!fullSizeImgEl.contains(e.target)) {
          fullSizeImgContainer.remove()
          imageOpened = false
        }
      })

      // handle zooming into the full size image 
      let zoomedInto = false
      fullSizeImgEl.addEventListener('click', (e) => {
        if (!zoomedInto) {
          const fullSizeImgRect = fullSizeImgEl.getBoundingClientRect();
          const offSetX = e.clientX - fullSizeImgRect.left
          const offSetY = e.clientY - fullSizeImgRect.top
          const percentX = (offSetX / fullSizeImgRect.width) * 100;
          const percentY = (offSetY / fullSizeImgRect.height) * 100;

          fullSizeImgEl.style.transformOrigin = `${percentX}% ${percentY}%`;
          fullSizeImgEl.style.transform = 'scale(2)';
          fullSizeImgEl.classList.add('zoomed-in');
          zoomedInto = true;
        } else {
          fullSizeImgEl.style.transform = 'scale(1)';
          fullSizeImgEl.classList.remove('zoomed-in');
          zoomedInto = false;
        }
      })
    }
  }

  const fetchImgById = async (id) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ImageDB', 3);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction('fullImageData', 'readwrite');
      
        // start highResData transaction
        const fullImageDataStore = transaction.objectStore('fullImageData');
  
        const getRequest = fullImageDataStore.get(id);
        
  
        getRequest.onsuccess = () => {
          console.log(getRequest.result);
          resolve(getRequest.result);
          db.close()
        }
      }
      
    })
  }
}