import { galleryFetching } from "./gallery.js";
import { navDropDownAction } from "./navbar.js";
import { pageObserver } from "./pageObserver.js";
import { getAuthorDescription } from "./authorDescription.js";

// handle page actions
navDropDownAction();
galleryFetching();
pageObserver();
getAuthorDescription();
