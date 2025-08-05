document.addEventListener('DOMContentLoaded', async function () {
    const res = await fetch('/api/users/employer-contact', {
      credentials: 'include' // Include cookies/session
    });
    if (res.ok) {
      const data = await res.json();

      document.getElementById('user-name').innerHTML = `${data.firstName} ${data.lastName} <img src="https://img.icons8.com/material-rounded/16/000000/edit.png" alt="Edit" class="edit-icon"/>`;
      document.getElementById('user-email').textContent = data.email;
      document.getElementById('user-phone').textContent = data.phoneNumber;
      document.getElementById('user-address').textContent = `${data.city}, ${data.country}`;
    } else if (res.status === 401) {
      alert("Please log in to access the employer dashboard.");
      window.location.href = '/Hire/Login/index.html';
    } else {
      console.error("Failed to load employer info.");
    }
  });
  document.getElementById('logout-link').addEventListener('click', async function (event) {
    event.preventDefault(); // prevent navigating immediately

    const res = await fetch('/api/users/logout', { 
      method: 'GET',
      credentials: 'include' // Include cookies/session
    });

    if (res.ok) {
      window.location.href = '../Login/index.html'; // redirect to login
    } else {
      alert('Logout failed. Please try again.');
    }
  });