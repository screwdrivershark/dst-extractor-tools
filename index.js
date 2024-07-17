"use strict";
/* global fengari */

// Wes doesn't talk
const NUMBER_OF_TALKING_DST_CHARACTERS = 17;
/**
 * @type {Array.<Object>}
 */

let fileData = {};

class Logger {
    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        if (!(element instanceof HTMLElement)) {
            throw new Error("Logger needs a valid DOM element.");
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
        this.element.innerHTML = "";
    }

    debug(message) {
        this.logMessage("debug", message);
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

const fileElement = document.querySelector("#file-input");
// because firefox doesn't clear input
// and clearing it makes sure that no old files are still selected
fileElement.value = null;
fileElement.addEventListener("change", handleFilesChanged);

const searchFormElement = document.querySelector("#search");
searchFormElement.addEventListener("submit", handleSearch);

const copyElement = document.querySelector("#copy");
const templateElement = document.querySelector("#template");
copyElement.addEventListener("click", () => {
    const text = templateElement.value;
    navigator.clipboard.writeText(text);
});


/**
 * @param {SubmitEvent} e
 */
function handleSearch(e) {
    e.preventDefault();
    logger.clear();
    templateElement.value = "";
    if (isEmpty(fileData)) {
        logger.error("No speech files were selected!");
        return;
    }

    const formData = new FormData(e.target);
    const searchText = formData.get("quote-id");
    const quoteIds = getQuoteIds(searchText);
    if (quoteIds.length === 0) {
        logger.error("No valid quote identifier was entered!");
        return;
    }

    const quotesData = getQuotes(quoteIds);
    const postProcessed = postProcess(quotesData);
    createTemplate(postProcessed);
}

/**
 * @param {Array.<Object>} quotesData
 * @returns {Array.<Object>}
 */
function postProcess(quotesData) {
    const wigfridQuoteDatum = findQuoteDatumByName(quotesData, "wathgrithr");
    if (wigfridQuoteDatum !== undefined) {
        wigfridQuoteDatum.quote = postProcessWigfrid(wigfridQuoteDatum.quote);
    }
    return quotesData;
}

/**
 * @param {String} quote
 * @returns {String}
 */
function postProcessWigfrid(quote) {
    // "Umlautify" from the game code
    const luaFunction = `
        return function (string)
            local string = string.value
            local ret = ""
            local last = false
            for i = 1, #string do
                local c = string:sub(i,i)
                if not last and (c == "o" or c == "O") then
                    ret = ret .. ((c == "o" and "ö") or (c == "O" and "Ö") or c)
                    last = true
                else
                    ret = ret .. c
                    last = false
                end
            end
            return ret
        end
    `;
    const processed = fengari.load(luaFunction)().invoke({ value: quote }, {}); // no clue what exactly the arguments for invoke() must be
    return processed[0];
}

/**
 * @param {Array.<Object>} quotesData
 * @param {String} name
 * @returns {Object|undefined}
 */
function findQuoteDatumByName(quotesData, name) {
    return quotesData.find((quoteDatum) => quoteDatum.name === name);
}

/**
 * return wilson if wilson is included, else the first character in the array
 * @param {Array.<Object>} quotesData
 * @returns {String}
 */
function chooseCharacter(quotesData) {
    let chosenDatum = findQuoteDatumByName(quotesData, "wilson");
    if (chosenDatum === undefined) {
        chosenDatum = quotesData[0];
    }
    return characterNamesMap[chosenDatum.name].quotesTemplateName;
}

/**
 * @param {Array.<Object>} quotesData
 */
function createTemplate(quotesData) {
    if (quotesData.length === 0) {
        logger.info("Not creating template because no quotes were found!");
        return;
    }
    logger.info(`Creating template for ${quotesData.length} character(s).`);
    const charactersTemplate = quotesData.reduce((acc, quoteDatum) => acc + `\n|${characterNamesMap[quoteDatum.name].quotesTemplateName}=${quoteDatum.quote}`, "");
    const chosenCharacter = chooseCharacter(quotesData);
    const template = `{{Quotes${charactersTemplate}\n|choose=${chosenCharacter}\n}}`;

    const templateElement = document.querySelector("#template");
    templateElement.value = template;
}

/**
 * @param {Array.<String>} quoteIds
 * @returns {Array.<Object>}
 */
function getQuotes(quoteIds) {
    const quotes = [];
    fileData.forEach((fileDatum) => {
        try {
            const quote = searchQuote(fileDatum.data, quoteIds);
            quotes.push({
                name: fileDatum.name,
                quote: quote,
            });
        } catch (error) {
            logger.debug("Error trying to get quote data (from Lua): " + error.message);
            logger.warn(`Failed to find the quote for ${characterNamesMap[fileDatum.name].displayName}!`);
        }
    });
    return quotes;
}

/**
 * search through the speech file data as a lua object and try to find the quote corresponding to quoteIds
 * @param {String} data
 * @param {Array.<String>} quoteIds
 */
function searchQuote(data, quoteIds) {
    let currentData = fengari.load(data)(); // the () at the end is important!
    quoteIds.forEach((id, index) => {
        const idsTillNow = quoteIds.slice(0, index).join(".");
        if (typeof currentData === "string") {
            throw new Error(`A quote was found already but then an attempt to get the quote's child (impossible) failed after ${idsTillNow}`);
        }
        const nextData = currentData.get(id);
        if (nextData === undefined) {
            throw new Error(`No data was found when trying the ID ${id} after ${idsTillNow}`);
        }
        currentData = nextData;
    });
    return currentData;
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
    templateElement.value = "";
    const files = Array.from(e.target.files);
    if (files.length === 0) {
        return;
    }

    fileData = await readFiles(files);
    const numberOfReadFiles = Object.keys(fileData).length;
    logger.info(`Read ${numberOfReadFiles} file(s).`);
    if (numberOfReadFiles < NUMBER_OF_TALKING_DST_CHARACTERS) {
        logger.warn(`Did you select all speech files? DST has ${NUMBER_OF_TALKING_DST_CHARACTERS} speaking characters.`);
    }
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

// TODO: do I need to handle case where a quote ID has multiple strings? e.g. (walter's) ANNOUNCE_ROYALTY?
// TODO: raise error when a quote identifier is too short and a whole table would be returned

// TODO: make a button at logs "show debug info"

