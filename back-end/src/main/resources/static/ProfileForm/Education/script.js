// Global list of education entries
let educationList = [];

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

function toggleBox(element) {
  element.classList.toggle('selected');
}

function saveEducationEntry(degree, institution, year) {
  educationList.push({ degree, institution, year });
  console.log("Saved education:", { degree, institution, year });
  console.log("Current list:", educationList);
}

function replaceProfileBoxWithEducation() {
  const oldProfileBox = document.querySelector('.profile-box');

  if (oldProfileBox) {
    const newProfileBox = document.createElement('div');
    newProfileBox.classList.add('profile-box');
    newProfileBox.style.display = 'flex';
    newProfileBox.style.flexDirection = 'column';
    newProfileBox.style.height = '100%';

    newProfileBox.innerHTML = `
      <div class="profile-header">
        <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBack()">
        <span class="section-title">Add Education</span>
      </div>

<div>
        <form class="education-form" style="flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <label class="input-label">Degree</label>
            <input id="degree" type="text" class="input-field" style="margin-bottom: 1rem;">

            <label class="input-label">Institution</label>
            <input id="institution" type="text" class="input-field" style="margin-bottom: 1rem;">

            <label class="input-label">Year</label>
            <input id="year" type="text" class="input-field" style="margin-bottom: 1.5rem;">
          </div>

          <div style="display: flex; justify-content: center; margin-top: 1rem;">
            <button type="button" class="next-button" style="width: 150px; font-size: 12px; padding: 8px 0;" onclick="saveEducationAndShowList()">Save</button>
          </div>
        </form>
      </div>
    `;

    oldProfileBox.parentNode.replaceChild(newProfileBox, oldProfileBox);
  }
}

function renderEducationSummaryBox() {
  const oldBox = document.querySelector('.profile-box');
  if (!oldBox) return;

  const newProfileBox = document.createElement('div');
  newProfileBox.classList.add('profile-box');
  newProfileBox.style.height = '100%';
  newProfileBox.style.display = 'flex';
  newProfileBox.style.flexDirection = 'column';
  

  newProfileBox.innerHTML = `
    <h2 class="profile-title">Create profile</h2>
    <div class="profile-header">
      <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBack()">
      <span class="step-count">3/8</span>
    </div>
    <div class="progress-bar">
      <div class="progress"></div>
    </div>
    <div class="profile-content" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
      <h3>Education History</h3>
      <p>Where did you study?</p>
<div class="education-list" style="flex: 1; overflow-y: auto; padding-right: 8px; margin-bottom: 1rem;"></div>

      <div style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: center;">
        <button class="add-more-education-button" onclick="replaceProfileBoxWithEducation()">+ Add More Education</button>
        <button class="next-button" onclick="submitEducations()">Next</button>
      </div>
    </div>
  `;

  oldBox.parentNode.replaceChild(newProfileBox, oldBox);

  const list = newProfileBox.querySelector('.education-list');
  educationList.forEach(({ degree, institution, year }) => {
    const card = document.createElement('div');
    card.classList.add('education-card');
    card.style.marginBottom = '1rem';
    card.style.padding = '0.5rem 1rem';
    card.style.border = '1px solid #ccc';
    card.style.borderRadius = '8px';
    card.style.backgroundColor = '#f9f9f9';
    card.innerHTML = `
      <div class="education-degree"><strong>Degree:</strong> ${degree}</div>
      <div class="education-institution"><strong>Institution:</strong> ${institution}</div>
      <div class="education-year"><strong>Year:</strong> ${year}</div>
    `;
    list.appendChild(card);
  });
}

function saveEducationAndShowList() {
  const degree = document.getElementById('degree').value;
  const institution = document.getElementById('institution').value;
  const year = document.getElementById('year').value;

  if (!degree || !institution || !year) {
    alert("Please fill in all fields before saving.");
    return;
  }

  saveEducationEntry(degree, institution, year);
  renderEducationSummaryBox();
}

async function submitEducations() {
  console.log("Submitting educations:", educationList);

  if (educationList.length === 0) {
    alert("Please add at least one education entry before continuing.");
    return;
  }

  const response = await fetch("/api/users/save-educations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include', // Include cookies/session
    body: JSON.stringify(educationList)
  });

  if (response.ok) {
    window.location.href = "/ProfileForm/NextPage/index.html";
  } else if (response.status === 401) {
    // User not logged in, redirect to login page
    alert("Please log in to save your education.");
    window.location.href = "/login/login.html";
  } else {
    alert("Something went wrong saving education. Please try again.");
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // Check if user is logged in first
  const isLoggedIn = await checkUserSession();
  if (!isLoggedIn) {
    return; // Stop execution if not logged in
  }
  
  const addEducationButton = document.querySelector('.add-experience-button');
  if (addEducationButton) {
    addEducationButton.addEventListener('click', replaceProfileBoxWithEducation);
  }
});
