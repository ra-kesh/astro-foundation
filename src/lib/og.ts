import sharp from 'sharp';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function lines(value: string, maxLength = 32): string[] {
  const words = value.trim().split(/\s+/);
  const result: string[] = [];

  for (const word of words) {
    const current = result.at(-1);
    if (!current || `${current} ${word}`.length > maxLength) {
      result.push(word);
    } else {
      result[result.length - 1] = `${current} ${word}`;
    }
  }

  return result.slice(0, 3);
}

export async function renderOgImage(options: {
  title: string;
  label: string;
  siteName: string;
}): Promise<Uint8Array<ArrayBuffer>> {
  const titleLines = lines(options.title);
  const tspans = titleLines
    .map(
      (line, index) =>
        `<tspan x="72" dy="${index === 0 ? 0 : 78}">${escapeXml(line)}</tspan>`,
    )
    .join('');

  const svg = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#ffffff" />
      <rect x="32" y="32" width="1136" height="566" fill="none" stroke="#111111" stroke-width="2" />
      <text x="72" y="98" fill="#111111" font-family="Arial, sans-serif" font-size="24">${escapeXml(options.label)}</text>
      <text x="72" y="224" fill="#111111" font-family="Arial, sans-serif" font-size="64" font-weight="700">${tspans}</text>
      <text x="72" y="550" fill="#111111" font-family="Arial, sans-serif" font-size="28">${escapeXml(options.siteName)}</text>
    </svg>
  `;

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const body = new Uint8Array(png.byteLength);
  body.set(png);
  return body;
}
