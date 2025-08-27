import { key } from "./apiKey.js";

export const fetchImages = async () => {
  // api stuff
  const apiBlogName = "wtfremex";
  const apiPostType = "photo";
  const apiKey = key();
  const apiOptions = "&npf=true";

  const response = await fetch(
    `https://api.tumblr.com/v2/blog/${apiBlogName}/posts/${apiPostType}?api_key=${apiKey}${apiOptions}`
  );

  const parsed = await response.json();
  const status = parsed.meta.status;
  if (status < 200 || status > 299) return;

  // highResImageStore shit in arrays instead of sending directly to the idb because i want a separate function for that
  let fullImageData = [];
  let lowResData = [];
  let blogMetadata = [];
  const parsedResponse = parsed.response;

  blogMetadata.push(await storeBlogMetadata(parsedResponse));

  for (let i = 0; i < parsedResponse.posts.length; i++) {
    // skip past reblogs (they all contain this object key)
    if (parsedResponse.posts[i].parent_post_url) continue;

    // every single post
    const post = parsedResponse.posts[i];

    for (let j = 0; j < post.content.length; j++) {
      // all content (images,text,etc) inside of a post
      const postContent = post.content[j];

      // we're only interested in the image content for now
      if (postContent.type === "image") {
        for (let k = 0; k < postContent.media.length; k++) {
          // console.log('post content with all dimensions:',
          // postContent.media[k])
          const media = postContent.media[k];

          if (media.has_original_dimensions) {
            fullImageData.push({
              id: media.media_key.split(":")[0],
              highReslinks: media.url,
              timestamp: new Date(post.date),
              tags: post.tags,
              notes: post.note_count,
              title: post.summary,
              url: post.short_url,
            });
          } else if (media.width === 500) {
            lowResData.push({
              id: media.media_key.split(":")[0],
              lowReslinks: media.url,
              timestamp: new Date(post.date),
            });
          }
        }
      }
    }
  }

  return { fullImageData, lowResData, blogMetadata };
};

function storeBlogMetadata(parsedResponse) {
  return new Promise((resolve, reject) => {
    resolve(parsedResponse.blog.description);
  });
}
