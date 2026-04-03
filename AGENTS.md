Use bun package manager

Keep no legacy, never add backwards compatibility

Keep files short, enforce separation of concerns.

Avoid duplication, keep code consistency

Notes:

- The admin image gallery scans `public/` directly.
- When you upload an image directly using git make sure it is optimized to webp and lower resolution beforehand
- If an image should be used on a page, reference it by its public path, for example `/images/about/new-team-photo.jpg`.
- To remove an image, delete the file with git and push the change.
