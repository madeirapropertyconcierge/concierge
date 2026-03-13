Use bun package manager

Keep no legacy, never add backwards compatibility

Keep files short, enforce separation of concerns.

Avoid duplication, keep code consistency

## Adding Pictures

Add pictures with git. Do not use a JSON registry.

1. Put the file in `public/images/...`.
2. Use a real image extension: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, or `.avif`.
3. Prefer lowercase kebab-case filenames.
4. Commit and push the file normally.

Example:

```bash
git add public/images/about/new-team-photo.jpg
git commit -m "Add about page photo"
git push
```

Notes:

- The admin image gallery scans `public/` directly.
- If an image should be used on a page, reference it by its public path, for example `/images/about/new-team-photo.jpg`.
- To remove an image, delete the file with git and push the change.
