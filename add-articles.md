# How to Add Blog Articles

## Blog Directory

All blog posts live in `site/blog/`.

## Remove Placeholder Posts

Delete the default Docusaurus posts before adding your own:

```bash
rm site/blog/2019-*.md site/blog/2021-08-01-*.mdx
rm -rf site/blog/2021-08-26-welcome/
```

## Add a New Post

Create a file named `YYYY-MM-DD-slug.md` in `site/blog/`:

```markdown
---
title: My Post Title
authors: [myauthor]
tags: [stave]
---

Intro paragraph shown in the blog listing.

<!-- truncate -->

Full content below the fold.
```

## Posts with Images

Use a folder format:

```
blog/
└── 2026-02-20-my-post/
    ├── index.md
    └── screenshot.png
```

Reference images with `![Alt text](./screenshot.png)` inside `index.md`.

## Update Authors

Edit `site/blog/authors.yml`:

```yaml
myauthor:
  name: My Name
  title: My Title
  url: https://github.com/myauthor
  image_url: https://github.com/myauthor.png
```

## Update Tags

Edit `site/blog/tags.yml`:

```yaml
stave:
  label: Stave
  description: Posts about Stave CLI
```

## Key Notes

- Filename format determines the post date: `YYYY-MM-DD-slug.md`
- Use `<!-- truncate -->` to control what appears in the blog listing
- Both `.md` and `.mdx` (with JSX) files are supported
- RSS/Atom feeds are auto-generated at `/blog/rss.xml` and `/blog/atom.xml`
- The sidebar shows up to 10 recent posts (configured in `docusaurus.config.ts`)
