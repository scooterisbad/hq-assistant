// ==UserScript==
// @name         ToonHQ Assistant
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  various quality of life features for https://toonhq.org
// @author       Scooter
// @match        https://toonhq.org/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=toonhq.org
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @require      http://code.jquery.com/jquery-1.12.4.min.js
// ==/UserScript==

let settingsDisplayed = false;

const alertSound = new Audio("https://toonhq.org/static/dist/media/member-joined.bd163314.mp3");

(function () {
    'use strict';

    createElements();

    let toons = 0;

    setInterval(() => {
        let currentToons = getCurrentToons();
        if (currentToons > toons) {
            toons = currentToons;
            if (toons == 8) {
                if (GM_getValue('group-fill-sound', true)) {
                    alertSound.play();
                }

                if (GM_getValue('group-fill-notif', true)) {
                    let group = findCurrentGroup();
                    GM_notification({ title: 'ToonHQ Assistant', text: `${getGroupType(group)} group at ${getGroupLocation(group)} in ${getGroupDistrict(group)} has filled!`, timeout: 5000 });
                }
            }
        }
        else if (currentToons < toons) {
            toons = currentToons;
        }
    }, 5000);
})();

function settingsButtonClicked() {
    if (!settingsDisplayed) {
        let div = document.createElement('div');
        div.id = 'assistant-settings-div';
        div.style = `
            background-color: rgb(25, 106, 67);
        `

        let container = document.createElement('div');
        container.classList.add('container');

        let heading = document.createElement('h2');
        heading.innerHTML = 'HQ Assistant Settings';
        container.appendChild(heading);

        // option to send desktop notification when group is filled
        let groupFillNotifCheckbox = document.createElement('input');
        groupFillNotifCheckbox.type = 'checkbox';
        groupFillNotifCheckbox.id = 'group-fill-notif-checkbox';
        groupFillNotifCheckbox.checked = GM_getValue('group-fill-notif', true);
        groupFillNotifCheckbox.onchange = () => {
            GM_setValue('group-fill-notif', groupFillNotifCheckbox.checked);
        }
        groupFillNotifCheckbox.style.margin = '10px';
        let groupFillNotifLabel = document.createElement('label');
        groupFillNotifLabel.for = 'group-fill-notif-checkbox';
        groupFillNotifLabel.innerHTML = 'Send desktop notification when group fills';
        container.appendChild(groupFillNotifCheckbox);
        container.appendChild(groupFillNotifLabel);

        container.appendChild(document.createElement('br'));

        // option to play sound when group is filled
        let groupFillSoundCheckbox = document.createElement('input');
        groupFillSoundCheckbox.type = 'checkbox';
        groupFillSoundCheckbox.id = 'group-fill-sound-checkbox';
        groupFillSoundCheckbox.checked = GM_getValue('group-fill-sound', true);
        groupFillSoundCheckbox.onchange = () => {
            GM_setValue('group-fill-sound', groupFillSoundCheckbox.checked);
        }
        groupFillSoundCheckbox.style.margin = '10px';
        let groupFillSoundLabel = document.createElement('label');
        groupFillSoundLabel.for = 'group-fill-sound-checkbox';
        groupFillSoundLabel.innerHTML = 'Play sound when group fills';
        container.appendChild(groupFillSoundCheckbox);
        container.appendChild(groupFillSoundLabel);

        container.appendChild(document.createElement('br'));

        // sound volume slider
        let groupFillSoundVolume = document.createElement('input');
        groupFillSoundVolume.type = 'range';
        groupFillSoundVolume.min = 0;
        groupFillSoundVolume.max = 1;
        groupFillSoundVolume.step = 0.01;
        groupFillSoundVolume.value = GM_getValue('group-fill-sound-volume', 1);
        groupFillSoundVolume.onchange = () => {
            GM_setValue('group-fill-sound-volume', groupFillSoundVolume.value);
            alertSound.volume = groupFillSoundVolume.value;
        }
        groupFillSoundVolume.style.margin = '10px';
        let groupFillSoundVolumeLabel = document.createElement('label');
        groupFillSoundVolumeLabel.for = 'group-fill-sound-volume';
        groupFillSoundVolumeLabel.innerHTML = 'Notification volume';
        container.appendChild(groupFillSoundVolume);
        container.appendChild(groupFillSoundVolumeLabel);

        div.appendChild(container);
        let header = document.getElementsByClassName('sl__header')[0];
        header.insertAdjacentElement('afterend', div);
    }
    else {
        document.getElementById('assistant-settings-div').remove();
    }
    settingsDisplayed = !settingsDisplayed;
}

// generates all the html elements for the assistant
function createElements() {
    let navbarList = document.getElementsByClassName('navbar-nav ml-auto')[0];
    let settingsNav = document.createElement('li');
    settingsNav.className = 'blue';
    let a = document.createElement('a');
    a.role = 'button';
    a.onclick = settingsButtonClicked;
    a.innerHTML = '<span>HQA Settings</span>';
    settingsNav.appendChild(a);
    navbarList.appendChild(settingsNav);
}

function getCurrentToons() {
    let group = findCurrentGroup();
    let numToons = group.getElementsByClassName('info-card__content')[0].childNodes[4].textContent
    return parseInt(numToons);
}

function findCurrentGroup() {
    let groups = document.getElementsByClassName('info-card info-card--groups');
    for (let i = 0; i < groups.length; i++) {
        if (groups[i].getElementsByClassName('active-group').length > 0) {
            return groups[i];
        }
    }
}

function getGroupDistrict(group) {
    let district = group.getElementsByClassName('info-card__content')[0].childNodes[3].textContent;
    return district;
}

function getGroupLocation(group) {
    let location = group.getElementsByClassName('info-card__content')[0].childNodes[2].textContent;
    return location;
}

function getGroupType(group) {
    let type = group.getElementsByClassName('info-card__content')[0].childNodes[0].childNodes[0].textContent;
    return type;
}