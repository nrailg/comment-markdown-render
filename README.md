<div align="center">
  <img src="media/icon.png" alt="Comment Markdown Render Icon" width="120">
    
  *[Axel Delaval](https://axeldlv00.github.io/axel-delaval-personal-page/) • February 22th 2026*
  <br />

  [![GitHub](https://img.shields.io/badge/Source_Code-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/AxelDlv00/comment-markdown-render)
[![License](https://img.shields.io/badge/LICENSE-MIT-yellow?style=for-the-badge)](./LICENSE)
</div>

# Comment Markdown Render

Hover over an `md` comment and click **Open Markdown Preview**, or place the cursor in the comment and run **Comment Markdown: Open Preview to the Side**. VS Code opens its built-in Markdown preview beside the source and renders the comment with your Markdown preview settings, including math support.

## How to Use

Start the comment with the `md` prefix.

### Multi-line Blocks

The extension supports standard block comments across most languages:

```javascript
/** md
 * # Documentation
 * This is a **JSDoc** comment with math:
 * $$ \frac{-b \pm \sqrt{b^2-4ac}}{2a} $$
 */
```

```python
""" md
# Python Docstring
You can use *Markdown* here too!
- Item 1
- Item 2
"""
```

### Single-line Comments

You can also stack single-line comments:

```typescript
// md # Title
// md This is a list:
// md 1. First point
// md 2. Second point with $\alpha$
```

## Supported Comment Styles

| Syntax | Languages |
| --- | --- |
| `/* md ... */` or `/** md ... */` | JS, TS, C++, Java, CSS, etc. |
| `""" md ... """` | Python, Julia |
| `''' md ... '''` | Python |
| `/- md ... -/` | Lean4 |
| `// md` | C-style languages |
| `# md` | Python, Ruby, YAML, Bash |
| `-- md` | Lua, Haskell, SQL |