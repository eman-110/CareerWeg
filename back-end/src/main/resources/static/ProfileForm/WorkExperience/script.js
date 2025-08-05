let workExperienceList = [];

function toggleBox(element) {
  element.classList.toggle('selected');
}

function toggleCurrentlyWorking(checkbox, toDateId = "toDate") {
  const toDateInput = document.getElementById(toDateId);
  if (checkbox.checked) {
    toDateInput.disabled = true;
    toDateInput.value = ""; // clear value
  } else {
    toDateInput.disabled = false;
  }
}

function replaceProfileBox() {
  const oldProfileBox = document.querySelector('.profile-box');

  if (oldProfileBox) {
    const newProfileBox = document.createElement('div');
    newProfileBox.classList.add('profile-box2');

    newProfileBox.innerHTML = `
      <div class="profile-header2">
        <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBack()">
        <span class="section-title">Add Work Experience</span>
      </div>

      <div class="profile-content">
        <form class="work-experience-form">
          <label class="input-label">Job Title</label>
          <input id="jobTitle" type="text" class="input-field">

          <label class="input-label">Company</label>
          <input id="companyName" type="text" class="input-field">

          <div class="two-columns">
            <div class="column">
              <label class="input-label">From</label>
              <input id="fromDate" type="date" class="input-field2">
            </div>
            <div class="column">
              <label class="input-label">To</label>
              <input id="toDate" type="date" class="input-field">
            </div>
          </div>

          <label class="experience-option">
            <input type="checkbox" id="currentlyWorking" onchange="toggleCurrentlyWorking(this)">
            <span class="no-experience-text">I currently work here</span>
          </label>

          <label class="input-label">Description</label>
          <textarea class="textarea-field" id="description"></textarea>

          <button type="button" class="next-button" onclick="replaceWithProfileBox3()">Save</button>
        </form>
      </div>
    `;

    oldProfileBox.parentNode.replaceChild(newProfileBox, oldProfileBox);
  }
}

function replaceWithProfileBox3() {
  const oldBox = document.querySelector('.profile-box2');

  if (oldBox) {
    const jobTitle = document.getElementById('jobTitle').value;
    const companyName = document.getElementById('companyName').value;
    const fromDate = new Date(document.getElementById('fromDate').value);
    const toDateInput = document.getElementById('toDate');
    const toDate = toDateInput.disabled ? "Present" : new Date(toDateInput.value);
    const description = document.getElementById("description").value;

    if (!jobTitle || !companyName || !fromDate || (!toDateInput.disabled && !toDateInput.value)) {
      alert("Please fill all required fields.");
      return;
    }

    saveWorkExperienceEntry(
      jobTitle,
      companyName,
      fromDate.toISOString(),
      toDate === "Present" ? "Present" : toDate.toISOString(),
      description
    );

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fromText = `${monthNames[fromDate.getMonth()]} ${fromDate.getFullYear()}`;
    const toText = toDate === "Present" ? "Present" : `${monthNames[toDate.getMonth()]} ${toDate.getFullYear()}`;

    const newProfileBox = document.createElement('div');
    newProfileBox.classList.add('profile-box3');

    newProfileBox.innerHTML = `
      <h2 class="profile-title">Create profile</h2>
      <div class="profile-header">
        <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBack()">
        <span class="step-count">2/8</span>
      </div>
      <div class="progress-bar"><div class="progress"></div></div>
      <div class="profile-content">
        <h3>Work Experiences</h3>
        <p>Where have you worked before?</p>
        <div class="experience-list">
          <div class="experience-card">
            <div class="experience-job">${jobTitle}</div>
            <div class="experience-company">${companyName}</div>
            <div class="experience-dates">${fromText} - ${toText}</div>
          </div>
        </div>
        <button class="add-more-experience-button" onclick="openAddMoreExperience()">+ Add More Experience</button>
        <button class="next-button" onclick="submitWorkExperiences()">Next</button>
      </div>
    `;

    oldBox.parentNode.replaceChild(newProfileBox, oldBox);
  }
}

function openAddMoreExperience() {
  const profileBox3 = document.querySelector('.profile-box3');

  if (profileBox3) {
    const newFormBox = document.createElement('div');
    newFormBox.classList.add('profile-box2-2');

    newFormBox.innerHTML = `
      <div class="profile-header2">
        <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBack()">
        <span class="section-title">Add Work Experience</span>
      </div>

      <div class="profile-content">
        <form class="work-experience-form">
          <label class="input-label">Job Title</label>
          <input id="jobTitle2" type="text" class="input-field">

          <label class="input-label">Company</label>
          <input id="companyName2" type="text" class="input-field">

          <div class="two-columns">
            <div class="column">
              <label class="input-label">From</label>
              <input id="fromDate2" type="date" class="input-field2">
            </div>
            <div class="column">
              <label class="input-label">To</label>
              <input id="toDate2" type="date" class="input-field">
            </div>
          </div>

          <label class="experience-option">
            <input type="checkbox" id="currentlyWorking2" onchange="toggleCurrentlyWorking(this, 'toDate2')">
            <span class="no-experience-text">I currently work here</span>
          </label>

          <label class="input-label">Description</label>
          <textarea class="textarea-field" id="description2"></textarea>

          <button type="button" class="next-button" onclick="addExperienceCard2()">Save</button>
        </form>
      </div>
    `;

    profileBox3.parentNode.replaceChild(newFormBox, profileBox3);
  }
}

function addExperienceCard2() {
  const oldFormBox = document.querySelector('.profile-box2-2');

  if (oldFormBox) {
    const jobTitle = document.getElementById('jobTitle2').value;
    const companyName = document.getElementById('companyName2').value;
    const fromDate = new Date(document.getElementById('fromDate2').value);
    const toDateInput = document.getElementById('toDate2');
    const toDate = toDateInput.disabled ? "Present" : new Date(toDateInput.value);
    const description = document.getElementById("description2").value;

    if (!jobTitle || !companyName || !fromDate || (!toDateInput.disabled && !toDateInput.value)) {
      alert("Please fill all required fields.");
      return;
    }

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fromText = `${monthNames[fromDate.getMonth()]} ${fromDate.getFullYear()}`;
    const toText = toDate === "Present" ? "Present" : `${monthNames[toDate.getMonth()]} ${toDate.getFullYear()}`;

    saveWorkExperienceEntry(
      jobTitle,
      companyName,
      fromDate.toISOString(),
      toDate === "Present" ? "Present" : toDate.toISOString(),
      description
    );

    const newProfileBox3 = document.createElement('div');
    newProfileBox3.classList.add('profile-box3');

    newProfileBox3.innerHTML = `
      <h2 class="profile-title">Create profile</h2>
      <div class="profile-header">
        <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBack()">
        <span class="step-count">2/8</span>
      </div>
      <div class="progress-bar"><div class="progress"></div></div>
      <div class="profile-content">
        <h3>Work Experiences</h3>
        <p>Where have you worked before?</p>
        <div class="experience-list">
          ${workExperienceList.map(exp => `
            <div class="experience-card">
              <div class="experience-job">${exp.jobTitle}</div>
              <div class="experience-company">${exp.company}</div>
              <div class="experience-dates">${new Date(exp.fromDate).toLocaleString('default', { month: 'short' })} ${new Date(exp.fromDate).getFullYear()} - ${exp.toDate === "Present" ? "Present" : `${new Date(exp.toDate).toLocaleString('default', { month: 'short' })} ${new Date(exp.toDate).getFullYear()}`}</div>
            </div>
          `).join('')}
        </div>
        <button class="add-more-experience-button" onclick="openAddMoreExperience()">+ Add More Experience</button>
        <button class="next-button" onclick="submitWorkExperiences()">Next</button>
      </div>
    `;

    oldFormBox.parentNode.replaceChild(newProfileBox3, oldFormBox);
  }
}

function saveWorkExperienceEntry(jobTitle, company, fromDate, toDate, description) {
  workExperienceList.push({ jobTitle, company, fromDate, toDate, description });
}

async function submitWorkExperiences() {
  const response = await fetch("/api/users/save-work-experiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include', // Include cookies/session
    body: JSON.stringify(workExperienceList),
  });

  if (response.ok) {
    window.location.href = "/ProfileForm/Education/index.html";
  } else if (response.status === 401) {
    // User not logged in, redirect to login page
    alert("Please log in to save your work experiences.");
    window.location.href = "/login/login.html";
  } else {
    alert("Failed to save work experiences. Please try again.");
  }
}

// Check if user is logged in when page loads
async function checkUserSession() {
  try {
    const response = await fetch("/api/users/full-profile", {
      method: "GET",
      credentials: 'include'
    });
    
    if (response.status === 401) {
      // User not logged in, redirect to login
      alert("Please log in to access this page.");
      window.location.href = "/login/login.html";
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking session:", error);
    alert("Please log in to access this page.");
    window.location.href = "/login/login.html";
    return false;
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // Check if user is logged in first
  const isLoggedIn = await checkUserSession();
  if (!isLoggedIn) {
    return; // Stop execution if not logged in
  }
  
  const addExperienceButton = document.querySelector('.add-experience-button');
  if (addExperienceButton) {
    addExperienceButton.addEventListener('click', replaceProfileBox);
  }
});
