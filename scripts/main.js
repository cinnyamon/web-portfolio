import { galleryFetching } from "./imageFetching.js";
import { navDropDownAction } from "./navbar.js";
import { pageObserver } from "./pageObserver.js";

// handle page actions
navDropDownAction();
galleryFetching();
pageObserver();


