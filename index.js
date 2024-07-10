"use strict";

// Wes doesn't talk
const NUMBER_OF_TALKING_DST_CHARACTERS = 17

class Logger {
    /**
     * @param {HTMLElement} element 
     */
    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error('Logger needs a valid DOM element.');
        }
        this.element = element;
    }

    /**
     * @param {String} type 
     * @param {String} message 
     */
    logMessage(type, message) {
        this.element.textContent += `[${type.toUpperCase()}] ${message}\n`;
    }

    clear() {
        this.element.innerHTML = '';
    }

    info(message) {
        this.logMessage("info", message);
    }

    warn(message) {
        this.logMessage("warn", message);
    }

    error(message) {
        this.logMessage("error", message);
    }
}

const logElement = document.querySelector("#log");
const logger = new Logger(logElement);

console.debug("start");
const inputElement = document.querySelector("#file-input");
// if I handle the case where files are already selected, I won't have to clear the input
inputElement.value = null;
inputElement.addEventListener("change", handleFilesChanged);

/**
 * @param {Array<File>} files 
 */
async function readFiles(files) {
    const fileData = {};
    const fileReadPromises = files.map((file) => {
        const characterName = getCharacterNameFromFileName(file.name);
        return file.text()
            .then((data) => { fileData[characterName] = data; })
            .catch((reason) => { logger.error(`Failed to read file '${file.name}' because ${reason}`); });
    });

    return Promise.all(fileReadPromises).then(() => fileData);
}

/**
 * @param {String} fileName must fit the format "speech_name.lua"
 * @returns {String} the character name as used in the game files
 */
function getCharacterNameFromFileName(fileName) {
    const characterName = fileName.substring(7, fileName.length - 4);
    return characterName;
}

/**
 * @param {Event} e
 */
async function handleFilesChanged(e) {
    logger.clear();
    const files = Array.from(this.files);
    if (files.length === 0) {
        console.debug("Zero files given, stopping early...");
        return;
    }

    const fileData = await readFiles(files);
    const numberOfReadFiles = Object.keys(fileData).length;
    logger.info(`Read ${numberOfReadFiles} files.`)
    if (numberOfReadFiles < NUMBER_OF_TALKING_DST_CHARACTERS) {
        logger.warn(`Did you select all files? DST has ${NUMBER_OF_TALKING_DST_CHARACTERS} speaking characters.`);
    }
    console.log(fileData);
}

/**
 * @param {String} error 
 */
function showError(error) {
    const errorElement = document.querySelector("#error");
    errorElement.textContent = error;
}


// the key is the name in the game files
const characterNamesMap = {
    walter: {
        quotesTemplateName: "walter",
        displayName: "Walter",
    },
    wanda: {
        quotesTemplateName: "wanda",
        displayName: "Wanda",
    },
    warly: {
        quotesTemplateName: "warly",
        displayName: "Warly",
    },
    wathgrithr: {
        quotesTemplateName: "wigfrid",
        displayName: "Wigfrid",
    },
    waxwell: {
        quotesTemplateName: "maxwell",
        displayName: "Maxwell",
    },
    webber: {
        quotesTemplateName: "webber",
        displayName: "Webber",
    },
    wendy: {
        quotesTemplateName: "wendy",
        displayName: "Wendy",
    },
    wickerbottom: {
        quotesTemplateName: "wickerbottom",
        displayName: "Wickerbottom",
    },
    willow: {
        quotesTemplateName: "willow",
        displayName: "Willow",
    },
    wilson: {
        quotesTemplateName: "wilson",
        displayName: "Wilson",
    },
    winona: {
        quotesTemplateName: "winona",
        displayName: "Winona",
    },
    wolfgang: {
        quotesTemplateName: "wolfgang",
        displayName: "Wolfgang",
    },
    woodie: {
        quotesTemplateName: "woodie",
        displayName: "Woodie",
    },
    wormwood: {
        quotesTemplateName: "wormwood",
        displayName: "Wormwood",
    },
    wortox: {
        quotesTemplateName: "wortox",
        displayName: "Wortox",
    },
    wurt: {
        quotesTemplateName: "wurt",
        displayName: "Wurt",
    },
    wx78: {
        quotesTemplateName: "wx78",
        displayName: "WX-78",
    },
};

// TODO: convert wigfrid speech Ö?
