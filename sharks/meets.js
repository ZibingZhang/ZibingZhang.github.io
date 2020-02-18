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
])