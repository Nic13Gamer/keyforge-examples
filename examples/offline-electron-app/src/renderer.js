window.license.onLicenseData((data) => {
  document.getElementById('license-key').textContent =
    'License Key: ' + data.license.key;
  document.getElementById('device-name').textContent =
    'Device Name: ' + data.device.name;
});
