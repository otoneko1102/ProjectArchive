function createForm() {
  const newForm = document.createElement('div');
  newForm.classList.add('form-group', 'conversion-form');

  const inputText = document.createElement('input');
  inputText.type = 'text';
  inputText.classList.add('conversion-input');
  inputText.placeholder = '変換前';

  const outputText = document.createElement('input');
  outputText.type = 'text';
  outputText.classList.add('conversion-output');
  outputText.placeholder = '変換後';

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.classList.add('remove-button');
  removeButton.textContent = '-パターンを削除';
  removeButton.addEventListener('click', function() {
    newForm.remove();
  });

  newForm.appendChild(inputText);
  newForm.appendChild(outputText);
  newForm.appendChild(removeButton);

  return newForm;
}

document.getElementById("copyBtn").addEventListener("click", function () {
  const textArea = document.getElementById("output-text");
  navigator.clipboard.writeText(textArea.value)
    .then(() => alert("クリップボードにコピーしました！"))
    .catch(err => console.error("クリップボードへのコピーに失敗しました: ", err));
});

document.getElementById('main-form').addEventListener('submit', function(event) {
  event.preventDefault();

  let inputText = document.getElementById('input-text').value;
  const conversionInputs = document.getElementsByClassName('conversion-input');
  const conversionOutputs = document.getElementsByClassName('conversion-output');

  for (var i = 0; i < conversionInputs.length; i++) {
    const input = conversionInputs[i].value;
    const output = conversionOutputs[i].value;
    const regex = new RegExp(input, 'g');
    inputText = inputText.replace(regex, output);
  }

  const outputTextArea = document.getElementById('output-text');
  outputTextArea.value = inputText;
  outputTextArea.select();
});

const conversionForms = document.getElementById('conversion-forms')
const addButton = document.createElement('button');
addButton.type = 'button';
addButton.textContent = '+パターンを追加';
addButton.addEventListener('click', function() {
  const newForm = createForm();
  conversionForms.appendChild(newForm);
});

conversionForms.appendChild(addButton);
