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