
# Vivokey Vault Browser Extension

The Vivokey Vault browser extension is a fork of the Bitwarden extension and is written using the Web Extension API and Angular. Main change is a move to Oauth2 login interface - this is dependent on a middleware server that processes Oauth2 requests for the extension and provides the master password. Default values are set to vault.vivokey.com and the Oauth2 API is handled by this.

# Build/Run

**Requirements**

- [Node.js](https://nodejs.org) v8.11 or greater
- [Gulp](https://gulpjs.com/) (`npm install --global gulp-cli`)
- Chrome (preferred), Opera, or Firefox browser

**Run the app**

```
npm install
npm run build:watch
```

You can now load the extension into your browser through the browser's extension tools page:

- Chrome/Opera:
  1. Type `chrome://extensions` in your address bar to bring up the extensions page.
  2. Enable developer mode (checkbox)
  3. Click the "Load unpacked extension" button, navigate to the `build` folder of your local extension instance, and click "Ok".
- Firefox
  1. Type `about:debugging` in your address bar to bring up the add-ons page.
  2. Click the `Load Temporary Add-on` button, navigate to the `build/manifest.json` file, and "Open".

