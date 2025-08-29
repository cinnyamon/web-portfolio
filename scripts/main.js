import { galleryFetching } from "./gallery.js";
import { navDropDownAction } from "./navbar.js";
import { pageObserver } from "./pageObserver.js";
import { getAuthorDescription } from "./authorDescription.js";
import { searchIDB } from "./searchIDB.js";
import { handleButtons } from "./handleButtons.js";
import { handlePOSTtoBackend } from "./handleLogin.js";

// handle page actions
navDropDownAction();
galleryFetching();
pageObserver();
getAuthorDescription();
searchIDB();
handleButtons();
handlePOSTtoBackend();
