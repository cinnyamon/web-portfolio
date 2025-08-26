const mainEl = document.querySelector('main');
const refreshBtn = document.querySelector('.refresh-button');

console.log(refreshBtn)

export const createDOMAndEventHandlers = (fullImageDataObj, imageOpened) => {
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

  // post likes and tags container
  const postTagsLikesCont = document.createElement('div');

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

  // post tags and likes container
  postTagsLikesCont.classList.add('likes-tags-container');

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
  postTagsLikesCont.append(postNoteCountBtn, postTagsDiv);
  postLinkDiv.append(postLink);
  postInfoEl.append(
    postTitle,
    postTagsLikesCont,
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



  let zoomedInto = false

  handleContainerFunctionality(imageOpened, zoomedInto, fullSizeImgContainer, fullSizeImgEl, postNoteCountBtn, fullImageDataObj)
}

const handleContainerFunctionality = (imageOpened, zoomedInto, fullSizeImgContainer, fullSizeImgEl, postNoteCountBtn, fullImageDataObj) => {

  // handle clicking outside the image to close it.
  fullSizeImgContainer.addEventListener('click', (e) => {
    if (!fullSizeImgEl.contains(e.target)) {
      fullSizeImgContainer.remove()
      imageOpened = false
    }
  })

  // handle zooming into the full size image 
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

  // like button functionality
  postNoteCountBtn.addEventListener('click', (e) => {
    location.href = fullImageDataObj.url
  })
}