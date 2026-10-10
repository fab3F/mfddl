const validPattern = /https?:\/\/download[0-9]+\.mediafire\.com\/[^\s"']+/;
const scrambledPattern = /data-scrambled-url="([^"]+)"/;
const mobileRedirectPattern = /href="(\/\/www\.mediafire\.com\/\?[^"]+)"/;

async function resolveMediafire(url, depth = 0) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) throw new Error(`MediaFire responded with status ${res.status}`);

  const html = await res.text();

  const directMatch = html.match(validPattern);
  if (directMatch) return directMatch[0];

  const scrambledMatch = html.match(scrambledPattern);
  if (scrambledMatch) {
    const decoded = Buffer.from(scrambledMatch[1], 'base64').toString('utf-8');
    const decodedMatch = decoded.match(validPattern);
    if (decodedMatch) return decodedMatch[0];
  }

  if (depth < 2) {
    const mobileMatch = html.match(mobileRedirectPattern);
    if (mobileMatch) {
      const mobileUrl = mobileMatch[1].startsWith('//') ? 'https:' + mobileMatch[1] : mobileMatch[1];
      return resolveMediafire(mobileUrl, depth + 1);
    }
  }

  return null;
}

export default async function handler(req, res) {
  const id = req.query.a;

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return res.status(400).json({ error: 'Invalid or missing MediaFire ID' });
  }

  try {
    const downloadUrl = await resolveMediafire(`https://www.mediafire.com/?${id}`);
    if (!downloadUrl) return res.status(404).json({ error: 'No Download-Link found' });
    return res.json({ downloadUrl });
  } catch (err) {
    return res.status(502).json({ error: err.message });
  }
}