
  document.addEventListener("DOMContentLoaded", async function () {
    const tbody = document.getElementById("job-list-body");

    try {
      const response = await fetch("/api/jobs/employer-jobs");

      if (!response.ok) {
        throw new Error("Failed to load job listings.");
      }

      const jobs = await response.json();
      tbody.innerHTML = ""; // Clear existing rows

      jobs.forEach(job => {
        const deadline = new Date(job.deadline);
        const today = new Date();

        const isExpired = deadline < today;
        const stateText = isExpired ? "Expired" : "Active";
        const stateClass = isExpired ? "deactive" : "active";

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <span class="job-name">${job.jobTitle}</span><br />
            <span class="job-info">${job.duration || '-'} / Rs ${job.minBudget || 0}-${job.maxBudget || 0}</span>
          </td>
          <td class="status ${stateClass}">${stateText}</td>
          <td>${deadline.toLocaleDateString()}</td>
<td>
  <button class="btn" onclick="window.location.href='/hire/totalapplicant/index.html?jobId=${job.id}'">
    View Applicant
  </button>
</td>

        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      console.error(error);
      tbody.innerHTML = `<tr><td colspan="4">Error loading jobs.</td></tr>`;
    }
  });

