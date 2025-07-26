let languageList = [];

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
function goToEducationPage() {
    window.location.href = "../Education/index.html";
  }
  

function replaceProfileBoxWithLanguage() {
  const oldProfileBox = document.querySelector('.profile-box');

  if (oldProfileBox) {
    const newBox = document.createElement('div');
    newBox.classList.add('profile-box');

    newBox.innerHTML = `
      <div class="profile-header">
        <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="goBackToLanguageMain()">
        <span class="section-title">Add Language</span>
      </div>
      <div class="profile-content">
        <form class="language-form">
          <label class="input-label">Language</label>
          <input id="language" type="text" class="input-field" style="margin-bottom: 1rem;">

          <label class="input-label">Proficiency</label>
          <input id="proficiency" type="text" class="input-field" style="margin-bottom: 1.5rem;">

          <button type="button" class="next-button" onclick="saveLanguageAndShowList()">Save</button>
        </form>
      </div>
    `;

    oldProfileBox.parentNode.replaceChild(newBox, oldProfileBox);
  }
}

function saveLanguageAndShowList() {
  const language = document.getElementById('language').value;
  const proficiency = document.getElementById('proficiency').value;

  if (!language || !proficiency) {
    alert("Please fill in both fields.");
    return;
  }

  languageList.push({ name:language, proficiency });

  const newBox = document.createElement('div');
  newBox.classList.add('profile-box');

  newBox.innerHTML = `
    <h2 class="profile-title">Create profile</h2>
    <div class="profile-header">
      <img src="../../assets/img/vector-arrow.png" alt="Back" class="back-button" onclick="replaceProfileBoxWithLanguage()">
      <span class="step-count">4/8</span>
    </div>
    <div class="progress-bar">
      <div class="progress" style="width: 40%;"></div>
    </div>
    <div class="profile-content">
      <h3>Add languages</h3>
      <p>Proficiency level you speak</p>

      <div class="language-list">
        ${languageList.map(lang => `
          <div class="language-card">
            <div class="language-name">${lang.name}</div>
            <div class="language-proficiency">${lang.proficiency}</div>
          </div>
        `).join('')}
      </div>

      <button class="add-more-education-button" onclick="replaceProfileBoxWithLanguage()">+ Add Language</button>
      <button class="next-button" onclick="submitLanguages()">Next</button>
    </div>
  `;

  const oldBox = document.querySelector('.profile-box');
  oldBox.parentNode.replaceChild(newBox, oldBox);
}
function goBackToLanguageMain() {
    window.location.reload(); // reloads current `index.html` (Language main)
  }
  

async function submitLanguages() {
  if (languageList.length === 0) {
    alert("Please add at least one language.");
    return;
  }

  const response = await fetch("/api/users/save-languages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include', // Include cookies/session
    body: JSON.stringify(languageList)
  });

  if (response.ok) {
    window.location.href = "/ProfileForm/Skills/index.html";
  } else if (response.status === 401) {
    // User not logged in, redirect to login page
    alert("Please log in to save your languages.");
    window.location.href = "/login/login.html";
  } else {
    alert("Something went wrong saving language data. Please try again.");
  }
}

document.addEventListener('DOMContentLoaded', async function () {
  // Check if user is logged in first
  const isLoggedIn = await checkUserSession();
  if (!isLoggedIn) {
    return; // Stop execution if not logged in
  }
  
  const addLanguageButton = document.querySelector('.add-experience-button');
  if (addLanguageButton) {
    addLanguageButton.addEventListener('click', replaceProfileBoxWithLanguage);
  }
});
