(() => {
  const cards = Array.from(document.querySelectorAll(".pin-card"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("site-search");
  const savedToggle = document.getElementById("saved-toggle");
  const resultsMessage = document.getElementById("results-message");
  const filterBar = document.querySelector(".filter-bar");
  const pinGrid = document.getElementById("pin-grid");
  const communityStatus = document.getElementById("community-status");
  const savedStorageKey = "chicVerseSavedImages";
  const localDatabaseName = "luveria-community";
  const supabaseUrl = window.LUVERIA_SUPABASE_URL.replace(/\/+$/, "");
  const supabaseKey = window.LUVERIA_SUPABASE_ANON_KEY;
  const filterBarIsVisible = () => activeFilter !== "all" || searchInput.value.trim() !== "" || showSavedOnly;

  let activeFilter = "all";
  let showSavedOnly = false;
  let savedImages = new Set();
  let sharedComments = [];
  let storageWarning = "";
  let localDatabasePromise;

  function setCommunityStatus(message, isError = false) {
    communityStatus.textContent = [message, storageWarning].filter(Boolean).join(" ");
    communityStatus.classList.toggle("is-error", isError || Boolean(storageWarning));
  }

  function reportLocalStorageError() {
    storageWarning = "Saved looks cannot be stored in this browser.";
    setCommunityStatus(communityStatus.textContent);
  }

  function readSavedImages() {
    try {
      const storedImages = JSON.parse(localStorage.getItem(savedStorageKey) || "[]");
      if (Array.isArray(storedImages)) return new Set(storedImages);
      reportLocalStorageError();
      return new Set();
    } catch {
      reportLocalStorageError();
      return new Set();
    }
  }

  function saveSavedImages() {
    try {
      localStorage.setItem(savedStorageKey, JSON.stringify([...savedImages]));
    } catch {
      reportLocalStorageError();
    }
  }

  function updateSaveButtons() {
    document.querySelectorAll(".save-button").forEach((button) => {
      const isSaved = savedImages.has(button.dataset.saveId);
      button.classList.toggle("is-saved", isSaved);
      button.setAttribute("aria-pressed", String(isSaved));
      button.textContent = isSaved ? "♥" : "♡";
    });
  }

  function createDownloadLink(image, downloadName) {
    const link = document.createElement("a");
    link.className = "download-link";
    link.href = image.src;
    link.download = downloadName || image.src.split("/").pop().split("?")[0] || "luveria-look";
    link.textContent = "Download / save picture";
    link.setAttribute("aria-label", `Download or save ${image.alt || "look"} to your device`);
    link.addEventListener("click", async (event) => {
      if (window.location.protocol === "file:") return;
      const supportsFileSharing = typeof navigator.share === "function"
        && typeof navigator.canShare === "function";
      const sameOrigin = image.src.startsWith(window.location.origin) || image.src.startsWith("blob:");
      if (!supportsFileSharing && sameOrigin) return;
      event.preventDefault();
      try {
        const response = await fetch(image.src);
        if (!response.ok) throw new Error(`Download failed (${response.status}).`);
        const blob = await response.blob();
        const mimeType = blob.type
          || (/\.jpe?g$/i.test(link.download) ? "image/jpeg" : "")
          || (/\.png$/i.test(link.download) ? "image/png" : "")
          || (/\.webp$/i.test(link.download) ? "image/webp" : "application/octet-stream");
        if (supportsFileSharing) {
          const file = new File([blob], link.download, { type: mimeType });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: "LUVERIA",
                text: "Choose Save Image or Save to Photos/Gallery to keep this picture."
              });
              setCommunityStatus("Picture shared. Choose a save option in the share menu to add it to your gallery.");
              return;
            } catch (error) {
              if (error.name === "AbortError") return;
            }
          }
        }
        const objectUrl = URL.createObjectURL(blob);
        const download = document.createElement("a");
        download.href = objectUrl;
        download.download = link.download;
        document.body.append(download);
        download.click();
        download.remove();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 10000);
      } catch (error) {
        if (error.name === "AbortError") return;
        setCommunityStatus(error.message, true);
      }
    });
    return link;
  }

  function createCommentForm(lookId) {
    const form = document.createElement("form");
    form.className = "comment-form";
    form.dataset.lookId = lookId;

    const name = document.createElement("input");
    name.name = "name";
    name.type = "text";
    name.maxLength = 40;
    name.placeholder = "Your name";
    name.setAttribute("aria-label", "Your name");
    name.required = true;

    const message = document.createElement("textarea");
    message.name = "message";
    message.maxLength = 300;
    message.placeholder = "Leave a kind comment...";
    message.setAttribute("aria-label", "Comment");
    message.required = true;

    const submit = document.createElement("button");
    submit.type = "submit";
    submit.textContent = "Comment";
    form.append(name, message, submit);
    form.addEventListener("submit", submitComment);
    return form;
  }

  function renderComments(list, lookId) {
    list.replaceChildren();
    sharedComments
      .filter((comment) => comment.look_id === lookId)
      .forEach((comment) => {
        const item = document.createElement("p");
        item.className = "comment";
        const author = document.createElement("strong");
        author.textContent = `${comment.display_name}: `;
        const text = document.createElement("span");
        text.textContent = comment.body;
        item.append(author, text);
        list.append(item);
      });
  }

  function addLookCommunity(card, lookId, downloadName) {
    card.dataset.communityId = lookId;
    const info = card.querySelector(".pin-info");
    const image = card.querySelector(".pin-image img");
    const actions = document.createElement("div");
    actions.className = "pin-actions";
    actions.append(createDownloadLink(image, downloadName));
    info.append(actions);

    const community = document.createElement("div");
    community.className = "look-community";
    const commentList = document.createElement("div");
    commentList.className = "comment-list";
    commentList.setAttribute("aria-label", "Comments");
    renderComments(commentList, lookId);
    community.append(commentList, createCommentForm(lookId));
    card.append(community);
  }

  function openLocalDatabase() {
    if (!localDatabasePromise) {
      localDatabasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(localDatabaseName, 1);
        request.onupgradeneeded = () => {
          const database = request.result;
          database.createObjectStore("looks", { keyPath: "id" });
          const comments = database.createObjectStore("comments", { keyPath: "id" });
          comments.createIndex("look_id", "look_id");
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error("Could not open local community storage."));
        request.onblocked = () => reject(new Error("Local community storage is blocked by another tab."));
      });
    }
    return localDatabasePromise;
  }

  async function readLocalStore(storeName) {
    const database = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const request = database.transaction(storeName, "readonly").objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not read local community data."));
    });
  }

  async function writeLocalStore(storeName, item) {
    const database = await openLocalDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).put(item);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error("Could not save local community data."));
      transaction.onabort = () => reject(transaction.error || new Error("Saving local community data was cancelled."));
    });
  }

  async function requestSupabase(path, options = {}) {
    const response = await fetch(`${supabaseUrl}${path}`, {
      ...options,
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        ...(options.body instanceof File
          ? { "Content-Type": options.body.type }
          : typeof options.body === "string"
            ? { "Content-Type": "application/json" }
            : {}),
        ...(options.headers || {})
      }
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Supabase request failed (${response.status}).`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  function supabaseReady() {
    return Boolean(supabaseUrl && supabaseKey);
  }

  async function loadCommunity() {
    if (!supabaseReady()) {
      try {
        sharedComments = await readLocalStore("comments");
        document.querySelectorAll(".look-community .comment-list").forEach((list) => {
          renderComments(list, list.closest(".pin-card").dataset.communityId);
        });
        setCommunityStatus("Comments are saved only in this browser. Add Supabase settings to share them with everyone.");
      } catch (error) {
        setCommunityStatus(`Could not load comments: ${error.message}`, true);
      }
      return;
    }
    try {
      sharedComments = await requestSupabase("/rest/v1/community_comments?select=*&order=created_at.asc");
      document.querySelectorAll(".look-community .comment-list").forEach((list) => {
        renderComments(list, list.closest(".pin-card").dataset.communityId);
      });
      setCommunityStatus("Comments are ready.");
    } catch (error) {
      setCommunityStatus(`Could not load comments: ${error.message}`, true);
    }
  }

  function scrollToFirstResult() {
    const firstVisible = cards.find((card) => !card.hidden);
    (firstVisible || resultsMessage).scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderCards() {
    const query = searchInput.value.trim().toLowerCase();
    const isOverview = !filterBarIsVisible();
    let visibleCount = 0;
    pinGrid.classList.toggle("is-horizontal-gallery", activeFilter !== "all");
    filterBar.hidden = isOverview;
    resultsMessage.hidden = isOverview;
    pinGrid.hidden = isOverview;

    cards.forEach((card) => {
      const categories = (card.dataset.categories || "").split(/\s+/);
      const searchableText = `${card.dataset.search || ""} ${card.textContent}`.toLowerCase();
      const imageId = card.querySelector(".save-button").dataset.saveId;
      const matchesCategory = activeFilter === "all" || categories.includes(activeFilter);
      const matchesSearch = !query || searchableText.includes(query);
      const matchesSaved = !showSavedOnly || savedImages.has(imageId);
      card.hidden = !(matchesCategory && matchesSearch && matchesSaved);
      if (!card.hidden) visibleCount += 1;
    });

    resultsMessage.textContent = visibleCount === 0
      ? showSavedOnly
        ? "No saved pictures yet. Tap the heart on a look to save it here."
        : "No inspiration found. Try another search or filter."
      : showSavedOnly
        ? `${visibleCount} saved ${visibleCount === 1 ? "picture" : "pictures"}`
        : `${visibleCount} ${visibleCount === 1 ? "look" : "looks"}`;
  }

  function toggleSavedLook(event) {
    const imageId = event.currentTarget.dataset.saveId;
    if (savedImages.has(imageId)) savedImages.delete(imageId);
    else savedImages.add(imageId);
    saveSavedImages();
    updateSaveButtons();
    renderCards();
  }

  async function submitComment(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("button[type=submit]");
    submit.disabled = true;
    try {
      const formData = new FormData(form);
      const commentData = {
        look_id: form.dataset.lookId,
        display_name: formData.get("name").trim(),
        body: formData.get("message").trim()
      };
      let comment;
      if (supabaseReady()) {
        [comment] = await requestSupabase("/rest/v1/community_comments", {
          method: "POST",
          headers: { Prefer: "return=representation" },
          body: JSON.stringify(commentData)
        });
      } else {
        comment = { id: crypto.randomUUID(), ...commentData, created_at: new Date().toISOString() };
        await writeLocalStore("comments", comment);
      }
      sharedComments.push(comment);
      renderComments(form.previousElementSibling, form.dataset.lookId);
      form.reset();
      setCommunityStatus(supabaseReady()
        ? "Your comment has been shared."
        : "Your comment has been saved in this browser only.");
    } catch (error) {
      setCommunityStatus(`Could not post comment: ${error.message}`, true);
    } finally {
      submit.disabled = false;
    }
  }

  cards.forEach((card) => {
    const saveButton = card.querySelector(".save-button");
    saveButton.addEventListener("click", toggleSavedLook);
    addLookCommunity(card, saveButton.dataset.saveId);
  });

  document.querySelectorAll(".style-category").forEach((category) => {
    const categoryName = category.dataset.filter;
    const collage = category.querySelector(".category-collage");
    cards.filter((card) => card.dataset.categories.split(/\s+/).includes(categoryName))
      .slice(0, 4)
      .forEach((card) => {
        const image = card.querySelector(".pin-image img").cloneNode();
        image.alt = "";
        collage.append(image);
      });
    collage.classList.toggle("category-collage--three", collage.childElementCount === 3);
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const isActive = item.dataset.filter === activeFilter;
        item.classList.toggle("active", isActive);
        if (item.classList.contains("style-category")) item.setAttribute("aria-pressed", String(isActive));
      });
      showSavedOnly = false;
      savedToggle.classList.remove("active");
      savedToggle.setAttribute("aria-pressed", "false");
      pinGrid.scrollLeft = 0;
      renderCards();
      if (button.classList.contains("style-category")) pinGrid.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  searchInput.addEventListener("input", () => {
    renderCards();
    if (searchInput.value.trim()) scrollToFirstResult();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    renderCards();
    if (searchInput.value.trim()) scrollToFirstResult();
  });

  savedToggle.addEventListener("click", () => {
    showSavedOnly = !showSavedOnly;
    savedToggle.classList.toggle("active", showSavedOnly);
    savedToggle.setAttribute("aria-pressed", String(showSavedOnly));
    renderCards();
    pinGrid.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  savedImages = readSavedImages();
  updateSaveButtons();
  renderCards();
  loadCommunity();
})();
