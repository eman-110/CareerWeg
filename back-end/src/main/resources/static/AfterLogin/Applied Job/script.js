
  document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/api/users/applied-jobs", {
      credentials: 'include' // Include cookies/session
    });
    const container = document.querySelector(".job-list-form");

    if (!res.ok) {
      if (res.status === 401) {
        container.innerHTML = "<p style='padding:1rem;'>Please log in to view your applied jobs.</p>";
        setTimeout(() => {
          window.location.href = "/login/login.html";
        }, 2000);
        return;
      }
      container.innerHTML = "<p style='padding:1rem;'>Failed to load applied jobs.</p>";
      return;
    }

    const applications = await res.json();
    container.innerHTML = ""; // Clear existing content

    applications.forEach(app => {
      const job = app.job;
      const appliedDate = new Date(app.appliedAt).toLocaleDateString();

      const jobBlock = document.createElement("div");
      jobBlock.className = "job-card";

      jobBlock.innerHTML = `
        <input type="hidden" name="job_title" value="${job.jobTitle}">
        <input type="hidden" name="job_details" value="${job.duration || "-"} / Rs ${job.minBudget || 0}-${job.maxBudget || 0}">
        <input type="hidden" name="job_date" value="${appliedDate}">
        <div class="job-info">
          <span class="job-title">${job.jobTitle}</span>
          <span class="job-details">${job.duration || "-"} / Rs ${job.minBudget || 0}-${job.maxBudget || 0}</span>
        </div>
        <div class="job-date">${appliedDate}</div>
        <button type="button" class="view-btn" onclick="window.location.href='/AfterLogin/ViewDetail/index.html?jobId=${job.id}'">
          View Detail
        </button>
      `;

      container.appendChild(jobBlock);
    });
  });
