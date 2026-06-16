import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cmsPageDocumentSchema } from './schema';
import { findDuplicateIds, findNonCanonicalFields } from './content-integrity';

const PAGES_DIR = join(import.meta.dir, '..', '..', 'content', 'cms', 'pages');

function loadPageFixtures() {
  return readdirSync(PAGES_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      file,
      page: cmsPageDocumentSchema.parse(JSON.parse(readFileSync(join(PAGES_DIR, file), 'utf8'))),
    }));
}

describe('cms content integrity', () => {
  const fixtures = loadPageFixtures();

  it('has page fixtures to check', () => {
    expect(fixtures.length).toBeGreaterThan(0);
  });

  for (const { file, page } of fixtures) {
    it(`${file}: every field selector is canonical [data-cms-id]`, () => {
      const nonCanonical = findNonCanonicalFields(page);
      expect(nonCanonical.map((field) => field.id)).toEqual([]);
    });

    it(`${file}: field ids are unique within the page`, () => {
      expect(findDuplicateIds(page)).toEqual([]);
    });
  }
});
