/\*
IDB Version History:

v1 - Created "lowResImages" with keyPath "id"
v2 - Added index "image_links" to lowResImages
v3 - Created "fullImageData" store
v4 - Added indexes to "fullImageData" (title, timestamp, etc.)
v5 - Created "meta" store with keyPath "key"
v6 - Added "transaction_time" index to meta
v7 - Added "author_description" index to meta
v8 - Added unique index on "fullImageData.highReslinks"
v9 - Current: all stores and indexes initialized
\*/
