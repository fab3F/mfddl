document.addEventListener("DOMContentLoaded", function () {
  const inputField = document.getElementById('input');
  const outputField = document.getElementById('output');
  const copyBtn = document.getElementById('copy');

  // Dynamic Base-URL (e.g. https://mfddl.vercel.app/?a=)
  const targetBase = window.location.origin + '/?a=';

  if (copyBtn) {
    copyBtn.addEventListener("click", function (event) {
      event.preventDefault();
      if (!outputField.value || outputField.value.startsWith("The entered link is invalid")) return;
      outputField.select();
      outputField.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(outputField.value);
      copyBtn.innerHTML = "Copied!";
    });
  }

  if (inputField) {
    inputField.addEventListener("input", function () {
      if (copyBtn) copyBtn.innerHTML = "Copy";
      const url = validationChecker(inputField.value.trim(), targetBase);
      if (url === 'a') {
        outputField.value = "The entered link is invalid. Please enter a valid MediaFire link or ID.";
      } else {
        outputField.value = url;
      }
    });
  }
});

function validationChecker(link, base) {
  if (!link) return 'a';
  link = link.replace('http://', 'https://');

  // mediafire.com/file/... or mediafire.com/view/...
  const longPattern = /(?:https?:\/\/)?(?:www\.)?mediafire\.com\/(?:file|folder|download|view)?\/?([A-Za-z0-9]+)/;
  const matchLong = link.match(longPattern);
  if (matchLong && matchLong[1]) {
    return base + matchLong[1];
  }

  // mediafire.com/?id
  const shortPattern = /mediafire\.com\/\?([a-zA-Z0-9]+)/;
  const matchShort = link.match(shortPattern);
  if (matchShort && matchShort[1]) {
    return base + matchShort[1];
  }

  // Only ID
  const identPattern = /^[a-zA-Z0-9_-]+$/;
  if (identPattern.test(link)) {
    return base + link;
  }

  return 'a';
}