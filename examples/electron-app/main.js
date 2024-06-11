const { app, BrowserWindow, ipcMain } = require('electron');
const { machineId } = require('node-machine-id');
const fs = require('fs');
const os = require('os');
const path = require('path');

const KEYFORGE_BASE_URL = 'https://keyforge.dev';
const KEYFORGE_PRODUCT_ID = 'YOUR_PRODUCT_ID';

const createWindow = async () => {
  console.log('Validating license...');

  const isValid = await validateLicense();

  if (!isValid) {
    ipcMain.handle('activate-license', async (event, licenseKey) => {
      const { success, message } = await activateLicense(licenseKey);

      if (!success) {
        console.error(message);

        return message;
      }

      app.relaunch();
      app.quit();
    });

    const activateWindow = new BrowserWindow({
      width: 400,
      height: 300,
      resizable: false,
      webPreferences: {
        preload: path.join(__dirname, '/src/activate/preload.js'),
        defaultFontFamily: {
          standard: 'Segoe UI',
        },
      },
    });

    activateWindow.loadFile('./src/activate/index.html');
  } else {
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        defaultFontFamily: {
          standard: 'Segoe UI',
        },
      },
    });

    win.loadFile('./src/index.html');
  }
};

app.whenReady().then(async () => {
  createWindow();

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
  const deviceIdentifier = await machineId();

  let licenseKey;

  try {
    const licenseData = fs.readFileSync(
      `${app.getPath('userData')}/license.json`,
      'utf-8'
    );

    const payload = JSON.parse(licenseData);

    licenseKey = payload.licenseKey;
  } catch (error) {
    return false;
  }

  if (!licenseKey) {
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

    if (response.ok) {
      fs.writeFileSync(
        `${app.getPath('userData')}/license.json`,
        JSON.stringify({
          licenseKey,
        })
      );

      return { success: true, message: 'License activated successfully.' };
    } else {
      const data = await response.json();

      return { success: false, message: data.error.message };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
}
