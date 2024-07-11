import { getAllMatchingData, sortByLabel } from "../options/js/option-utils.js";

const menu = document.querySelector('[id="generated-urls"]');
const settingsLink = document.querySelector('[id="options-link"]');
const optionsUrl = chrome.runtime.getURL('options/index.html');
function openLink(e) {
    const { target } = e;
    if (target.matches("[data-action-create-tab]")) {
        const href = target?.getAttribute("href");
        e.preventDefault();
        if (href) {
            chrome.tabs.create({url: href});
        }
    }

}
function loadListItems(list) {
    let listHTML = ""
    list.sort(sortByLabel).forEach( item => {
        if (!item.match && item.label) { // ignore the current url and anything without a label
            listHTML += `<li><a href="${ item.url }" title="${ item.url }" data-action-create-tab>${ item.label }</a></li>`;
        }
    });
    listHTML = listHTML || "<li><a>Sorry no matches found</a></li>"
    menu.insertAdjacentHTML('afterbegin', listHTML);

    settingsLink.setAttribute("href", optionsUrl);
}

async function init() {
    const [currentTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    await getAllMatchingData(loadListItems, currentTab.url);
    document.documentElement.addEventListener("click", openLink);
}

await init();