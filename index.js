"use strict";

const fileNameRegex = /speech_(.*)\.lua/;
console.log("start");
const inputElement = document.querySelector("#file-input");
// if I handle the case where files are already selected, I won't have to clear the input
inputElement.value = null;
inputElement.addEventListener("change", handleFilesChanged);

/**
 * @param {Array<File>} files 
 */
function readFiles(files) {
    const fileData = {};

    files.forEach((file) => {
        const characterName = getCharacterNameFromFileName(file.name);
        fileData[characterName] = characterName;
    });
    console.log(fileData);
}

/**
 * @param {String} fileName must fit the format "speech_name.lua"
 * @returns {String} the character name as used in the game files
 */
function getCharacterNameFromFileName(fileName) {
    const match = fileNameRegex.exec(fileName);
    if (match) {
        return match[1];
    } else {
        throw Error(`Couldn't find a character name in the file name '${fileName}'`);
    }
}

/**
 * @param {Event} e
 */
async function handleFilesChanged(e) {
    const files = Array.from(this.files);
    if (files.length === 0) {
        console.debug("Zero files given, returning early...");
        return;
    }

    console.log(files);
    const fileData = readFiles(files);
}

/**
 * @param {String} error 
 */
function showError(error) {
    const errorElement = document.querySelector("#error");
    errorElement.textContent = error;
}


// the key is the name in the game files
// Wes doesn't talk
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
