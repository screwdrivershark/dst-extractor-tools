"use strict";
/* global fengari */

// Wes doesn't talk
// the key is the name in the game files
const KNOWN_CHARACTER_NAMES = {
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
const NUMBER_OF_TALKING_DST_CHARACTERS = Object.keys(KNOWN_CHARACTER_NAMES).length;
/**
 * @type {Array.<Object>}
 */
let fileData = {};
let characterNames = {};

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
        console.debug(message);
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

function quotesAreSameStructure(quotesData) {
    const areSameType = quotesData.every((element) => typeof element.data === typeof quotesData[0].data);
    const areSameNumberOfEntries = (() => {
        if (typeof quotesData[0].data === "object") {
            return quotesData.every((element) => JSON.stringify(Object.keys(element.data)) === JSON.stringify(Object.keys(quotesData[0].data)));
        }
        return true;
    })();

    return areSameType && areSameNumberOfEntries;
}

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

    logger.info(`Searching quotes for identifier "${searchText}".`);
    const quotesData = getQuotes(quoteIds);
    if (quotesData.length === 0) {
        logger.info("Not creating template because no quotes were found!");
        return;
    }
    if (!quotesAreSameStructure(quotesData)) {
        logger.error("Something is wrong with the data?!");
        logger.debug("Not all quotes data is of the same type or same number of object keys for some reason.");
        console.debug(quotesData);
        return;
    }

    if (typeof quotesData[0].data === "object") {
        const postProcessed = postProcessMany(quotesData);
        const sorted = sortQuotes(postProcessed);
        const template = getTemplateMany(sorted);
        templateElement.value = template;
    } else {
        const postProcessed = postProcess(quotesData);
        const sorted = sortQuotes(postProcessed);
        const template = getTemplate(sorted);
        templateElement.value = template;
    }
}

/**
 * @param {Array.<Object>} quotesData
 * @returns {Array.<Object>}
 */
function postProcess(quotesData) {
    const wigfridQuoteDatum = findQuoteDatumByName(quotesData, "wathgrithr");
    if (wigfridQuoteDatum !== undefined) {
        wigfridQuoteDatum.data = postProcessWigfrid(wigfridQuoteDatum.data);
    }
    return quotesData;
}

/**
 * @param {Array.<Object>} quotesData
 * @returns {Array.<Object>}
 */
function postProcessMany(quotesData) {
    const wigfridQuoteDatum = findQuoteDatumByName(quotesData, "wathgrithr");
    if (wigfridQuoteDatum !== undefined) {
        for (const [key, value] of Object.entries(wigfridQuoteDatum.data)) {
            wigfridQuoteDatum.data[key] = postProcessWigfrid(value);
        }
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
    const processed = fengari.load(luaFunction)().apply({ value: quote }, {}); // no clue what exactly the arguments for apply() must be
    return processed;
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
    return characterNames[chosenDatum.name].quotesTemplateName;
}

/**
 * @param {Array.<Object>} quotesData
 * @returns {Array.<Object>} sorted by how the characters appear in the game with unknown characters appended
 */
function sortQuotes(quotesData) {
    const NAME_DISPLAY_ORDER = [
        "wilson",
        "willow",
        "wolfgang",
        "wendy",
        "wx78",
        "wickerbottom",
        "woodie",
        "waxwell",
        "wathgrithr",
        "webber",
        "winona",
        "warly",
        "wortox",
        "wormwood",
        "wurt",
        "walter",
        "wanda",
    ];
    const sortedQuotesData = [];
    NAME_DISPLAY_ORDER.forEach((name) => {
        const i = quotesData.findIndex((element) => element.name === name);
        if (i > -1) {
            const quoteDatum = quotesData[i];
            sortedQuotesData.push(quoteDatum);
            quotesData.splice(i, 1);
        }
    });
    // append unknown characters at the end
    const fullQuotesData = sortedQuotesData.concat(quotesData);
    return fullQuotesData;
}

/**
 * @param {Array.<Object>} quotesData
 * @param {Boolean} quiet
 * @returns {String}
 */
function getTemplate(quotesData, quiet) {
    if (!quiet) {
        logger.info(`Creating template for ${quotesData.length} character(s).`);
    }
    const charactersTemplate = quotesData.reduce((acc, quoteDatum) => acc + `\n|${characterNames[quoteDatum.name].quotesTemplateName} = ${quoteDatum.data}`, "");
    const chosenCharacter = chooseCharacter(quotesData);
    const template = `{{Quotes${charactersTemplate}\n|choose = ${chosenCharacter}\n}}\n`;
    return template;
}

/**
 *
 * @param {String} key
 */
function formatTabName(key) {
    key = key.replace("_", " ").toLowerCase();
    return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * @param {Array.<Object>} quotesData the .data has quotes for multiple keys
 */
function getTemplateMany(quotesData) {
    const keys = Object.keys(quotesData[0].data);
    const keyNames = keys.map((element) => formatTabName(element));
    logger.info(`Creating templates for ${quotesData.length} character(s) and tabs named ${keyNames.join(", ")}.`);
    let template = "<tabber>\n";
    keys.forEach((key) => {
        template += `|-|${formatTabName(key)}=\n`;
        const quotesDataForOneKey = quotesData.map((element) => { return { name: element.name, data: element.data[key] }; });
        const templateForOneKey = getTemplate(quotesDataForOneKey, true);
        template += templateForOneKey;
    });
    template += "</tabber>\n";
    return template;
}

/**
 * get quotes for every character
 * @param {Array.<String>} quoteIds
 * @returns {Array.<Object>}
 */
function getQuotes(quoteIds) {
    const quotes = [];
    fileData.forEach((fileDatum) => {
        try {
            const data = searchQuote(fileDatum.data, quoteIds);
            quotes.push({
                name: fileDatum.name,
                data: data,
            });
        } catch (error) {
            logger.debug("Error trying to get quote data (from Lua): " + error.message);
            logger.warn(`Failed to find the quote(s) for ${characterNames[fileDatum.name].displayName}!`);
        }
    });
    return quotes;
}

function getFullScript(speechFileCode) {
    // from https://gist.github.com/daurnimator/5a7fa933e96e14333962093322e0ff95/
    // as I didn't get js.createproxy(x, "object") to work
    const convertToObjectCode = `
        local js = require "js"

        local function Object(t)
            if type(t) ~= 'table' then return t end
            local o = js.new(js.global.Object)
            for k, v in pairs(t) do
                --assert(type(k) == "string" or js.typeof(k) == "symbol", "JavaScript object only has string and symbol keys")
                o[k] = Object(v)
            end
            return o
        end

        return Object(
    `;
    return convertToObjectCode + speechFileCode.slice(speechFileCode.search("return") + "return".length) + ")";
}

/**
 * search through the speech file data as a lua object and try to find the quote(s) corresponding to quoteIds
 * @param {String} speechCode
 * @param {Array.<String>} quoteIds
 * @returns {String|Object}
 */
function searchQuote(speechCode, quoteIds) {
    const fullScript = getFullScript(speechCode);
    const data = fengari.load(fullScript)();
    const quoteData = quoteIds.reduce((acc, key) => acc?.[key], data);

    if (quoteData === undefined) {
        throw new Error("No data was found!");
    }
    // if it is an array of two or more strings (but as object)
    // like with describe.abigail.level1
    if (typeof quoteData === "object" && quoteData[1]) {
        throw new Error("Unsupported data, multiple quotes were found.");
    }

    return quoteData;
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

    const unknownCharacterNames = handleUnknownCharacters(fileData);
    characterNames = structuredClone(KNOWN_CHARACTER_NAMES);
    Object.assign(characterNames, unknownCharacterNames);
}

/**
 * @param {Array.<Object>} fileData
 * @returns {Object} name data for unknown characters, where the quotes template name and
 *  the display name are both just the name extracted from the "speech_name.lua"
 */
function handleUnknownCharacters(fileData) {
    const unknownCharacterNames = {};
    fileData.forEach((fileDatum) => {
        const name = fileDatum.name;
        if (!Object.prototype.hasOwnProperty.call(KNOWN_CHARACTER_NAMES, name)) {
            logger.info(`Found unknown character ${name}.`);
            unknownCharacterNames[name] = {
                quotesTemplateName: name,
                displayName: name,
            };
        }
    });
    return unknownCharacterNames;
}
