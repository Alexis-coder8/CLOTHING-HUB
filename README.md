<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta
    name="description"
    content="Explore feminine, African, casual, elegant, and corporate fashion inspiration at CHIC VERSE."
  >
  <title>CHIC VERSE | Find Your Style</title>
  <link rel="stylesheet" href="css/style.css">
</head>

<body>
  <header class="navbar">
    <a class="logo" href="#home">CHIC VERSE</a>

    <nav aria-label="Main navigation">
      <a href="#home">Home</a>
      <a href="#inspiration">Fashion</a>
      <a href="#inspiration">African</a>
      <a href="#inspiration">Beauty</a>
      <a href="#about">Lifestyle</a>
    </nav>

    <div class="header-actions">
      <form class="search-form" id="search-form" role="search">
        <input
          id="site-search"
          type="search"
          placeholder="Search styles..."
          aria-label="Search fashion inspiration"
        >
        <button type="submit" aria-label="Search">⌕</button>
      </form>

      <button
        class="saved-toggle"
        id="saved-toggle"
        type="button"
        aria-pressed="false"
      >
        ♡ <span>Saved</span>
      </button>
    </div>
  </header>

  <main>
    <section class="hero" id="home">
      <div class="hero-content">
        <p class="eyebrow">Discover your next look</p>
        <h1>Your Style,<br><span>Your Verse.</span></h1>
        <p>
          Fashion inspiration for feminine, African, casual, elegant, and
          corporate style.
        </p>
        <a class="hero-button" href="#inspiration">Explore Inspiration</a>
      </div>
    </section>

    <section class="inspiration" id="inspiration">
      <div class="section-heading">
        <p class="eyebrow">A little inspiration for every day</p>
        <h2>Find Your Style</h2>
        <p>Explore looks, discover ideas, and save your favorites.</p>
      </div>

      <div class="filter-bar" aria-label="Filter inspiration by style">
        <button class="filter-chip active" type="button" data-filter="all">All</button>
        <button class="filter-chip" type="button" data-filter="feminine">Feminine</button>
        <button class="filter-chip" type="button" data-filter="african">African</button>
        <button class="filter-chip" type="button" data-filter="casual">Casual</button>
        <button class="filter-chip" type="button" data-filter="elegant">Elegance</button>
        <button class="filter-chip" type="button" data-filter="corporate">Corporate</button>
        <button class="filter-chip" type="button" data-filter="other">Other</button>
      </div>

      <p class="results-message" id="results-message" aria-live="polite"></p>
      <div class="pin-grid" id="pin-grid"></div>
    </section>

    <section class="about" id="about">
      <p class="eyebrow">Welcome to your CHIC VERSE</p>
      <h2>Discover. Inspire. Be Chic.</h2>
      <p>
        CHIC VERSE celebrates feminine style, African fashion, casual looks,
        timeless elegance, and professional outfits.
      </p>
    </section>
  </main>

  <footer>
    <a class="logo" href="#home">CHIC VERSE</a>
    <p>Discover. Inspire. Be Chic.</p>
    <p>&copy; 2026 CHIC VERSE</p>
  </footer>

  <script>
    (() => {
      const fashionLooks = [
        {
          category: "feminine",
          title: "Feminine Style",
          description: "A look to inspire your wardrobe.",
          alt: "Feminine fashion inspiration",
          keywords: "feminine fashion style outfit"
        },
        {
          category: "african",
          title: "African Inspiration",
          description: "Celebrate color, pattern, and personal style.",
          alt: "African fashion inspiration",
          keywords: "African fashion print style outfit"
        },
        {
          category: "casual",
          title: "Everyday Chic",
          description: "Easy inspiration for a relaxed day.",
          alt: "Casual fashion inspiration",
          keywords: "casual everyday fashion outfit"
        },
        {
          category: "african elegant",
          title: "African Elegance",
          description: "Beautiful style with a confident feel.",
          alt: "African elegant fashion inspiration",
          keywords: "African elegant fashion style outfit"
        },
        {
          category: "elegant",
          title: "Timeless Elegance",
          description: "A polished look for a special occasion.",
          alt: "Elegant fashion inspiration",
          keywords: "elegant fashion outfit style"
        },
        {
          category: "corporate",
          title: "Corporate Style",
          description: "Professional inspiration for the workday.",
          alt: "Corporate fashion inspiration",
          keywords: "corporate professional work fashion"
        },
        {
          category: "corporate",
          title: "Workday Look",
          description: "Ideas for a confident professional outfit.",
          alt: "Professional corporate outfit inspiration",
          keywords: "corporate professional office fashion"
        },
        {
          category: "feminine",
          title: "Feminine Inspiration",
          description: "A fresh look to make your own.",
          alt: "Feminine outfit inspiration",
          keywords: "feminine fashion outfit style"
        },
        {
          category: "casual",
          title: "Casual Chic",
          description: "Comfortable style for every day.",
          alt: "Casual everyday outfit inspiration",
          keywords: "casual relaxed everyday fashion"
        },
        {
          category: "feminine",
          title: "Soft & Feminine",
          description: "Style inspiration for a lovely look.",
          alt: "Feminine style inspiration",
          keywords: "feminine fashion outfit style"
        },
        {
          category: "casual",
          title: "Relaxed & Chic",
          description: "Easygoing inspiration for your day.",
          alt: "Relaxed casual fashion inspiration",
          keywords: "casual relaxed everyday outfit"
        },
        {
          category: "other",
          title: "More Inspiration",
          description: "Extra style inspiration to explore.",
          alt: "Additional fashion inspiration",
          keywords: "additional fashion inspiration"
        },
        {
          category: "corporate",
          title: "Professional Polish",
          description: "Smart inspiration for work and meetings.",
          alt: "Corporate outfit inspiration",
          keywords: "corporate professional work fashion"
        },
        {
          category: "african",
          title: "African Style",
          description: "Inspiration celebrating African fashion.",
          alt: "African fashion outfit inspiration",
          keywords: "African fashion outfit style"
        },
        {
          category: "casual",
          title: "Everyday Look",
          description: "Casual inspiration for your wardrobe.",
          alt: "Casual fashion look",
          keywords: "casual everyday relaxed fashion"
        },
        {
          category: "african",
          title: "African Inspiration",
          description: "Discover another beautiful look.",
          alt: "African fashion style inspiration",
          keywords: "African fashion outfit print style"
        },
        {
          category: "african",
          title: "Inspired by Africa",
          description: "Personal style with a vibrant spirit.",
          alt: "African outfit inspiration",
          keywords: "African fashion outfit style"
        },
        {
          category: "african",
          title: "Colorful Inspiration",
          description: "Explore expressive African fashion.",
          alt: "Colorful African fashion inspiration",
          keywords: "African fashion colorful outfit style"
        },
        {
          category: "feminine",
          title: "Feminine Look",
          description: "Inspiration for your personal style.",
          alt: "Feminine fashion look",
          keywords: "feminine fashion style outfit"
        },
        {
          category: "african",
          title: "African Style",
          description: "A look to add to your inspiration board.",
          alt: "African style inspiration",
          keywords: "African fashion outfit style"
        },
        {
          category: "feminine",
          title: "Lovely Details",
          description: "Feminine inspiration for your next look.",
          alt: "Feminine outfit style inspiration",
          keywords: "feminine fashion outfit style"
        },
        {
          category: "african",
          title: "African Fashion",
          description: "Celebrate your style and individuality.",
          alt: "African fashion outfit",
          keywords: "African fashion outfit style"
        },
        {
          category: "feminine",
          title: "Everyday Feminine",
          description: "A little inspiration for your everyday style.",
          alt: "Feminine style and fashion inspiration",
          keywords: "feminine fashion style outfit"
        },
        {
          category: "casual",
          title: "Casual Outfit",
          description: "Comfortable inspiration for everyday wear.",
          alt: "Casual outfit inspiration",
          keywords: "casual relaxed everyday fashion"
        },
        {
          category: "african",
          title: "African Elegance",
          description: "A beautiful look inspired by African fashion.",
          alt: "African fashion outfit inspiration",
          keywords: "African fashion traditional outfit style"
        },
        {
          category: "african",
          title: "Color & Culture",
          description: "Discover another African-inspired look.",
          alt: "Colorful African outfit inspiration",
          keywords: "African fashion traditional colorful outfit"
        },
        {
          category: "african",
          title: "African Inspiration",
          description: "A style idea to save and revisit.",
          alt: "African fashion inspiration",
          keywords: "African fashion outfit style"
        },
        {
          category: "african",
          title: "Bold & Beautiful",
          description: "Expressive style with plenty of personality.",
          alt: "Colorful African fashion look",
          keywords: "African fashion colorful outfit style"
        },
        {
          category: "african",
          title: "Beautifully African",
          description: "More fashion inspiration to explore.",
          alt: "African outfit style inspiration",
          keywords: "African fashion traditional outfit style"
        },
        {
          category: "elegant",
          title: "Elegant Look",
          description: "Refined inspiration for a polished outfit.",
          alt: "Elegant formal fashion inspiration",
          keywords: "elegant formal fashion outfit style"
        }
      ];

      const grid = document.getElementById("pin-grid");

      fashionLooks.forEach((look, index) => {
        const number = index + 1;
        const imageId = `fashion${number}`;
        const card = document.createElement("article");

        card.className = "pin-card";
        card.dataset.categories = look.category;
        card.dataset.search = `${look.keywords} ${look.title} ${look.description}`;

        const imageContainer = document.createElement("div");
        imageContainer.className = "pin-image";

        const image = document.createElement("img");
        image.src = `images/${imageId}.jpg`;
        image.alt = look.alt;
        image.loading = "lazy";

        const saveButton = document.createElement("button");
        saveButton.className = "save-button";
        saveButton.type = "button";
        saveButton.dataset.saveId = imageId;
        saveButton.setAttribute("aria-label", `Save ${imageId}`);
        saveButton.setAttribute("aria-pressed", "false");
        saveButton.textContent = "♡";

        const info = document.createElement("div");
        info.className = "pin-info";

        const title = document.createElement("h3");
        title.textContent = look.title;

        const description = document.createElement("p");
        description.textContent = look.description;

        imageContainer.append(image, saveButton);
        info.append(title, description);
        card.append(imageContainer, info);
        grid.appendChild(card);
      });

      const cards = Array.from(document.querySelectorAll(".pin-card"));
      const filterButtons = Array.from(document.querySelectorAll("[data-filter]"));
      const searchForm = document.getElementById("search-form");
      const searchInput = document.getElementById("site-search");
      const savedToggle = document.getElementById("saved-toggle");
      const resultsMessage = document.getElementById("results-message");
      const savedStorageKey = "chicVerseSavedImages";

      let activeFilter = "all";
      let showSavedOnly = false;
      let savedImages = new Set();

      try {
        const storedImages = JSON.parse(localStorage.getItem(savedStorageKey) || "[]");
        if (Array.isArray(storedImages)) {
          savedImages = new Set(storedImages);
        }
      } catch {
        savedImages = new Set();
      }

      function updateSaveButtons() {
        document.querySelectorAll(".save-button").forEach((button) => {
          const isSaved = savedImages.has(button.dataset.saveId);
          button.classList.toggle("saved", isSaved);
          button.setAttribute("aria-pressed", String(isSaved));
          button.textContent = isSaved ? "♥" : "♡";
        });
      }

      function renderCards() {
        const query = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        cards.forEach((card) => {
          const categories = card.dataset.categories.split(/\s+/);
          const searchableText =
            `${card.dataset.search} ${card.textContent}`.toLowerCase();
          const imageId = card.querySelector(".save-button").dataset.saveId;

          const matchesCategory =
            activeFilter === "all" || categories.includes(activeFilter);
          const matchesSearch =
            query === "" || searchableText.includes(query);
          const matchesSaved =
            !showSavedOnly || savedImages.has(imageId);
          const isVisible = matchesCategory && matchesSearch && matchesSaved;

          card.hidden = !isVisible;
          if (isVisible) visibleCount += 1;
        });

        resultsMessage.textContent = visibleCount === 0
          ? "No inspiration found. Try another search or filter."
          : `${visibleCount} ${visibleCount === 1 ? "look" : "looks"}`;
      }

      filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
          activeFilter = button.dataset.filter;

          filterButtons.forEach((item) => {
            item.classList.toggle("active", item === button);
          });

          showSavedOnly = false;
          savedToggle.classList.remove("active");
          savedToggle.setAttribute("aria-pressed", "false");
          renderCards();
        });
      });

      searchInput.addEventListener("input", renderCards);

      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        renderCards();
      });

      document.querySelectorAll(".save-button").forEach((button) => {
        button.addEventListener("click", () => {
          const imageId = button.dataset.saveId;

          if (savedImages.has(imageId)) {
            savedImages.delete(imageId);
          } else {
            savedImages.add(imageId);
          }

          try {
            localStorage.setItem(
              savedStorageKey,
              JSON.stringify([...savedImages])
            );
          } catch {
            // Favorites still work for this page view if storage is unavailable.
          }

          updateSaveButtons();
          renderCards();
        });
      });

      savedToggle.addEventListener("click", () => {
        showSavedOnly = !showSavedOnly;
        savedToggle.classList.toggle("active", showSavedOnly);
        savedToggle.setAttribute("aria-pressed", String(showSavedOnly));
        renderCards();
      });

      updateSaveButtons();
      renderCards();
    })();
  </script>
</body>
</html>
