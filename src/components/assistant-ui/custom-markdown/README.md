# Custom Markdown Components

This module provides custom React components to handle special markdown patterns for documents and external links that are **integrated directly into the assistant-ui markdown system**.

## Folder Structure

```
src/components/assistant-ui/custom-markdown/
├── index.ts          # Main exports
├── placeholders.tsx  # Placeholder components used by markdown-text.tsx
└── README.md         # This documentation
```

## Patterns Supported

The assistant-ui markdown system now automatically recognizes and converts these patterns:

- `[doc-(id)]` - References to documents with a specific ID → Blue document button
- `[link-(url)]` - External links → Green external link button showing domain

## Examples

```markdown
Check out [doc-(user-guide)] for more information.
Visit [link-(https://azure.microsoft.com/en-us/services/cognitive-services/openai-service/)] for details.
```

## Components

### `DocPlaceholder`

Renders a blue clickable button for document references.

**Props:**
- `id: string` - The document ID
- `className?: string` - Additional CSS classes  
- `onClick?: (id: string) => void` - Callback when clicked

### `LinkPlaceholder`

Renders a green clickable button for external links, showing the domain name.

**Props:**
- `url: string` - The external URL
- `className?: string` - Additional CSS classes

## Usage

The custom patterns are **automatically handled** by the existing assistant-ui `MarkdownText` component. No additional setup required!

### Basic Usage

```tsx
import { MarkdownText } from "@/components/assistant-ui/markdown-text";

// Your content can now include custom patterns
const content = `
# Documentation

Check out [doc-(user-guide)] for setup instructions.
Also see [link-(https://docs.example.com)] for the API reference.
`;

// The MarkdownText component automatically processes custom patterns
<MarkdownText />
```

### Customizing Document Click Behavior

If you need to customize how document links behave, you can modify the `DocPlaceholder` component in `placeholders.tsx`:

```tsx
// In placeholders.tsx
const handleClick = (e: React.MouseEvent) => {
  e.preventDefault();
  if (onClick) {
    onClick(id);
  } else {
    // Customize this default behavior
    window.location.href = `/docs/${id}`;
  }
};
```

### Integration with Existing Markdown

The `CustomMarkdownProcessor` works well alongside regular markdown processing. You can use it to pre-process text before passing it to other markdown renderers, or use it as a standalone component for text that contains these custom patterns.

## Testing

To test the custom patterns, simply include them in any markdown content:

```markdown
# Test Document

Regular markdown works: **bold**, *italic*, `code`

Custom patterns:
- Document reference: [doc-(getting-started)]
- External link: [link-(https://github.com/microsoft/vscode)]
- Multiple in one line: [doc-(config)] and [link-(https://docs.example.com)]
```

The patterns will automatically be converted to interactive buttons when rendered through the `MarkdownText` component.

## How It Works

The integration works through:

1. **Text Preprocessing**: Custom patterns `[doc-(id)]` and `[link-(url)]` are converted to HTML spans with special classes
2. **rehype-raw Plugin**: Parses the HTML spans as actual DOM elements  
3. **Custom Span Handler**: The markdown renderer detects special classes and renders the placeholder components
4. **Interactive Components**: Users see clickable buttons instead of raw text patterns

This approach ensures:
- ✅ Full compatibility with existing assistant-ui features (math, code blocks, mermaid, etc.)
- ✅ Proper handling of streaming content
- ✅ Type safety and error handling
- ✅ No breaking changes to existing functionality

## Styling

The components use Tailwind CSS with consistent theming:
- **Document links**: Blue theme with file icon (`DocPlaceholder`)
- **External links**: Green theme with external link icon (`LinkPlaceholder`)
- **Responsive design**: Works on all screen sizes
- **Dark mode**: Automatic support for light/dark themes