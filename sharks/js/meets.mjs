import constants from './constants.mjs';

import {
  isoToDict,
  numberToMonth
} from './util.mjs';

function setHeaderCardMeetInfo(town, date, location) {
  // location is home/away OR town
  document.querySelector('.header-card .header-card-section .town .header-card-label-text').innerHTML = town;
  document.querySelector('.header-card .header-card-section .date .header-card-label-text').innerHTML = date;
  document.querySelector('.header-card .header-card-section .home-or-away .header-card-label-text').innerHTML = location;
}

function createLeftSidebarSectionItem(text, id, onClickFunction) {
  const itemElement = document.createElement('div');
  itemElement.className = 'left-sidebar-section-item';

  const textElement = document.createElement('div');
  textElement.className = 'left-sidebar-section-item-text';
  textElement.innerHTML = text;

  const itemId = document.createElement('div');
  itemId.className = 'position-absolute visibility-hidden id';
  itemId.innerHTML = id;

  itemElement.appendChild(textElement);
  itemElement.appendChild(itemId);
  itemElement.onclick = onClickFunction;

  return itemElement;
}

function addDualMeets(meets) {
  const dualMeets = document.getElementById('left-sidebar-section-dual-meets');
  meets.forEach(meet => {
    dualMeets.appendChild(createLeftSidebarSectionItem(meet.name, meet.id, meet.onclick))
  });
}

function addOtherMeets(meets) {
  const dualMeets = document.getElementById('left-sidebar-section-other-meets');
  meets.forEach(meet => {
    dualMeets.appendChild(createLeftSidebarSectionItem(meet.name, meet.id, meet.onclick))
  });
}

function loadLeftSideBar(meetsBasicInfo) {
  let dualMeets = [];
  meetsBasicInfo.dualMeets.forEach(meet => {
    let date = isoToDict(meet.date);
    dualMeets.push({
      name: meet.name, 
      id: meet.id, 
      onclick: () => {
        setHeaderCardMeetInfo(
          meet.name, 
          `${numberToMonth(date.month)}  ${date.day}`, 
          meet.is_home ? 'Home' : 'Away'
        );
      }
    });
  });
  let otherMeets = [];
  meetsBasicInfo.otherMeets.forEach(meet => {
    let date = isoToDict(meet.date);
    otherMeets.push({
      name: meet.name, 
      id: meet.id, 
      onclick: () => {
        setHeaderCardMeetInfo(
          meet.name, 
          `${numberToMonth(date.month)}  ${date.day}`, 
          meet.location
        );
      }
    });
  });

  addDualMeets(dualMeets);
  addOtherMeets(otherMeets);
}

async function loadInitialData() {
  let meetsBasicInfo = (await axios.get(`${constants.BASE_URL}/meet/all/basic-info`)).data
  loadLeftSideBar(meetsBasicInfo);

  let firstMeet = meetsBasicInfo.dualMeets[0];
  let date = isoToDict(firstMeet.date);
  setHeaderCardMeetInfo(
    firstMeet.name, 
    `${numberToMonth(date.month)}  ${date.day}`, 
    firstMeet.is_home ? 'Home' : 'Away'
  );
}

loadInitialData();

/* =========================================== */

function addRowToSection(sectionId, rowLabel) {
  function newHeatInput() {
    const heat = document.createElement('input');
    heat.className = 'meet-section-heats-input';
    heat.spellcheck = 'false';
    heat.value = rowLabel || 'H?L?';
    return heat;
  }

  function newSwimmerInput() {
    const swimmer = document.createElement('input');
    swimmer.className = 'meet-section-swimmers-input';
    swimmer.spellcheck = 'false';
    return swimmer;
  }

  const heatSections = document.querySelectorAll(`#${sectionId} .meet-section-heats`);
  const swimmerSections = document.querySelectorAll(`#${sectionId} .meet-section-swimmers`);

  heatSections.forEach(heatSection => {
    heatSection.appendChild(newHeatInput());
  });
  swimmerSections.forEach(swimmerSection => {
    swimmerSection.appendChild(newSwimmerInput());
  });
}

function subtractRowFromSection(sectionId) {
  const heatSections = document.querySelectorAll(`#${sectionId} .meet-section-heats`);
  heatSections.forEach(heatSection => {
    heatSection.removeChild(heatSection.lastElementChild);
  });

  const swimmerSections = document.querySelectorAll(`#${sectionId} .meet-section-swimmers`);
  swimmerSections.forEach(swimmerSection => {
    swimmerSection.removeChild(swimmerSection.lastElementChild);
  });
}

function resetAgeSection(sectionId) {
  const resetRowNumber = 6;
  const defaultRowLabels = [
    'H1L3',
    'H1L5',
    'H1L1',
    'H2L3',
    'H2L5',
    'H2L1'
  ];

  const heatSections = document.querySelectorAll(`#${sectionId} .meet-section-heats`);
  heatSections.forEach(heatSection => {
    if (heatSection.childElementCount > resetRowNumber) {
      while (heatSection.childElementCount > resetRowNumber) {
        subtractRowFromSection(sectionId);
      }
    } else if (heatSection.childElementCount < resetRowNumber) {
      while (heatSection.childElementCount < resetRowNumber) {
        addRowToSection(sectionId);
      }
    }

    let index = 0;
    heatSection.childNodes.forEach(row => {
      if (row.nodeType === 1) {
        row.value = defaultRowLabels[index++];
      }
    });
  });

  const swimmerSections = document.querySelectorAll(`#${sectionId} .meet-section-swimmers`);
  swimmerSections.forEach(swimmerSection => {
    if (swimmerSection.childElementCount > resetRowNumber) {
      while (swimmerSection.childElementCount > resetRowNumber) {
        subtractRowFromSection(sectionId);
      }
    } else if (swimmerSection.childElementCount < resetRowNumber) {
      while (swimmerSection.childElementCount < resetRowNumber) {
        addRowToSection(sectionId);
      }
    }
  });

  const swimmerInputs = document.querySelectorAll(`#${sectionId} .meet-section-swimmers input`);
  swimmerInputs.forEach(input => {
    input.value = '';
  });
}

function listenSectionButton(sectionId, buttonClass, onClickFunction) {
  document.querySelector(`#${sectionId} .${buttonClass}`).onclick = onClickFunction;
}

function linkAllButtonsAgeSection(sectionId) {
  listenSectionButton(sectionId, 'add-row', () => addRowToSection(sectionId));
  listenSectionButton(sectionId, 'sub-row', () => subtractRowFromSection(sectionId));
  listenSectionButton(sectionId, 'reset', () => resetAgeSection(sectionId));
}

[
  'section-8-under',
  'section-9-10',
  'section-11-12',
  'section-13-14',
  'section-15-over'
].forEach(sectionId => {
  linkAllButtonsAgeSection(sectionId);
});