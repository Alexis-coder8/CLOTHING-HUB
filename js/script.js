const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("site-search");
const resultsMessage = document.getElementById("results-message");
const savedToggle = document.getElementById("saved-toggle");
const filterButtons = document.querySelectorAll(".filter-chip");
const pinCards = [...document.querySelectorAll(".pin-card")];

let activeFilter = "all";
let showSavedOnly = false;

function readSavedPins() {
	try {
		return JSON.parse(localStorage.getItem("chicVerseSavedPins")) || [];
	} catch {
		return [];
	}
}

let savedPins = readSavedPins();

function updateSaveButtons() {
	pinCards.forEach((card) => {
		const image = card.querySelector("img");
		const button = card.querySelector(".save-button");
		const isSaved = savedPins.includes(image.src);

		button.classList.toggle("is-saved", isSaved);
		button.setAttribute("aria-pressed", String(isSaved));
		button.textContent = isSaved ? "♥" : "♡";
	});
}

function filterPins() {
	const query = searchInput.value.trim().toLowerCase();
	let visibleCount = 0;

	pinCards.forEach((card) => {
		const image = card.querySelector("img");
		const searchableText = [
			card.dataset.search,
			card.dataset.category,
			card.textContent,
			image.alt
		].join(" ").toLowerCase();

		const categories = card.dataset.category.split(/\s+/);
		const matchesSearch = !query || searchableText.includes(query);
		const matchesCategory =
			activeFilter === "all" || categories.includes(activeFilter);
		const matchesSaved = !showSavedOnly || savedPins.includes(image.src);

		const shouldShow = matchesSearch && matchesCategory && matchesSaved;
		card.hidden = !shouldShow;

		if (shouldShow) {
			visibleCount++;
		}
	});

	if (visibleCount === 0) {
		resultsMessage.textContent = "No matching styles found. Try another search.";
	} else if (showSavedOnly) {
		resultsMessage.textContent = `Showing ${visibleCount} saved ${visibleCount === 1 ? "style" : "styles"}.`;
	} else {
		resultsMessage.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "style" : "styles"}.`;
	}
}

searchInput.addEventListener("input", filterPins);

searchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	filterPins();
});

filterButtons.forEach((button) => {
	button.addEventListener("click", () => {
		activeFilter = button.dataset.filter;

		filterButtons.forEach((item) => {
			item.classList.toggle("active", item === button);
		});

		filterPins();
	});
});

pinCards.forEach((card) => {
	const image = card.querySelector("img");
	const button = card.querySelector(".save-button");

	button.addEventListener("click", () => {
		if (savedPins.includes(image.src)) {
			savedPins = savedPins.filter((src) => src !== image.src);
		} else {
			savedPins.push(image.src);
		}

		try {
			localStorage.setItem("chicVerseSavedPins", JSON.stringify(savedPins));
		} catch {
			// Saving still works until the page is refreshed if browser storage is unavailable.
		}

		updateSaveButtons();
		filterPins();
	});
});

savedToggle.addEventListener("click", () => {
	showSavedOnly = !showSavedOnly;
	savedToggle.setAttribute("aria-pressed", String(showSavedOnly));
	savedToggle.innerHTML = showSavedOnly
		? "♥ <span>Saved</span>"
		: "♡ <span>Saved</span>";

	filterPins();
});

updateSaveButtons();
filterPins();
