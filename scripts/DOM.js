import { handleCloseBtn, handleLikeBtn } from "./handleButtons.js";

const mainEl = document.querySelector("main");
const refreshBtn = document.querySelector(".refresh-button");

console.log(refreshBtn);

export const createDOMAndEventHandlers = (fullImageDataObj, imageOpened) => {
  // image viewer
  const fullSizeImgContainer = document.createElement("div");

  // actual full size img
  const fullSizeImgWrapper = document.createElement("div");
  const fullSizeImgEl = document.createElement("img");

  // create post data elements

  // post info container
  const postInfoEl = document.createElement("div");

  // post close button
  const closeBtn = document.createElement("button");

  // post title
  const postTitle = document.createElement("h2");

  // post likes and tags container
  const postTagsLikesCont = document.createElement("div");

  // post likes and icon
  const postNoteCountBtn = document.createElement("button");
  const postNoteHeart = document.createElement("img");
  const postNoteCount = document.createElement("p");

  // post tags
  const postTagsDiv = document.createElement("div");

  // post links
  const postLinkDiv = document.createElement("div");
  const postLink = document.createElement("a");

  // image and info container
  fullSizeImgContainer.classList.add("full-size-img-container");

  // full size image
  fullSizeImgWrapper.classList.add("full-size-img-wrapper");
  fullSizeImgEl.src = fullImageDataObj.highReslinks;
  fullSizeImgEl.classList.add("full-size-image");

  // post info container
  postInfoEl.classList.add("post-info-container", "container");

  // post close button
  closeBtn.classList.add("post-close-btn");
  closeBtn.innerHTML = `<svg class="x-button-img" version="1.1" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
    <g stroke-linecap="square">
        <path d="m6 6 10 10m-10 0 10-10" fill="var(--white-muted)"/>
        <path d="M 6,5.1523437 5.1523437,6 10.152344,11 5.1523437,16 6,16.847656 l 5,-5 5,5 L 16.847656,16 l -5,-5 5,-5 L 16,5.1523437 11,10.152344 Z" fill="var(--white-muted)"/>
    </g>
</svg>`;

  // post title
  postTitle.textContent = `[ ${fullImageDataObj.title} ]`;
  postTitle.classList.add("post-title");

  // post tags and likes container
  postTagsLikesCont.classList.add("likes-tags-container");

  // post likes and icon
  postNoteHeart.src = "../assets/pixel-heart.svg";
  postNoteHeart.classList.add("post-heart-icon");
  postNoteCount.innerHTML = fullImageDataObj.notes;
  postNoteCountBtn.classList.add("post-notes-btn");

  // post tags
  postTagsDiv.classList.add("post-tags-div");
  for (let x of fullImageDataObj.tags) {
    console.log(x);
    const postTags = document.createElement("p");
    postTags.textContent = x;
    postTagsDiv.append(postTags);
  }

  // post original link
  postLink.href = fullImageDataObj.url;
  postLink.textContent = "Original Post";
  postLink.classList.add("post-link-text");
  postLinkDiv.classList.add("post-link-div");

  // append elements to respective divs
  postNoteCountBtn.append(postNoteHeart, postNoteCount);
  postTagsLikesCont.append(postNoteCountBtn, postTagsDiv);
  postLinkDiv.append(postLink);
  postInfoEl.append(closeBtn, postTitle, postTagsLikesCont, postLinkDiv);

  fullSizeImgWrapper.append(fullSizeImgEl);

  fullSizeImgContainer.append(fullSizeImgWrapper, postInfoEl);
  mainEl.append(fullSizeImgContainer);

  let zoomedInto = false;

  handleContainerFunctionality(
    imageOpened,
    zoomedInto,
    fullSizeImgContainer,
    fullSizeImgEl,
    postNoteCountBtn,
    fullImageDataObj,
    closeBtn
  );
};

const handleContainerFunctionality = (
  imageOpened,
  zoomedInto,
  fullSizeImgContainer,
  fullSizeImgEl,
  postNoteCountBtn,
  fullImageDataObj,
  closeBtn
) => {
  // handle zooming into the full size image
  fullSizeImgEl.addEventListener("click", (e) => {
    if (!zoomedInto) {
      const fullSizeImgRect = fullSizeImgEl.getBoundingClientRect();
      const offSetX = e.clientX - fullSizeImgRect.left;
      const offSetY = e.clientY - fullSizeImgRect.top;
      const percentX = (offSetX / fullSizeImgRect.width) * 100;
      const percentY = (offSetY / fullSizeImgRect.height) * 100;

      fullSizeImgEl.style.transformOrigin = `${percentX}% ${percentY}%`;
      fullSizeImgEl.style.transform = "scale(2)";
      fullSizeImgEl.classList.add("zoomed-in");
      zoomedInto = true;
    } else {
      fullSizeImgEl.style.transform = "scale(1)";
      fullSizeImgEl.classList.remove("zoomed-in");
      zoomedInto = false;
    }
  });

  handleLikeBtn(postNoteCountBtn, fullImageDataObj);
  handleCloseBtn(closeBtn, fullSizeImgEl, fullSizeImgContainer, imageOpened);
};
