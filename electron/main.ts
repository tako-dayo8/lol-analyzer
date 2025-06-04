import { app, BrowserWindow } from 'electron';

const createWindow = () => {
    const win = new BrowserWindow();

    if (app.isPackaged || process.env.DEB_MODE === 'file') {
        // Load the production URL if the app is packaged
        win.loadFile(`${__dirname}/../index.html`);
        // hide the menu bar
        win.setMenuBarVisibility(false);

        if (process.env.DEB_MODE === 'file') {
            win.webContents.openDevTools();
            // hide the menu bar
            win.setMenuBarVisibility(true);
        } else {
            // hide the menu bar
            win.setMenuBarVisibility(false);
        }
    } else {
        // Load the development URL if the app is not packaged
        win.webContents.openDevTools();
        win.loadURL('http://localhost:5173/');
        // show the menu bar
        win.setMenuBarVisibility(true);
    }
};

app.whenReady().then(createWindow);
