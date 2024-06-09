const { app, BrowserWindow } = require('electron');
const { machineId } = require('node-machine-id');
const fs = require('fs');
const os = require('os');

// const KEYFORGE_BASE_URL = 'https://keyforge.dev';
const KEYFORGE_BASE_URL = 'http://localhost:3000';
const KEYFORGE_PRODUCT_ID = 'YOUR_PRODUCT_ID';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  });

  win.loadFile('./src/index.html');
};

app.whenReady().then(async () => {
  const isValid = await validateLicense();

  if (!isValid) {
    const activateWindow = new BrowserWindow({
      width: 400,
      height: 300,
    });

    activateWindow.loadFile('./src/activate.html');
  } else {
    createWindow();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

async function validateLicense() {
  let licenseKey, deviceIdentifier;

  try {
    const licenseData = fs.readFileSync(
      `${app.getPath('userData')}/license.json`,
      'utf-8'
    );

    const payload = JSON.parse(licenseData);

    licenseKey = payload.licenseKey;
    deviceIdentifier = payload.deviceIdentifier;
  } catch (error) {
    return false;
  }

  if (!licenseKey || !deviceIdentifier) {
    return false;
  }

  const response = await fetch(
    `${KEYFORGE_BASE_URL}/api/v1/public/licenses/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        licenseKey,
        deviceIdentifier,
        productId: KEYFORGE_PRODUCT_ID,
      }),
    }
  );

  const data = await response.json();

  return !!data.isValid;
}

async function activateLicense(licenseKey) {
  const deviceIdentifier = await machineId();
  const deviceName = os.hostname();

  try {
    const response = await fetch(
      `${KEYFORGE_BASE_URL}/api/v1/public/licenses/activate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          licenseKey,
          deviceIdentifier,
          deviceName,
          productId: KEYFORGE_PRODUCT_ID,
        }),
      }
    );

    fs.writeFileSync(
      `${app.getPath('userData')}/license.json`,
      JSON.stringify({
        licenseKey,
        deviceIdentifier,
      })
    );
  } catch (error) {
    console.error(error);
  }
}
