"use strict";

// Wes doesn't talk
const NUMBER_OF_TALKING_DST_CHARACTERS = 17
let fileData;

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
const fileElement = document.querySelector("#file-input");
// if I handle the case where files are already selected, I won't have to clear the input
fileElement.value = null;
fileElement.addEventListener("change", handleFilesChanged);

const searchFormElement = document.querySelector("#search");
searchFormElement.addEventListener("submit", handleSearch)

/**
 * @param {SubmitEvent} e
 */
function handleSearch(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const searchText = formData.get("quote-id");
    const quoteIds = getQuoteIds(searchText);
    if (quoteIds.length === 0) {
        logger.error("No valid quote identifier was entered!");
        return;
    }


    const c = fengari.load(fileData.wolfgang)();
    console.log(c.get("ACTIONFAIL"));
}

/**
 * return the strings that identify a "path" to the quotes through the tables in the speech filese
 * @param {String} input
 * @returns {Array.<String>}
 */
function getQuoteIds(input) {
    const idSeparator = ".";
    const ids = input.split(idSeparator).map((id) => id.trim());
    return ids.filter((id) => id !== "").map((id) => id.toUpperCase());
}


/**
 * @param {Object} object
 * @returns {Boolean}
 */
function isEmpty(object) {
    return Object.keys(object).length === 0;
}

/**
 * @param {Array<File>} files
 */
async function readFiles(files) {
    const fileReadPromises = files.map((file) => {
        const name = getCharacterNameFromFileName(file.name);
        return file.text()
            .then((data) => ({ name: name, data: data }))
            .catch((reason) => { logger.error(`Failed to read file '${file.name}' because ${reason}`); });
    });

    return await Promise.all(fileReadPromises);
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

    fileData = await readFiles(files);
    const numberOfReadFiles = Object.keys(fileData).length;
    logger.info(`Read ${numberOfReadFiles} file(s).`)
    if (numberOfReadFiles < NUMBER_OF_TALKING_DST_CHARACTERS) {
        logger.warn(`Did you select all speech files? DST has ${NUMBER_OF_TALKING_DST_CHARACTERS} speaking characters.`);
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
// TODO: do I need to handle case where a quote ID has multiple strings? e.g. (walter's) ANNOUNCE_ROYALTY?
// TODO: clear logs when necessary, e.g. when entering new input?