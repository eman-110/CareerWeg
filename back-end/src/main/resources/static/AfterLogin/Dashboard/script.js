
  document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/api/users/full-profile", {
      credentials: 'include' // Include cookies/session
    });
    if (!res.ok) {
      if (res.status === 401) {
        alert("Please log in to view your dashboard.");
        window.location.href = "/login/login.html";
        return;
      }
      return alert("Failed to load profile");
    }

    const { user, educations, experiences, languages } = await res.json();

    document.getElementById("profile-name").textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById("profile-title").textContent = user.profileTitle || "-";
    document.getElementById("profile-description").textContent = user.profileDescription || "-";

    document.getElementById("contact-info").innerHTML = `
      <p><strong>${user.portfolioLink || "No portfolio"}</strong></p>
      <p>${user.email}</p>
      <p>${user.phoneNumber}</p>
      <p>${user.city}, ${user.country}</p>
    `;

    const eduHTML = educations.map(e => `
      <div>
        <p><strong>${e.degree}</strong> / ${e.institution}</p>
        <p>${e.year}</p>
      </div>`).join("");
    document.getElementById("education-section").innerHTML = `<h2>Education Background</h2>${eduHTML}`;

    const expHTML = experiences.map(e => `
      <div>
        <p><strong>${e.jobTitle}</strong> / ${e.company}</p>
        <p>${e.fromDate} - ${e.toDate}</p>
        <p>${e.description}</p>
      </div>`).join("");
    document.getElementById("experience-section").innerHTML = `<h2>Work Experience</h2>${expHTML}`;

    document.getElementById("skills-section").innerHTML = `
      <h2>Skills</h2><p>${(user.skills || "").split(",").join("<br>")}</p>`;

    const langHTML = languages.map(l => `<p>${l.name}</p>`).join("");
    document.getElementById("language-section").innerHTML = `<h2>Language</h2>${langHTML}`;
  });
