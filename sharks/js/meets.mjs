import state from './state.mjs';
import {
  BASE_URL
} from './constants.mjs';
import {
  isoToDict,
  numberToMonth
} from './util.mjs';

function setHeaderCardMeetInfo(id, town, date, location) {
  // location is home/away OR town
  document.querySelector('.header-card .header-card-section .id').innerHTML = id;
  document.querySelector('.header-card .header-card-section .town .header-card-label-text').innerHTML = town;
  document.querySelector('.header-card .header-card-section .date .header-card-label-text').innerHTML = date;
  document.querySelector('.header-card .header-card-section .home-or-away .header-card-label-text').innerHTML = location;
}

function getCurrentMeetId() {
  return document.querySelector('.header-card .header-card-section .id').innerHTML;
}

/* =========================================== */

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

// function addOtherMeets(meets) {
//   const dualMeets = document.getElementById('left-sidebar-section-other-meets');
//   meets.forEach(meet => {
//     dualMeets.appendChild(createLeftSidebarSectionItem(meet.name, meet.id, meet.onclick))
//   });
// }

function loadLeftSideBar(meetsBasicInfo) {
  let dualMeets = [];
  meetsBasicInfo.dualMeets.forEach(meet => {
    let date = isoToDict(meet.date);
    dualMeets.push({
      name: meet.name, 
      id: meet.id, 
      onclick: async () => {
        if (state.isDisplayingMeetInfo) await getAndSetMeetInfo(meet.id);
        setHeaderCardMeetInfo(
          meet.id,
          meet.name, 
          `${numberToMonth(date.month)}  ${date.day}`, 
          meet.is_home ? 'Home' : 'Away'
        );
      }
    });
  });
  // let otherMeets = [];
  // meetsBasicInfo.otherMeets.forEach(meet => {
  //   let date = isoToDict(meet.date);
  //   otherMeets.push({
  //     name: meet.name, 
  //     id: meet.id, 
  //     onclick: () => {
  //       setHeaderCardMeetInfo(
  //         meet.id,
  //         meet.name, 
  //         `${numberToMonth(date.month)}  ${date.day}`, 
  //         meet.location
  //       );
  //       if (state.isDisplayingMeetInfo) getAndSetMeetInfo(meet.id);
  //     }
  //   });
  // });

  addDualMeets(dualMeets);
  // addOtherMeets(otherMeets);
}

async function loadInitialData() {
  let meetsBasicInfo = (await axios.get(`${BASE_URL}/meet/basic-info/all`)).data
  loadLeftSideBar(meetsBasicInfo);

  let firstMeet = meetsBasicInfo.dualMeets[0];
  let date = isoToDict(firstMeet.date);
  setHeaderCardMeetInfo(
    firstMeet.id,
    firstMeet.name, 
    `${numberToMonth(date.month)}  ${date.day}`, 
    firstMeet.is_home ? 'Home' : 'Away'
  );
}

loadInitialData();

/* =========================================== */

function setMeetInfo(data) {
  clearAllSections();

  [
    {class: 'section-8-under', name: '8-under'},
    {class: 'section-9-10', name: '9-10'},
    {class: 'section-11-12', name: '11-12'},
    {class: 'section-13-14', name: '13-14'},
    {class: 'section-15-over', name: '15-over'}
  ].forEach(section => { 
    setSectionData(section.class, data.sections[section.name], true, true);
  });

  [
    {class: 'section-medley-relay', name: 'medley-relay'},
    {class: 'section-free-relay', name: 'free-relay'}
  ].forEach(section => {
    setSectionData(section.class, data.sections[section.name], false, false);
  });
}

function clearMeetInfo() {
  clearAllSections();
}

async function getMeetInfo(id) {
  await axios.get(`${BASE_URL}/meet/meet-data/id/${id}`, { headers: { authentication: state.authenticationToken } }).then(r => {
    state.currentMeetInitialState = r.data;
    setMeetInfo(r.data);
  }).catch(e => {
    clearMeetInfo();
  });
}

async function getAndSetMeetInfo(id) {
  await getMeetInfo(id);
}

/* =========================================== */

function listenAuthTokenInput() {
  let authTokenInput = document.querySelector('#authentication-token-input input');
  authTokenInput.onkeypress = e => { if (e.keyCode === 13) { document.activeElement.blur(); } };  // lose focus
  authTokenInput.addEventListener('focusout', () => { 
    state.authenticationToken = authTokenInput.value;
    axios.get(`${BASE_URL}/meet/can-view`, { headers: { authentication: state.authenticationToken } }).then(r => {
      if (state.isDisplayingMeetInfo === false) {
        getAndSetMeetInfo(getCurrentMeetId());
        state.isDisplayingMeetInfo = true;

        const saveButton = document.querySelector('#save-button');
        saveButton.className = saveButton.className.replace('visibility-hidden', '');
        document.querySelector('#authentication-token-input').className += ' visibility-hidden position-absolute';
      }
    });
  });
}

listenAuthTokenInput();

/* =========================================== */

function addRowToSection(sectionId) {
  function newHeatInput() {
    const heat = document.createElement('input');
    heat.className = 'meet-section-heats-input';
    heat.spellcheck = false;
    heat.value = 'H?L?';
    return heat;
  }

  function newSwimmerInput() {
    const swimmer = document.createElement('input');
    swimmer.className = 'meet-section-swimmers-input';
    swimmer.spellcheck = false;
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

function clearAgeSection(sectionId) {
  const heatSections = document.querySelectorAll(`#${sectionId} .meet-section-heats`);
  heatSections.forEach(heatSection => {
    while (heatSection.childElementCount > 0) {
      subtractRowFromSection(sectionId);
    }
  });
}

function clearRelaySection(sectionId) {
  const inputs = document.querySelectorAll(`#${sectionId} input`);
  inputs.forEach(input => {
    if (!input.className.includes('no-edit')) {
      input.value = '';
    }
  });
}

function clearAllSections() {
  [
    'section-8-under',
    'section-9-10',
    'section-11-12',
    'section-13-14',
    'section-15-over'
  ].forEach(sectionId => clearAgeSection(sectionId));

  [
    'section-medley-relay',
    'section-free-relay',
  ].forEach(sectionId => clearRelaySection(sectionId));
}

function listenSectionButton(sectionId, buttonClass, onClickFunction) {
  document.querySelector(`#${sectionId} .${buttonClass}`).onclick = onClickFunction;
}

function linkAllButtonsAgeSection(sectionId) {
  listenSectionButton(sectionId, 'add-row', () => addRowToSection(sectionId));
  listenSectionButton(sectionId, 'sub-row', () => subtractRowFromSection(sectionId));
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

/* =========================================== */

function getColumns(sectionId, includeHeatColumns) {
  let columns = []
  if (includeHeatColumns === true) columns.push(document.querySelector(`#${sectionId} .background-girls .meet-section-heats`));
  columns.push(document.querySelector(`#${sectionId} .background-girls .butterfly .meet-section-swimmers`));
  columns.push(document.querySelector(`#${sectionId} .background-girls .freestyle .meet-section-swimmers`));
  columns.push(document.querySelector(`#${sectionId} .background-girls .breastroke .meet-section-swimmers`));
  columns.push(document.querySelector(`#${sectionId} .background-girls .backstroke .meet-section-swimmers`));
  if (includeHeatColumns === true) columns.push(document.querySelector(`#${sectionId} .background-boys .meet-section-heats`));
  columns.push(document.querySelector(`#${sectionId} .background-boys .butterfly .meet-section-swimmers`));
  columns.push(document.querySelector(`#${sectionId} .background-boys .freestyle .meet-section-swimmers`));
  columns.push(document.querySelector(`#${sectionId} .background-boys .breastroke .meet-section-swimmers`));
  columns.push(document.querySelector(`#${sectionId} .background-boys .backstroke .meet-section-swimmers`));
  return columns;
}

function getSectionData(sectionId, includeHeats) {
  let columns = getColumns(sectionId, includeHeats);

  let dataByColumn = [];
  columns.forEach(column => {
    let columnData = []
    column.childNodes.forEach(childNode => {
      if (childNode.nodeType === 1) {
        columnData.push(childNode.value);
      }
    });
    dataByColumn.push(columnData);
  });
  
  let dataByRow = [];
  const numRows = dataByColumn[0].length;
  const numColumns = dataByColumn.length;
  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    let row = [];
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      row.push(dataByColumn[columnIndex][rowIndex]);
    }
    dataByRow.push(row);
  }

  return dataByRow;
}

function setSectionData(sectionId, data, heatsIncluded, shouldAppend) {
  let columns = getColumns(sectionId, heatsIncluded);
  const numRows = data.length;
  const numColumns = columns.length;

  if (shouldAppend) {
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
        const input = document.createElement('input');
        input.className = 'meet-section-swimmers-input';
        if (heatsIncluded && (columnIndex === 0 || columnIndex === 4)) input.className += ' no-edit';
        input.spellcheck = false;
        input.value = data[rowIndex][columnIndex];
        columns[columnIndex].appendChild(input);
      }
    }
  } else {
    for (let columnIndex = 0; columnIndex < numColumns; columnIndex++) {
      let rowIndex = 0;
      columns[columnIndex].childNodes.forEach(node => {
        if (node.nodeType === 1) {
          node.value = data[rowIndex++][columnIndex];
        }
      });
    }
  }
}