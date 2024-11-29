# ⚒️ Markforge

A modern TypeScript library for crafting HTML into clean, readable Markdown. Built with LLMs and AI agents in mind.
## Features

- 🤖 **LLM-Optimized Output**: Produces clean, consistent Markdown that's ideal for LLMs and AI agents
- 🚀 **Modern TypeScript**: Full type safety and modern ES module support
- 🔧 **DOM-Independent**: Works in any Node.js environment without requiring a DOM
- ✨ **Built-in GFM**: GitHub Flavored Markdown support included by default
- 🎯 **Zero Runtime DOM**: Uses virtual DOM for parsing, keeping your bundle size small
- 🌳 **Tree-Shakeable**: Import only what you need
- 🔄 **Functional Core**: Built with functional programming patterns

## Installation

```bash
npm install markforge
# or
yarn add markforge
# or
pnpm add markforge
```

## Usage

### Basic Usage

```typescript
import markforge from 'markforge'

const html = '<h1>Hello, World!</h1>'
const markdown = markforge.toMarkdown(html)
console.log(markdown) // # Hello, World!
```

### LLM/AI Agent Usage

Perfect for cleaning up HTML content before sending to LLMs:

```typescript
import Markforge from 'markforge'

// Example: Processing HTML content for an LLM
async function processForLLM(htmlContent: string) {
  const markforge = new Markforge()
  const markdown = markforge.toMarkdown(htmlContent)

  // The output is clean, consistent Markdown that LLMs can easily understand
  const llmResponse = await llm.complete({
    prompt: markdown,
    // ... other options
  })

  return llmResponse
}
```

### Custom Instance

```typescript
import Markforge from 'markforge'

const service = new Markforge({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**'
})

const markdown = service.toMarkdown('<h1>Custom Options</h1>')
```

### GFM Features

Built-in support for GitHub Flavored Markdown:

```typescript
// Tables
const table = `
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Support</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Tables</td>
      <td>✅</td>
    </tr>
  </tbody>
</table>
`
markforge.toMarkdown(table)
// | Feature | Support |
// | ------- | ------- |
// | Tables  | ✅      |

// Task Lists
markforge.toMarkdown('<li><input type="checkbox" checked> Task</li>') // - [x] Task

// Strikethrough
markforge.toMarkdown('<del>removed</del>') // ~~removed~~
```

### Custom Rules

```typescript
import type { Rule } from 'markforge'

const customRule: Rule = {
  filter: 'span',
  replacement: (content) => `{${content}}`
}

markforge.addRule('customSpan', customRule)
```

## Why Markforge?

### For LLM/AI Applications

- **Clean Output**: Generates consistent, well-formatted Markdown that LLMs can easily process
- **Reliable Parsing**: Handles messy HTML input gracefully
- **Semantic Preservation**: Maintains document structure and meaning
- **Lightweight**: No heavy DOM dependencies that could bloat your AI application

### For Modern Applications

- **TypeScript First**: Built from the ground up with TypeScript
- **Modern Bundle**: ES modules with tree-shaking support
- **Minimal Dependencies**: Only uses domino for HTML parsing
- **Framework Agnostic**: Works anywhere JavaScript runs

## API

### MarkforgeOptions

```typescript
interface MarkforgeOptions {
  headingStyle?: 'setext' | 'atx'
  hr?: string
  bulletListMarker?: '*' | '+' | '-'
  codeBlockStyle?: 'indented' | 'fenced'
  fence?: '```' | '~~~'
  emDelimiter?: '_' | '*'
  strongDelimiter?: '__' | '**'
  linkStyle?: 'inlined' | 'referenced'
  linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut'
  br?: string
  preformattedCode?: boolean
}
```

### Methods

- `toMarkdown(input: string | Node): string` - Convert HTML to Markdown
- `use(plugin: Plugin | Plugin[]): MarkforgeService` - Use plugins
- `addRule(key: string, rule: Rule): MarkforgeService` - Add custom rules
- `keep(filter: string | string[] | Function): MarkforgeService` - Keep elements as HTML
- `remove(filter: string | string[] | Function): MarkforgeService` - Remove elements

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Max Schedin](https://github.com/maqen)
