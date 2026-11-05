import defaultContent from "./lib/json/default-settings.js";
import { sectionsDataKey } from "./options/js/option-utils.js";

async function ensureDefaultSections() {
    const stored = await chrome.storage.local.get(sectionsDataKey);
    const value = stored[sectionsDataKey];
    if (!value) {
        await chrome.storage.local.set({
            [sectionsDataKey]: JSON.stringify(defaultContent)
        });
        return;
    }
    try {
        JSON.parse(value);
    } catch (e) {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "lib/icon/swap.black.png",
            title: "AEM URL Blender",
            message: "Your saved settings could not be read and may be corrupted. Please review them in the extension settings."
        });
    }
}

chrome.runtime.onInstalled.addListener(ensureDefaultSections);
chrome.runtime.onStartup.addListener(ensureDefaultSections);
