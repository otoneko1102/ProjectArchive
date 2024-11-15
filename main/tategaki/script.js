document.addEventListener('DOMContentLoaded', function () {
  const content = document.getElementById('content');
  const charCount = document.getElementById('charCount');

  function updateCharCount() {
    charCount.textContent = content.value.length.toLocaleString();
  }

  // Add input event listener
  content.addEventListener('input', updateCharCount);
  updateCharCount(); // Initial count update on load
});

// Replace characters mapping
const replaceChars = {
  "ー": "｜",
  "（": "︵",
  "）": "︶",
  "「": "﹁",
  "」": "﹂",
  "『": "﹃",
  "』": "﹄",
  "〈": "︿",
  "〉": "﹀",
  "《": "︽",
  "》": "︾",
  "｛": "︷",
  "｝": "︸",
  "［": "﹇",
  "］": "﹈",
  "【": "︻",
  "】": "︼",
  "〖": "︗",
  "〗": "︘",
  "❲": "︹",
  "❳": "︺",
  "〔": "︹",
  "〕": "︺",
};

// Generate text-based output
function genText() {
  const content = tategaki(document.getElementById("content").value, "text");
  document.getElementById("output").value = content;
}

// Generate HTML-based output
function genHTML() {
  const content = tategaki(document.getElementById("content").value, "html");
  document.getElementById("output").value = content;
}

// Generate script-based output
function genScript() {
  const content = tategaki(document.getElementById("content").value, "script");
  document.getElementById("output").value = content;
}

// Copy output text to clipboard
document.getElementById("copyBtn").addEventListener("click", function () {
  const textArea = document.getElementById("output");
  navigator.clipboard.writeText(textArea.value)
    .then(() => alert("クリップボードにコピーしました！"))
    .catch(err => console.error("クリップボードへのコピーに失敗しました: ", err));
});

// Main text formatting function
function tategaki(content, type) {
  console.log(`Start to convert for ${type}.`)
  const convertedContent = halfWidthToFullWidth(toZenKata(content));
  const replacedContent = replaceMultiple(convertedContent, replaceChars);
  const fixedContent = fixLines(replacedContent, document.getElementById("count").value || 0);
  const splitedContent = convertTo2DArray(fixedContent);
  const direction = document.getElementById("direction").value;
  const spaces = parseInt(document.getElementById("spaces").value) || 0;

  switch (type) {
    case "text":
      return reconstructForText(splitedContent, spaces, direction);
    case "html":
      return reconstructForHTML(splitedContent, spaces, direction);
    case "script":
      return reconstructForScript(splitedContent, spaces, direction);
    default:
      return "";
  }
}

const D_MUD = "ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポヴヷヺ";
const S_MUD = "ｶﾞｷﾞｸﾞｹﾞｺﾞｻﾞｼﾞｽﾞｾﾞｿﾞﾀﾞﾁﾞﾂﾞﾃﾞﾄﾞﾊﾞﾋﾞﾌﾞﾍﾞﾎﾞﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟｳﾞﾜﾞｦﾞ";

const D_KIY = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンァィゥェォッャュョー・";
const S_KIY = "ｱｲｳｴｵｶｷｸｹｺｻﾞｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝｧｨｩｪｫｯｬｭｮｰ･";

function toZenKata(str) {
  for (let i = 0, len = D_MUD.length; i < len; i++) {
    str = str
      .split(S_MUD.slice(i * 2, i * 2 + 2))
      .join(D_MUD.slice(i, i + 1));
  }
  for (let i = 0, len = D_KIY.length; i < len; i++) {
    str = str.split(S_KIY.slice(i, i + 1)).join(D_KIY.slice(i, i + 1));
  }
  return str;
};

// Convert half-width characters to full-width
function halfWidthToFullWidth(str) {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode >= 0x20 && charCode <= 0x7e) {
      result += String.fromCharCode(charCode + 0xfee0);
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

// Replace multiple characters based on a mapping
function replaceMultiple(str, replacements) {
  let result = str;
  for (let pattern in replacements) {
    if (replacements.hasOwnProperty(pattern)) {
      result = result.replace(new RegExp(pattern, "g"), replacements[pattern]);
    }
  }
  return result;
}

// Split content into lines based on character count
function fixLines(content, charCount) {
  if (!content) return null;
  const result = [];
  const count = parseInt(charCount);
  if (isNaN(count) || count === 0) return content;
  for (let i = 0; i < content.length; i += count) {
    result.push(content.slice(i, i + count));
    result.push('\n');
  }
  result.pop();
  return result.join('');
}

// Convert content to a 2D array for reconstruction
function convertTo2DArray(content) {
  const lines = content.split("\n");
  const maxLength = Math.max(...lines.map((line) => line.length));
  const result = [];
  lines.forEach((line) => {
    const characters = line.split("");
    while (characters.length < maxLength) {
      characters.push("　");
    }
    result.push(characters);
  });
  return result;
}

// Reconstruct the content for text output
function reconstructForText(array, spaces, direction) {
  let reconstructedText = "";
  if (direction === "rtl") {
    for (let i = 0; i < array[0].length; i++) {
      for (let j = array.length - 1; j >= 0; j--) {
        if (array[j][i] !== undefined) {
          reconstructedText += checkWidth(array[j][i])
            ? `${array[j][i]}${spaces != 0 ? ' '.repeat(spaces) : ''}`
            : `${array[j][i]} ${spaces != 0 ? ' '.repeat(spaces) : ''}`;
        }
      }
      reconstructedText += "\n";
    }
  } else {
    for (let i = 0; i < array[0].length; i++) {
      for (let j = 0; j < array.length; j++) {
        if (array[j][i] !== undefined) {
          reconstructedText += checkWidth(array[j][i])
            ? `${array[j][i]}${spaces != 0 ? ' '.repeat(spaces) : ''}`
            : `${array[j][i]} ${spaces != 0 ? ' '.repeat(spaces) : ''}`;
        }
      }
      reconstructedText += "\n";
    }
  }
  return reconstructedText;
}

// Reconstruct the content for HTML output
function reconstructForHTML(array, spaces, direction) {
  let reconstructedText = "";
  if (direction === "rtl") {
    for (let i = 0; i < array[0].length; i++) {
      for (let j = array.length - 1; j >= 0; j--) {
        if (array[j][i] !== undefined) {
          reconstructedText += checkWidth(array[j][i])
            ? `${array[j][i]}${spaces != 0 ? ' '.repeat(spaces) : ''}`
            : `${array[j][i]} ${spaces != 0 ? ' '.repeat(spaces) : ''}`;
        }
      }
      reconstructedText += "<br>\n";
    }
  } else {
    for (let i = 0; i < array[0].length; i++) {
      for (let j = 0; j < array.length; j++) {
        if (array[j][i] !== undefined) {
          reconstructedText += checkWidth(array[j][i])
            ? `${array[j][i]}${spaces != 0 ? ' '.repeat(spaces) : ''}`
            : `${array[j][i]} ${spaces != 0 ? ' '.repeat(spaces) : ''}`;
        }
      }
      reconstructedText += "<br>\n";
    }
  }
  return reconstructedText;
}

// Reconstruct the content for script output
function reconstructForScript(array, spaces, direction) {
  let reconstructedText = "";
  if (direction === "rtl") {
    for (let i = 0; i < array[0].length; i++) {
      for (let j = array.length - 1; j >= 0; j--) {
        if (array[j][i] !== undefined) {
          reconstructedText += checkWidth(array[j][i])
            ? `${array[j][i]}${spaces != 0 ? ' '.repeat(spaces) : ''}`
            : `${array[j][i]} ${spaces != 0 ? ' '.repeat(spaces) : ''}`;
        }
      }
      reconstructedText += "\\n";
    }
  } else {
    for (let i = 0; i < array[0].length; i++) {
      for (let j = 0; j < array.length; j++) {
        if (array[j][i] !== undefined) {
          reconstructedText += checkWidth(array[j][i])
            ? `${array[j][i]}${spaces != 0 ? ' '.repeat(spaces) : ''}`
            : `${array[j][i]} ${spaces != 0 ? ' '.repeat(spaces) : ''}`;
        }
      }
      reconstructedText += "\\n";
    }
  }
  return reconstructedText;
}

// Check if a character is full-width
function checkWidth(char) {
  return char.match(/^[^\x01-\x7E\uFF61-\uFF9F]+$/);
}