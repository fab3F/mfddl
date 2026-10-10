const p1 = document.getElementById("p1");
const p2 = document.getElementById("p2");
const p3 = document.getElementById("p3");
const p4 = document.getElementById("p4");
const dlLink = document.getElementById("dl-link");
const mfLink = document.getElementById("mf-link");

function showState(active) {
  [p1, p2, p3, p4].forEach(p => {
    if (p) p.style.display = (p === active ? "block" : "none");
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const mediafireId = urlParams.get('a');

  if (!mediafireId) {
    window.location.replace('/generator');
    return;
  }

  if (mfLink) {
    mfLink.href = `https://www.mediafire.com/?${encodeURIComponent(mediafireId)}`;
  }
  showState(p1);

  try {
    const res = await fetch(`/api/resolve?a=${encodeURIComponent(mediafireId)}`);
    const data = await res.json();

    if (!res.ok || !data.downloadUrl) {
      throw new Error(data.error || "Error resolving the link.");
    }

    setTimeout(() => {
      if (dlLink) {
        dlLink.href = data.downloadUrl;
        dlLink.click();
      }
      showState(p3);
    }, 1200);

  } catch (err) {
    console.error(err);
    showState(p4);
  }
});