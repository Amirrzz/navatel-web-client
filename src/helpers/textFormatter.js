export function detetctTextIncludesLink(text) {
  const linkRegex = /(http(s)?:\/\/[^\s]+)/gi;
  const links = text.match(linkRegex);
  if (!links) return text;
  return renderTextWithAvailableLink(text);
}
export function renderTextWithAvailableLink(text) {
  const textValue = text.toLowerCase()
  // Regular expression to find links in the string
  const linkRegex = /(https?:\/\/[^\s]+)/g;
  const stringWithHTMLLinks = textValue.replace(
    linkRegex,
    '<a href="$&" target="_blank">$&</a>',
  );
  return stringWithHTMLLinks;
}
export function detectTextDirection(text) {
  if (!text) return null;
  text = text.replaceAll(' ', ''); // Remove spaces from the input text
  let isRightToLeft = null;
  let detectedChar = null;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (/^[\u0600-\u06FF\s]+$/.test(char)) {
      isRightToLeft = true;
      detectedChar = char;
      break; // Exit loop when a character is detected
    } else if (/^[A-Za-z0-9]*$/.test(char)) {
      isRightToLeft = false;
      detectedChar = char;
      break; // Exit loop when a character is detected
    }
  }
  return {
    isRightToLeft,
    detectedChar,
    detectedIndexChar: text.indexOf(detectedChar), // Get the index of detected character
  };
}
export function textAvatar(text) {
  if (!text) return '';
  const [firstPart, secPart] = text.split(' ');
  let output = firstPart[0];
  if (secPart) {
    output += ' ' + secPart[0];
  }
  return output;
}
