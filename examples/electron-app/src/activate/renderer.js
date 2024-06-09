const form = document.getElementById('activate-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const licenseKey = event.target.licenseKey.value;

  const message = await window.license.activate(licenseKey);

  if (message) {
    document.getElementById('message').textContent = message;
  }
});
