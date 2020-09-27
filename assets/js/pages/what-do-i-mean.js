function main() {
  const toEng = document.getElementById('to-eng');
  toEng.onclick = () => {
    const text = document.getElementById('abrv-eng').value;
    console.log(text)
  };
}

main();
