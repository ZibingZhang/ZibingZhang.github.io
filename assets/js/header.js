window.onload = () => {
  let lists = Array.from(document.getElementsByTagName('LI'));
  for (let list of lists) {
    if (list?.firstElementChild?.href === 'https://zibingzhang.com/') {
      list.firstElementChild.href = 'https://zibingzhang.com/about/';
    }
  }
};
