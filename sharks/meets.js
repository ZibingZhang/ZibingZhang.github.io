function createLeftSidebarSectionItem(text, onClickFunction) {
  const itemElement = document.createElement('div');
  itemElement.className = 'left-sidebar-section-item';

  const textElement = document.createElement('div');
  textElement.className = 'left-sidebar-section-item-text';
  textElement.innerHTML = text;

  itemElement.appendChild(textElement);
  itemElement.onclick = onClickFunction;

  return itemElement;
}

function addDualMeets(meets) {
  const dualMeets = document.getElementById('left-sidebar-section-dual-meets');
  meets.forEach(meet => {
    dualMeets.appendChild(createLeftSidebarSectionItem(meet[0], meet[1]))
  });
}

function addOtherMeets(meets) {
  const dualMeets = document.getElementById('left-sidebar-section-other-meets');
  meets.forEach(meet => {
    dualMeets.appendChild(createLeftSidebarSectionItem(meet[0], meet[1]))
  });
}

addDualMeets([
  ['Canton', ],
  ['Millis', ],
  ['Newton', ],
  ['Natick', ],
  ['Framingham', ],
  ['Westwood', ],
  ['Walpole', ],
  ['Dedham', ],
  ['Norwood', ],
  ['Medfield', ],
  ['Sherborn', ]
]);

addOtherMeets([
  ['Mile Swim', ],
  ['B Regionals', ],
  ['A Regionals', ]
]);

/* =========================================== */

function addRowToSection(sectionId) {
  function newHeatInput() {
    const heat = document.createElement('input');
    heat.className = 'meet-section-heats-input';
    heat.spellcheck = 'false';
    heat.value = 'H?L?';
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