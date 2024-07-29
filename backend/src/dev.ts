import chokidar from "chokidar";
import { spawn } from "child_process";
import { copyFile } from "fs";

// Directories
const source = "/usr/src/source";
const distWatchDir = source + '/dist';

// Initialize watcher for dist directory
const distWatcher = chokidar.watch(distWatchDir, {
    persistent: true,
    ignoreInitial: true,
    depth: Infinity,
    usePolling: true,
    interval: 1000
});

async function runIndex() {
    try {
        const nodemon = spawn('nodemon', ['.']);

        nodemon.stdout.on('data', (data) => {
            console.log(`${data}`);
        });

        nodemon.stderr.on('data', (data) => {
            console.error(`${data}`);
        });

        nodemon.on('close', (code) => {
            console.log(`Node process exited with code ${code}`);
        });

        console.warn("[DeployNest Dev] Process exited!");
    } catch (e) {
        console.warn("[DeployNest Dev] Process ran into an exception and exited!");
        console.error(e);
    }
}

function startTscWatch() {
    const tsc = spawn('tsc', ['--watch'], {
        cwd: source,
    });

    // tsc.stdout.on('data', (data) => {
    //     console.log(`tsc: ${data}`);
    // });

    // tsc.stderr.on('data', (data) => {
    //     console.error(`tsc error: ${data}`);
    // });

    // tsc.on('close', (code) => {
    //     console.log(`tsc process exited with code ${code}`);
    // });
}

function handleDistChange(action: string, path: string) {
    if (action === "add" || action === "change") {
        const relativePath = path.replace(distWatchDir, "");
        console.log("relativePath", relativePath);
        copyFile(path, `/usr/src/app${relativePath}`, (err) => {
            if (err) console.error(`Error copying file: ${err}`);
        });
    }
}

// Add event listeners for dist directory
distWatcher
    .on('add', (filePath) => {
        console.log(`File ${filePath} has been added`);
        handleDistChange("add", filePath);
    })
    .on('change', (filePath) => {
        console.log(`File ${filePath} has been changed`);
        handleDistChange("change", filePath);
    })
    .on('unlink', (filePath) => {
        console.log(`File ${filePath} has been removed`);
    })
    .on('addDir', (dirPath) => {
        console.log(`Directory ${dirPath} has been added`);
    })
    .on('unlinkDir', (dirPath) => {
        console.log(`Directory ${dirPath} has been removed`);
    })
    .on('error', error => console.log(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'));
console.log(`Watching for file changes in ${distWatchDir}`);

// Start tsc --watch
startTscWatch();

// Run index
runIndex();