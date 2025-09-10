import { generateId, getCurrentTimestamp } from './db'

const mockMarkdownTemplates = [
  `# Welcome to Our Chatbot!

Hello! I'm here to help you with **${getRandomTopic()}**. Here's what I can assist you with:

## Key Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Code Generation** | Generate code snippets | ✅ Available |
| **Documentation** | Help with documentation | ✅ Available |
| **Problem Solving** | Debug and solve issues | ✅ Available |
| **Learning** | Explain concepts clearly | ✅ Available |

## Quick Tips

- Use **bold** text for emphasis
- Create \`inline code\` for technical terms
- Make lists for organized information:
  - Item 1
  - Item 2
  - Item 3

> **Note:** This is a mock response generated for demonstration purposes.

Would you like me to help you with anything specific?`,

  `## Understanding ${getRandomTopic()}

Let me break this down for you step by step:

### 1. Basic Concepts

\`\`\`typescript
interface Example {
  name: string;
  value: number;
  active: boolean;
}

const example: Example = {
  name: "Demo",
  value: 42,
  active: true
};
\`\`\`

### 2. Common Patterns

Here are some patterns you might find useful:

- **Factory Pattern**: Creates objects without specifying exact classes
- **Observer Pattern**: Objects notify subscribers of changes
- **Strategy Pattern**: Encapsulates algorithms in interchangeable classes

### 3. Best Practices

1. **Keep it simple** - Don't overcomplicate solutions
2. **Test thoroughly** - Ensure reliability
3. **Document well** - Make code maintainable
4. **Follow conventions** - Use established patterns

### 4. Resources

- [Official Documentation](https://example.com)
- [Community Forums](https://community.example.com)
- [Video Tutorials](https://youtube.com/example)

Feel free to ask follow-up questions!`,

  `# ${getRandomTopic()} Implementation Guide

## Overview

This guide will walk you through implementing **${getRandomTopic()}** in your project.

## Prerequisites

Before we begin, make sure you have:

- ✅ Node.js installed (v18+)
- ✅ Package manager (npm/yarn/bun)
- ✅ Code editor (VS Code recommended)
- ✅ Basic JavaScript/TypeScript knowledge

## Step-by-Step Implementation

### Step 1: Project Setup

\`\`\`bash
# Create new project
mkdir my-awesome-project
cd my-awesome-project

# Initialize package.json
npm init -y

# Install dependencies
npm install ${getRandomPackages()}
\`\`\`

### Step 2: Basic Structure

\`\`\`typescript
// src/index.ts
import { ${getRandomFunctions()} } from './utils';

export class ${getRandomClassName()} {
  constructor(private config: Config) {}

  async initialize(): Promise<void> {
    console.log('🚀 Initializing ${getRandomTopic()}...');
    // Implementation here
  }

  async process(data: any): Promise<Result> {
    // Process logic here
    return { success: true, data };
  }
}
\`\`\`

### Step 3: Configuration

\`\`\`json
{
  "name": "my-awesome-project",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  }
}
\`\`\`

## Testing

\`\`\`typescript
// __tests__/index.test.ts
import { ${getRandomClassName()} } from '../src';

describe('${getRandomClassName()}', () => {
  it('should initialize correctly', async () => {
    const instance = new ${getRandomClassName()}({/* config */});
    await expect(instance.initialize()).resolves.toBeUndefined();
  });
});
\`\`\`

## Deployment

1. Build the project: \`npm run build\`
2. Test in staging environment
3. Deploy to production
4. Monitor and iterate

---

*This is an AI-generated response for demonstration purposes.*`,

  `## Troubleshooting ${getRandomTopic()}

### Common Issues & Solutions

#### Issue 1: ${getRandomError()}

**Symptoms:**
- Error message appears
- Functionality breaks
- Performance degrades

**Solution:**
\`\`\`typescript
// Fix for ${getRandomError()}
try {
  const result = await problematicFunction();
  return result;
} catch (error) {
  console.error('Error occurred:', error);
  // Fallback logic here
  return defaultValue;
}
\`\`\`

#### Issue 2: Configuration Problems

**Symptoms:**
- Settings not applied
- Unexpected behavior
- Missing features

**Solution:**
\`\`\`json
{
  "debug": true,
  "timeout": 5000,
  "retries": 3,
  "fallback": {
    "enabled": true,
    "strategy": "exponential_backoff"
  }
}
\`\`\`

#### Issue 3: Performance Issues

**Symptoms:**
- Slow response times
- High memory usage
- CPU spikes

**Optimization Tips:**
1. **Caching**: Implement intelligent caching
2. **Lazy Loading**: Load resources on demand
3. **Connection Pooling**: Reuse connections
4. **Async Processing**: Use non-blocking operations

### Debug Mode

Enable debug logging:

\`\`\`bash
export DEBUG=true
export LOG_LEVEL=debug
npm start
\`\`\`

### Getting Help

If you're still having issues:

1. Check the [FAQ](https://example.com/faq)
2. Search [GitHub Issues](https://github.com/example/repo/issues)
3. Ask in our [Community Discord](https://discord.gg/example)
4. Contact [Support](mailto:support@example.com)

Remember: Most issues have already been solved by the community!`,

  `# Advanced ${getRandomTopic()} Techniques

## Deep Dive

Let's explore some advanced concepts and techniques:

### Metaprogramming

\`\`\`typescript
// Advanced TypeScript with generics
type ApiResponse<T> = {
  data: T;
  meta: {
    timestamp: number;
    version: string;
    requestId: string;
  };
};

class ApiClient<T extends Record<string, any>> {
  constructor(private baseUrl: string) {}

  async get<K extends keyof T>(endpoint: K): Promise<ApiResponse<T[K]>> {
    const response = await fetch(\`\${this.baseUrl}/\${endpoint}\`);
    const data = await response.json();

    return {
      data,
      meta: {
        timestamp: Date.now(),
        version: '1.0.0',
        requestId: generateId()
      }
    };
  }
}
\`\`\`

### Performance Optimization

#### Memory Management

\`\`\`typescript
class MemoryEfficientProcessor {
  private cache = new Map<string, any>();
  private maxCacheSize = 1000;

  process(data: any): any {
    const key = this.generateKey(data);

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const result = this.expensiveOperation(data);

    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entries (simple LRU)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, result);
    return result;
  }

  private generateKey(data: any): string {
    return JSON.stringify(data);
  }

  private expensiveOperation(data: any): any {
    // Simulate expensive computation
    return data;
  }
}
\`\`\`

### Design Patterns

#### Builder Pattern

\`\`\`typescript
class QueryBuilder {
  private conditions: string[] = [];
  private orderBy?: string;
  private limit?: number;

  where(condition: string): this {
    this.conditions.push(condition);
    return this;
  }

  orderBy(field: string): this {
    this.orderBy = field;
    return this;
  }

  setLimit(limit: number): this {
    this.limit = limit;
    return this;
  }

  build(): string {
    let query = 'SELECT * FROM table';

    if (this.conditions.length > 0) {
      query += ' WHERE ' + this.conditions.join(' AND ');
    }

    if (this.orderBy) {
      query += \` ORDER BY \${this.orderBy}\`;
    }

    if (this.limit) {
      query += \` LIMIT \${this.limit}\`;
    }

    return query;
  }
}

// Usage
const query = new QueryBuilder()
  .where('status = "active"')
  .where('created_at > "2024-01-01"')
  .orderBy('created_at DESC')
  .setLimit(10)
  .build();
\`\`\`

### Best Practices

- **SOLID Principles**: Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion
- **DRY (Don't Repeat Yourself)**: Extract common logic
- **KISS (Keep It Simple, Stupid)**: Simple solutions are better
- **YAGNI (You Aren't Gonna Need It)**: Don't add unnecessary features

### Conclusion

These advanced techniques will help you build more robust and maintainable ${getRandomTopic()} implementations. Remember to always consider the trade-offs between complexity and maintainability.

*Happy coding!* 🚀`
]

// Helper functions for generating random content
function getRandomTopic(): string {
  const topics = [
    'React Development', 'TypeScript Programming', 'API Design', 'Database Optimization',
    'Cloud Architecture', 'Microservices', 'DevOps', 'Machine Learning', 'Web Security',
    'Performance Tuning', 'Code Review', 'Testing Strategies', 'CI/CD Pipelines'
  ];
  return topics[Math.floor(Math.random() * topics.length)];
}

function getRandomPackages(): string {
  const packages = [
    'express cors helmet dotenv',
    'react react-dom next',
    'typescript @types/node jest',
    'mongoose redis socket.io',
    'axios lodash moment',
    'webpack babel eslint prettier'
  ];
  return packages[Math.floor(Math.random() * packages.length)];
}

function getRandomFunctions(): string {
  const functions = [
    'validateInput, processData',
    'authenticate, authorize',
    'connect, disconnect',
    'serialize, deserialize',
    'encrypt, decrypt'
  ];
  return functions[Math.floor(Math.random() * functions.length)];
}

function getRandomClassName(): string {
  const names = [
    'DataProcessor', 'ApiClient', 'CacheManager', 'Logger', 'Validator',
    'Serializer', 'Authenticator', 'ConnectionPool', 'EventEmitter', 'ConfigManager'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

function getRandomError(): string {
  const errors = [
    'Connection Timeout', 'Invalid Credentials', 'Resource Not Found',
    'Permission Denied', 'Rate Limit Exceeded', 'Service Unavailable',
    'Database Connection Failed', 'Invalid Input Format'
  ];
  return errors[Math.floor(Math.random() * errors.length)];
}

export function generateMockMarkdown(): string {
  return mockMarkdownTemplates[Math.floor(Math.random() * mockMarkdownTemplates.length)];
}

export function generateConversationTitle(userMessage: string): string {
  // Extract first few words from user message as title
  const words = userMessage.split(' ').slice(0, 5);
  return words.join(' ') + (words.length >= 5 ? '...' : '');
}