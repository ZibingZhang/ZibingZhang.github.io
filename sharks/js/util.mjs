export {
  isoToDict,
  numberToMonth
}

function isoToDict(date) {
  return {
    year: parseInt(date.substring(0, 4)),
    month: parseInt(date.substring(5, 7)),
    day: parseInt(date.substring(8, 10))
  };
}

function numberToMonth(number) {
  return {
    1: 'January',
    2: 'February',
    3: 'March',
    4: 'April',
    5: 'May',
    6: 'June',
    7: 'July',
    8: 'August',
    9: 'September',
    10: 'October',
    11: 'November',
    12: 'December',
  }[number]
}