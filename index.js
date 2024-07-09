"use strict";

console.log("start");
const inputElement = document.querySelector("#file-input");
inputElement.addEventListener("change", handleFilesChanged);

async function handleFilesChanged(e) {
    const files = this.files;
    if (files.length === 0) {
        console.debug("No files given, returning early...");
        return;
    }

    console.log(files);
    const inputElement = document.querySelector("#file-input");
    inputElement.addEventListener("change", handleFiles);

    files[0].text().then(data => console.log(data));
}

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
