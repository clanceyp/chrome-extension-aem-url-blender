/**
 * @author patcla
 */

import {
    sectionsDataKey,
    optionUtils,
    setSectionsDataDebounce,
    debounce,
    empty,
    generateUrlsList,
    testReg,
    getSectionsData,
    getSection,
    getSectionIndex,
    validateRegExp,
    sortByLabel,
    draggable,
    isValidJson,
    delay,
    regExCapturingGroupIsMatch,
    getParentSection
} from "./option-utils.js"

let sections = []
const menu = document.querySelector('[id="section-menu"]');
const addSectionButton = document.querySelectorAll('[data-add-section]');
const settingsForm = document.querySelector('[id="settings-form"]');
const settingsFormDynamicSection = settingsForm.querySelector(".dynamic-section");
const settingsEditArea = document.querySelector('[id="settings-as-string-input"]');
const saveRawInputButton = document.querySelector('[data-save-sections-storage]');
const eventUtils = {
    loadAndViewSectionStorage: (e) => {
        e.preventDefault();
        settingsEditArea.value = JSON.stringify(sections,undefined, 4);
        document.querySelectorAll('[data-save-sections-storage]')
            .forEach(el => el.removeAttribute("disabled"))
        settingsEditArea.dispatchEvent(new Event("input", {bubbles: true}))
    },
    validateSettingsFromTextInput: ( { target } ) => {
        if (isValidJson(settingsEditArea.value)) {
            target.setAttribute("aria-invalid", "false");
            saveRawInputButton.removeAttribute("disabled");
        } else {
            target.setAttribute("aria-invalid", "true");
            saveRawInputButton.setAttribute("disabled","true");
        }
    },
    saveSettingsFromTextInput: (e) => {
        e.preventDefault();
        try {
            sections = JSON.parse(settingsEditArea.value);
        } catch (e) {
            console.error(e);
            alert("Couldn't parse the section string, please see error in the browser console");
            return;
        }
        alert("Thank you. Your settings have been updated.");
        reset();
        delay(() => {
            // click on the menu
            document.querySelector('[href="#sectionAbout"]').click();
        });

    },
    validateRegEx: ( { target } ) => {
        target.setAttribute("aria-invalid", (!validateRegExp( target.value )).toString() )
    },
    validateRegExCaptureCount: ( { target } ) => {
        if (target.matches("[data-key]")) {
            eventUtils.validateRegEx( { target } )
            target.setAttribute("data-capturing-group-count-match", regExCapturingGroupIsMatch( target.value, getParentSection(target) ));
        }
    },
    updateOnInput: (e) => {
        e.preventDefault();
        updateSectionData(e);
    },
    testUrl: (e) => {
        e.preventDefault();
        getSection(e.target.closest("[data-section-id]").dataset.sectionId)
            .testUrl = e.target.value;
        updateSectionData(e);
    },
    runRegEx: (e) => {
        e.preventDefault();
        const target = e.target;
        const section = getSection(e.target.closest("[data-section-id]").dataset.sectionId);
        const fieldset = target.closest("[data-section-id]");
        const testUrl = fieldset.querySelector("[data-test-url]").value;
        const hasMatch = section.data.find( item => {
            if (item.key) {
                item.reResult = testReg(item.key, testUrl)
                return !!item.reResult;
            }
            return false;
        })
        if (hasMatch) {
            listRegAdmin(testUrl, section.data, fieldset);
        } else {
            noAdminMatch(fieldset);
        }
    },
    removeRow: (e) => {
        e.preventDefault();
        const target = e.target;
        const currentRow = target.closest("tr");
        const label = currentRow.querySelector("[data-label]").value;
        const table = target.closest("[data-section-id]");
        if (confirm(`You are about to remove ${ label || "this row" } are you sure?`)) {
            currentRow.remove();
            updateSectionDataByTable( table);
        }
    },
    addRow: (e) => {
        e.preventDefault();
        const target = e.target;
        const table = target.closest("[data-section-id]");
        const tbody = table.querySelector("[data-rows]");
        tbody.insertAdjacentHTML(`beforeend`, generateTableRow( "", "", ""));
    },
    removeSection: (e) => {
        e.preventDefault();
        const target = e.target;
        const fieldset = target.closest("[data-section-id]");
        const sectionId = fieldset.dataset.sectionId;
        const title = fieldset.querySelector("[data-title]").value;
        if (confirm(`You are about to remove "${ title }" section, are you sure?`)) {
            removeSection( sectionId );
        }
    }
}
function getMenuItemFromSection(el) {
    // get section id
    //
}
function noAdminMatch(fieldset) {
    const results = fieldset.querySelector("[data-results]");
    empty(results).insertAdjacentHTML("beforeend", "<li>Sorry no matches found. Please check your regex.</li>");
}
function listRegAdmin(testUrl, data, fieldset) {
    const listData = generateUrlsList(testUrl, data);
    const results = fieldset.querySelector("[data-results]");
    let listHTML = "";
    listData.sort(sortByLabel).forEach( item => {
        listHTML += `<li class="test-url ${ ( item.match ) ? "test-url--matches-true" : "test-url--matches-false" }">
            ${ item.label } <span>(${ item.url })</span>
        </li>`;
    })
    empty(results).insertAdjacentHTML("beforeend", listHTML);
}
function setSectionsData() {
    optionUtils.set(sectionsDataKey, JSON.stringify(sections))
}
function populateManifestData() {
    const manifest = chrome.runtime.getManifest();
    const items = document.querySelectorAll("[data-manifest]")
    items.forEach(element => {
        if (element.dataset.manifest.startsWith("icon")) {
            const imgSrc = chrome.runtime.getURL(manifest.icons[element.dataset.manifest.split("-").pop()]);
            if (element.tagName === "IMG") {
                element.src = imgSrc;
            } else {
                element.style.backgroundImage = `url(${ imgSrc })`
            }
        } else {
              element.textContent = manifest[element.dataset.manifest] || "";
        }
    })
}
function generateTable(section) {
    return `<table data-section-id="${ section.id }" class="data uk-table uk-table-small">
    <colgroup>
       <col span="1" style="width: 33%;">
       <col span="1" style="width: 33%;">
       <col span="1" style="width: 33%;">
       <col span="1" style="width: 30px;">
    </colgroup>
    <thead>
        <tr>
            <th>URL matche(s)</th>
            <th>URLs to generate</th>
            <th>Menu label</th>
            <th aria-label="Delete"></th>
        </tr>
    </thead>
    <tbody data-rows></tbody>
    <tfoot>
        <tr>
            <td colspan="3" class="uk-text-right"><button data-add-row class="uk-button uk-button-secondary uk-button-small">Add row</button></td>
            <td></td>
        </tr>
    </tfoot>
</table>`;
}
function generateTableRow(key, value = "", label = "") {
    return `<tr>
            <td><input class="uk-input" data-update-on-input value="${ key }" data-key type="text" aria-invalid="${ (!validateRegExp( key )).toString() }"></td>
            <td><input class="uk-input" data-update-on-input value="${ value }" data-value type="text"></td>
            <td><input class="uk-input" data-update-on-input value="${ label }" data-label type="text"></td>
            <td><button class="uk-icon-button uk-icon-button--delete" title="Delete this row" data-remove-row data-drag-handle aria-label="Remove row"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" role="presentation"><use href="#TrashCan" /></svg></button></td>
        </tr>`;
}
function addMenuHMTL(html) {
    menu.insertAdjacentHTML('beforeend', html);
}
function populateSectionData(s) {
    sections = s;
    const addId = (section, i) => {
        if (!section.title) { // no title, remove the
            // sections.splice(i, 1);
            section.title = "invalid"
        }
        section.id = `section-${i}-${section.title.toLowerCase().replaceAll(/[^\w]/g, "-")}`;
    }
    const addMenuItem = section => {
        addMenuHMTL(`
            <li class="settings__navigation-item">
                <a class="settings__navigation-link" href="#${ section.id }" data-section-title="${ section.id }" aria-current="false">${ section.title }</a>
            </li>
        `)
    }
    const addMainFormSection = section => {
        settingsFormDynamicSection.insertAdjacentHTML("beforeend", `
        <fieldset id="${ section.id }" class="settings__section uk-fieldset" aria-hidden="true" data-section-id="${ section.id }">
            <legend class="uk-legend">
                <input type="text" data-title value="${ section.title }" name="${ section.id }" class="as-legend" />
                <button class="uk-icon-button uk-icon-button--delete" data-remove-section title="Delete this section" aria-label="Delete this section">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 24 24" role="presentation"><use href="#TrashCan" /></svg>
                </button>
            </legend>
            ${ generateTable(section) }
            <div class="section__test">
                <input class="uk-input" data-test-url value="${ section.testUrl || "" }" placeholder="http://localhost:4502/content/wknd-events/react/home/first-article.html">
                <button data-run-regex class="test__button uk-button uk-button-default" aria-label="Test section"></button>
                <ul data-results></ul>
            </div>
        </fieldset>`)
        const table = settingsForm.querySelector(`[data-section-id="${ section.id }"] [data-rows]`)

        section.data.forEach( row => {
            table.insertAdjacentHTML("beforeend", generateTableRow( row["key"], row["value"], row["label"]));
        })
    }
    sections.forEach(addId);
    sections.forEach(addMenuItem);
    sections.forEach(addMainFormSection);
    addMenuHMTL(`<li class="settings__navigation-item" id="sectionAboutNavItem">
        <a class="settings__navigation-link" aria-current="false" href="#sectionAbout">About</a>
    </li>`);
    // show default form fieldset
    document.querySelector(".settings__section")
        .setAttribute("aria-hidden", "false");
    document.querySelector(".settings__navigation-link")
        .setAttribute("aria-current", "true");
}
function navigationAction(e) {
    const sectionSelector = e.target.getAttribute("href");
    if (document.querySelector(sectionSelector)) {
        e.preventDefault();
        // set menu
        document.querySelectorAll('.settings__navigation-link[aria-current="true"]')
            .forEach(a => a.setAttribute("aria-current", "false"))
        // set content
        document.querySelectorAll('.settings__section[aria-hidden="false"]')
            .forEach(a => a.setAttribute("aria-hidden", "true"))

        document.querySelector(sectionSelector)
            .setAttribute("aria-hidden", "false");
        e.target.setAttribute("aria-current", "true");
        settingsEditArea.value = "";
        settingsEditArea.setAttribute("aria-invalid","false");
    }
}
function titleUpdate(e) {
    if (e.target.matches("input[data-title]")) {
        const title = e.target.value;
        const id = e.target.name;
        const section = getSection(id);
        section.title = title;

        document
            .querySelectorAll(`[data-section-title="${id}"]`)
            .forEach( el => el.innerText = title);
        setSectionsDataDebounce();
    }
}
function updateSectionData(e) {
    updateSectionDataByTable( e.target.closest("[data-section-id]") );
}
function updateSectionDataByTable(table) {
    if (!table) {
        return;
    }
    const sectionId = table.dataset.sectionId;
    const rows = table.querySelectorAll("[data-rows] tr");
    const section = getSection(sectionId);
    let newData = [];
    rows.forEach( row => {
        newData.push({
            "key": row.querySelector("[data-key]").value,
            "value": row.querySelector("[data-value]").value,
            "label": row.querySelector("[data-label]").value
        })
    })
    section.data = newData;

    setSectionsDataDebounce();
}
function formUpdate(e) {
    // delegate events
    const target = e.target;

    if (target === saveRawInputButton) {
        eventUtils.saveSettingsFromTextInput(e);
    }
    if (target === settingsEditArea && e.type === "input") {
        eventUtils.validateSettingsFromTextInput(e);
    }
    if (target.matches("[data-view-sections-storage]")) {
        eventUtils.loadAndViewSectionStorage(e);
    }
    if (target.matches("[data-update-on-input]") && e.type === "input") {
        eventUtils.updateOnInput(e);
    }
    if (target.matches("[data-key]")) {
        eventUtils.validateRegEx(e);
    }
    if (target.matches("[data-remove-row]")) {
        eventUtils.removeRow(e);
    }
    if (target.matches("[data-add-row]")) {
        eventUtils.addRow(e);
    }
    if (target.matches("[data-remove-section]")) {
        eventUtils.removeSection(e);
    }
    if (target.matches("[data-test-url]")) {
        eventUtils.testUrl(e);
    }
    if (target.matches("[data-run-regex]")) {
        eventUtils.runRegEx(e);
    }
}
function addSection() {
    const title = prompt("Please add a title", "");
    if (!title) {
        return;
    }
    const newSection = {
        title,
        data: [{key:"", value: "", label: ""}]
    }
    const insertAt = parseInt(prompt("Please add list position (First place = 0. Leave blank to add at the end)") || sections.length );
    sections.splice( insertAt, 0, newSection );
    reset();

    const openNewSection = (mutationList, observer) => {
        observer.disconnect();
        if (document.querySelectorAll(".settings__navigation-link")[ insertAt ]) {
            document.querySelectorAll(".settings__navigation-link")[ insertAt ].click()
        }
    };
    const observer = new MutationObserver(openNewSection);
    observer.observe(menu, { attributes: false, childList: true, subtree: true });
}
function removeSection(sectionId) {
    const index = getSectionIndex(sectionId);
    if (index > -1) {
        sections.splice(index, 1);
    }
    reset();
}
function addEventListeners() {
    menu.addEventListener("click", navigationAction);
    addSectionButton.forEach( button => {
        button.addEventListener("click", addSection);
    })
    settingsForm.addEventListener("input", debounce((e) => titleUpdate(e)));
    settingsForm.addEventListener("input", debounce((e) => formUpdate(e)));
    settingsForm.addEventListener("click", formUpdate);
    settingsForm.addEventListener("submit", e => e.preventDefault());
    settingsForm.addEventListener("input", (e) => {
        eventUtils.validateRegExCaptureCount(e);
    })

    document.documentElement.addEventListener("mousedown", draggable.enable)
    document.documentElement.addEventListener("dragstart", draggable.dragstart);
    document.documentElement.addEventListener("dragend", draggable.dragend);
    document.documentElement.addEventListener("dragend", debounce((e) => updateSectionData(e)));
    document.documentElement.addEventListener("dragover", draggable.dragover);
}
function reset() {
    setSectionsData();
    empty(menu);
    empty(settingsFormDynamicSection);
    getSectionsData(populateSectionData);

}
async function init() {
    populateManifestData();
    await getSectionsData(populateSectionData);
    addEventListeners();
}

await init();


