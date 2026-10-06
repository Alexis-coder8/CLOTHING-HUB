(() => {
  const cards = Array.from(document.querySelectorAll(".pin-card"));
  const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("site-search");
  const savedToggle = document.getElementById("saved-toggle");
  const resultsMessage = document.getElementById("results-message");
  const filterBar = document.querySelector(".filter-bar");
  const pinGrid = document.getElementById("pin-grid");
  const uploadForm = document.getElementById("upload-form");
  const communityStatus = document.getElementById("community-status");
  const savedStorageKey = "chicVerseSavedImages";
  const supabaseUrl = window.LUVERIA_SUPABASE_URL.replace(/\/+$/, "");
  const supabaseKey = window.LUVERIA_SUPABASE_ANON_KEY;
  const storageBucket = "luveria-looks";
  const imageLimit = 5 * 1024 * 1024;
  const filterBarIsVisible = () => activeFilter !== "all" || searchInput.value.trim() !== "" || showSavedOnly;

  let activeFilter = "all";
  let showSavedOnly = false;
  let savedImages = new Set();
  let sharedComments = [];
  let storageWarning = "";

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

  function createDownloadLink(image) {
    const link = document.createElement("a");
    link.className = "download-link";
    link.href = image.src;
    link.download = image.src.split("/").pop().split("?")[0] || "luveria-look";
    link.textContent = "Download picture";
    link.setAttribute("aria-label", `Download ${image.alt || "look"}`);
    link.addEventListener("click", async (event) => {
      if (window.location.protocol === "file:" || image.src.startsWith(window.location.origin)) return;
      event.preventDefault();
      try {
        const response = await fetch(image.src);
        if (!response.ok) throw new Error(`Download failed (${response.status}).`);
        const objectUrl = URL.createObjectURL(await response.blob());
        const download = document.createElement("a");
        download.href = objectUrl;
        download.download = link.download;
        download.click();
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } catch (error) {
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

  function addLookCommunity(card, lookId) {
    card.dataset.communityId = lookId;
    const info = card.querySelector(".pin-info");
    const image = card.querySelector(".pin-image img");
    const actions = document.createElement("div");
    actions.className = "pin-actions";
    actions.append(createDownloadLink(image));
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

  function buildCommunityCard(look) {
    const card = document.createElement("article");
    card.className = "pin-card";
    card.dataset.categories = look.category;
    card.dataset.search = `${look.title} ${look.category} ${look.description || ""}`;

    const imageWrap = document.createElement("div");
    imageWrap.className = "pin-image";
    const image = document.createElement("img");
    image.src = look.image_url;
    image.alt = `${look.title} fashion look`;

    const saveButton = document.createElement("button");
    saveButton.className = "save-button";
    saveButton.type = "button";
    saveButton.dataset.saveId = look.id;
    saveButton.setAttribute("aria-label", `Save ${look.title}`);
    saveButton.setAttribute("aria-pressed", "false");
    saveButton.textContent = "♡";
    saveButton.addEventListener("click", toggleSavedLook);
    imageWrap.append(image, saveButton);

    const info = document.createElement("div");
    info.className = "pin-info";
    const title = document.createElement("h3");
    title.textContent = look.title;
    const description = document.createElement("p");
    description.textContent = `Shared by ${look.display_name || "the community"}`;
    info.append(title, description);

    card.append(imageWrap, info);
    addLookCommunity(card, look.id);
    return card;
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
      uploadForm.querySelector("button[type=submit]").disabled = true;
      setCommunityStatus("Community sharing needs Supabase setup. Add your project URL and anon key in js/supabase-config.js.");
      return;
    }
    try {
      const [looks, comments] = await Promise.all([
        requestSupabase("/rest/v1/community_looks?select=*&order=created_at.desc"),
        requestSupabase("/rest/v1/community_comments?select=*&order=created_at.asc")
      ]);
      sharedComments = comments;
      looks.forEach((look) => {
        const card = buildCommunityCard(look);
        pinGrid.append(card);
        cards.push(card);
      });
      document.querySelectorAll(".look-community .comment-list").forEach((list) => {
        renderComments(list, list.closest(".pin-card").dataset.communityId);
      });
      updateSaveButtons();
      renderCards();
      setCommunityStatus("Community looks and comments are ready.");
    } catch (error) {
      setCommunityStatus(`Could not load community looks: ${error.message}`, true);
      uploadForm.querySelector("button[type=submit]").disabled = true;
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
      ? "No inspiration found. Try another search or filter."
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
    if (!supabaseReady()) {
      setCommunityStatus("Add your Supabase project URL and anon key before posting comments.", true);
      return;
    }
    submit.disabled = true;
    try {
      const formData = new FormData(form);
      const [comment] = await requestSupabase("/rest/v1/community_comments", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          look_id: form.dataset.lookId,
          display_name: formData.get("name").trim(),
          body: formData.get("message").trim()
        })
      });
      sharedComments.push(comment);
      renderComments(form.previousElementSibling, form.dataset.lookId);
      form.reset();
      setCommunityStatus("Your comment has been shared.");
    } catch (error) {
      setCommunityStatus(`Could not post comment: ${error.message}`, true);
    } finally {
      submit.disabled = false;
    }
  }

  async function uploadLook(event) {
    event.preventDefault();
    if (!supabaseReady()) {
      setCommunityStatus("Add your Supabase project URL and anon key before uploading.", true);
      return;
    }
    const formData = new FormData(uploadForm);
    const image = formData.get("image");
    if (!(image instanceof File) || !image.size) {
      setCommunityStatus("Choose a picture to upload.", true);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > imageLimit) {
      setCommunityStatus("Choose a JPG, PNG, or WebP picture no larger than 5 MB.", true);
      return;
    }

    const submit = uploadForm.querySelector("button[type=submit]");
    submit.disabled = true;
    setCommunityStatus("Uploading your look...");
    const extension = image.type === "image/jpeg" ? "jpg" : image.type.split("/")[1];
    const storagePath = `${crypto.randomUUID()}.${extension}`;
    const encodedPath = storagePath.split("/").map(encodeURIComponent).join("/");
    try {
      await requestSupabase(`/storage/v1/object/${storageBucket}/${encodedPath}`, {
        method: "POST",
        body: image
      });
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${storageBucket}/${encodedPath}`;
      const [look] = await requestSupabase("/rest/v1/community_looks", {
        method: "POST",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          display_name: formData.get("name").trim(),
          title: formData.get("title").trim(),
          category: formData.get("category"),
          image_url: imageUrl,
          storage_path: storagePath
        })
      });
      pinGrid.prepend(buildCommunityCard(look));
      cards.push(pinGrid.firstElementChild);
      uploadForm.reset();
      updateSaveButtons();
      renderCards();
      setCommunityStatus("Your look has been shared with everyone!");
    } catch (error) {
      setCommunityStatus(`Could not upload your look: ${error.message}`, true);
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

  uploadForm.addEventListener("submit", uploadLook);
  savedImages = readSavedImages();
  updateSaveButtons();
  renderCards();
  loadCommunity();
})();
