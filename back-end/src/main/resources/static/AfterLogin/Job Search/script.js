document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetch("/api/jobs/all");
  const jobGrid = document.getElementById("job-grid");

  if (!res.ok) {
    jobGrid.innerHTML = "<p>Failed to load jobs.</p>";
    return;
  }

  const jobs = await res.json();
  jobGrid.innerHTML = "";

  const jobCards = [];

  jobs.forEach(job => {
    const deadline = new Date(job.deadline);
    const today = new Date();
    const isExpired = deadline < today;
    const status = isExpired ? "Expired" : "Active";

    const categories = (job.category || "")
      .split(",")
      .map(cat => `<span>${cat.trim()}</span>`)
      .join("");

    const jobCard = document.createElement("form");
    jobCard.className = "job-card";
    jobCard.method = "POST";
    jobCard.action = "/apply-job";

    jobCard.innerHTML = `
      <div class="job-meta">
        <span class="post-date">Status: ${status}</span>
        <span class="price">Rs ${job.minBudget || 0}</span>
      </div>
      <h2 class="job-title">${job.jobTitle}</h2>
      <p class="job-desc">${job.description || "No description provided."}</p>
      <div class="job-tags">${categories}</div>
      <div class="job-footer">
        <button type="button" class="view-btn" data-job-id="${job.id}">View Detail</button>
        <button type="submit" class="apply-btn">Apply</button>
      </div>
    `;

    jobCard.querySelector(".view-btn").addEventListener("click", function () {
      window.location.href = `/AfterLogin/View Detail/index.html?jobId=${job.id}`;
    });

    jobGrid.appendChild(jobCard);

    jobCards.push({ jobCard, job });
  });

  // Search functionality
  const searchInput = document.getElementById("search-input");
  const searchButton = document.getElementById("search-button");
  const clearButton = document.getElementById("clear-button");

  searchButton.addEventListener("click", () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) return;

    clearButton.style.display = "inline-block";

    jobCards.forEach(({ jobCard, job }) => {
      const title = job.jobTitle;
      const desc = job.description || "";
      const category = job.category || "";

      const match =
        title.toLowerCase().includes(query) ||
        desc.toLowerCase().includes(query) ||
        category.toLowerCase().includes(query);

      if (match) {
        jobCard.style.display = "block";

        // Highlight matches in title
        const highlightedTitle = highlightText(title, query);
        jobCard.querySelector(".job-title").innerHTML = highlightedTitle;

        // Highlight matches in description
        const highlightedDesc = highlightText(desc, query);
        jobCard.querySelector(".job-desc").innerHTML = highlightedDesc;

        // Highlight matches in categories
        const highlightedCategories = category
          .split(",")
          .map(cat => {
            return `<span>${highlightText(cat.trim(), query)}</span>`;
          })
          .join("");
        jobCard.querySelector(".job-tags").innerHTML = highlightedCategories;

      } else {
        jobCard.style.display = "none";
      }
    });
  });

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    clearButton.style.display = "none";

    jobCards.forEach(({ jobCard, job }) => {
      jobCard.style.display = "block";

      // Reset content without highlights
      jobCard.querySelector(".job-title").innerHTML = job.jobTitle;
      jobCard.querySelector(".job-desc").innerHTML = job.description || "No description provided.";

      const categories = (job.category || "")
        .split(",")
        .map(cat => `<span>${cat.trim()}</span>`)
        .join("");
      jobCard.querySelector(".job-tags").innerHTML = categories;
    });
  });

  // Highlight function
  function highlightText(text, keyword) {
    const pattern = new RegExp(`(${keyword})`, "gi");
    return text.replace(pattern, `<mark>$1</mark>`);
  }
});
