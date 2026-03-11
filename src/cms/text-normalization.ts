const MOJIBAKE_PATTERN = /(Ã.|â[\u0080-\u00bf]|ï»¿|�)/u;

function countMatches(value: string, pattern: RegExp): number {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return Array.from(value.matchAll(new RegExp(pattern.source, flags))).length;
}

function scoreText(value: string): number {
  const accents = countMatches(value, /[À-ÿ]/u);
  const mojibake = countMatches(value, MOJIBAKE_PATTERN);
  const replacement = countMatches(value, /�/u);

  return accents * 2 - mojibake * 4 - replacement * 6;
}

function decodeUtf8Mojibake(value: string): string | null {
  const bytes = new Uint8Array(value.length);

  for (let index = 0; index < value.length; index += 1) {
    const codePoint = value.charCodeAt(index);
    if (codePoint > 0xff) {
      return null;
    }

    bytes[index] = codePoint;
  }

  const repaired = new TextDecoder('utf-8').decode(bytes);
  return repaired === value ? null : repaired;
}

export function normalizeCmsText(value: string): string {
  let normalized = value.normalize('NFC');

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (!MOJIBAKE_PATTERN.test(normalized)) {
      break;
    }

    const repaired = decodeUtf8Mojibake(normalized);
    if (!repaired) {
      break;
    }

    const candidate = repaired.normalize('NFC');
    if (scoreText(candidate) <= scoreText(normalized)) {
      break;
    }

    normalized = candidate;
  }

  return normalized;
}
