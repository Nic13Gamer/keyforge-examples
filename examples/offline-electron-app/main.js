const { app, BrowserWindow, ipcMain } = require('electron');
const { machineId } = require('node-machine-id');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { validateAndRefreshToken } = require('@keyforge/client/token');
const { activateLicense } = require('@keyforge/client');

const KEYFORGE_PRODUCT_ID = 'YOUR_PRODUCT_ID';
const KEYFORGE_PUBLIC_KEY = 'YOUR_PUBLIC_KEY_JWK';

const IS_CONNECTED = true; // Placeholder for actual connection check logic

const createWindow = async () => {
  console.log('Validating license token...');

  const {
    isValid,
    didRefresh,
    isValidButExpired,
    data: licenseData,
  } = await startupValidateLicense();

  if (!isValid) {
    if (isValidButExpired) {
      // Token is expired, but license is probably still valid
      // Should not prompt for activation
      console.log(
        'Token is expired. Could not fetch new token, skipping activation prompt.'
      );
      app.quit();
    } else {
      // Clear the license token if it is invalid
      saveLicenseToken('');
    }

    ipcMain.handle('activate-license', async (event, licenseKey) => {
      const { error, token } = await activateLicense({
        deviceIdentifier: await machineId(),
        deviceName: os.hostname(),
        licenseKey,
        productId: KEYFORGE_PRODUCT_ID,
      });

      if (error) {
        console.error(error.message);
        return error.message;
      }

      // Save the license token after activation
      if (token) {
        saveLicenseToken(token);
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
    console.log('License token is valid.');

    if (didRefresh) {
      console.log('License token was refreshed.');
    } else {
      console.log('License token was not refreshed.');
    }

    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, '/src/preload.js'),
        defaultFontFamily: {
          standard: 'Segoe UI',
        },
      },
    });

    win.loadFile('./src/index.html');

    win.webContents.on('did-finish-load', () => {
      win.webContents.send('license-data', licenseData);
    });
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

// Function to validate and optionally refresh the license token on app startup
async function startupValidateLicense() {
  const deviceIdentifier = await machineId();

  const licenseToken = getLicenseToken();

  if (!licenseToken) {
    return {
      isValid: false,
      didRefresh: false,
      isValidButExpired: false,
      data: null,
    };
  }

  const result = await validateAndRefreshToken({
    token: licenseToken,
    deviceIdentifier,
    productId: KEYFORGE_PRODUCT_ID,
    publicKeyJwk: KEYFORGE_PUBLIC_KEY,
    shouldRefresh: IS_CONNECTED,
  });

  if (result.isValid) {
    // Save the new license token if it was refreshed
    saveLicenseToken(result.token);

    return {
      isValid: result.isValid,
      didRefresh: result.didRefresh,
      isValidButExpired: result.isValidButExpired,
      data: result.data,
    };
  }

  return {
    isValid: result.isValid,
    didRefresh: result.didRefresh,
    isValidButExpired: result.isValidButExpired,
    data: result.data,
  };
}

function saveLicenseToken(token) {
  const data = {
    licenseToken: token,
  };

  fs.writeFileSync(
    `${app.getPath('userData')}/license.json`,
    JSON.stringify(data)
  );
}

function getLicenseToken() {
  try {
    const data = fs.readFileSync(
      `${app.getPath('userData')}/license.json`,
      'utf8'
    );
    const payload = JSON.parse(data);
    return payload.licenseToken;
  } catch (error) {
    return null;
  }
}
