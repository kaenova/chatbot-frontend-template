/**
 * Example usage of the Langgraph to Assistant UI conversion functions
 * 
 * This file demonstrates how to use the conversion functions with actual
 * Langgraph state history data.
 */

import {
  convertLanggraphStateToAssistantUI,
  extractConversationFromHistory,
  LanggraphStateHistory,
  ThreadMessage
} from './langgraph-message-conversion';

// Example Langgraph state history data (based on the JSON examples from the docs)
const exampleStateHistory: LanggraphStateHistory = [
  [
    {
      messages: [
        {
          lc: 1,
          type: "constructor",
          id: ["langchain", "schema", "messages", "HumanMessage"],
          kwargs: {
            content: "Hello!",
            type: "human",
            id: "f5a28c2c-9829-46c0-a602-3a58f5878b43"
          }
        },
        {
          lc: 1,
          type: "constructor",
          id: ["langchain", "schema", "messages", "AIMessage"],
          kwargs: {
            content: "Hello! How can I assist you today?",
            additional_kwargs: { refusal: null },
            response_metadata: {
              token_usage: {
                completion_tokens: 10,
                prompt_tokens: 148,
                total_tokens: 158
              },
              model_name: "gpt-4-turbo-2024-04-09",
              finish_reason: "stop"
            },
            type: "ai",
            id: "run--fa7709c0-1edb-4bc0-a08d-ecf54297ec28-0",
            usage_metadata: {
              input_tokens: 148,
              output_tokens: 10,
              total_tokens: 158
            },
            tool_calls: [],
            invalid_tool_calls: []
          }
        },
        {
          lc: 1,
          type: "constructor",
          id: ["langchain", "schema", "messages", "HumanMessage"],
          kwargs: {
            content: "Nothing!",
            type: "human",
            id: "6ad6706a-c86a-4acf-a1a4-ec8943d04519"
          }
        },
        {
          lc: 1,
          type: "constructor",
          id: ["langchain", "schema", "messages", "AIMessage"],
          kwargs: {
            content: "Alright! If you have any questions or need assistance in the future, feel free to ask. Have a great day!",
            additional_kwargs: { refusal: null },
            response_metadata: {
              token_usage: {
                completion_tokens: 25,
                prompt_tokens: 167,
                total_tokens: 192
              },
              model_name: "gpt-4-turbo-2024-04-09",
              finish_reason: "stop"
            },
            type: "ai",
            id: "run--a5b0baa6-8190-4517-9478-3661b877bd66-0",
            usage_metadata: {
              input_tokens: 167,
              output_tokens: 25,
              total_tokens: 192
            },
            tool_calls: [],
            invalid_tool_calls: []
          }
        }
      ]
    },
    [],
    {
      configurable: {
        thread_id: "unique-id-09",
        checkpoint_ns: "",
        checkpoint_id: "1f099c87-00df-60d8-8004-806a91e68b5d"
      }
    },
    {
      source: "loop",
      step: 4,
      parents: {}
    },
    "2025-09-25T04:31:00.095580+00:00",
    {
      configurable: {
        thread_id: "unique-id-09",
        checkpoint_ns: "",
        checkpoint_id: "1f099c86-f3c7-6dfa-8003-a2d974f8ce2a"
      }
    },
    [],
    []
  ]
];

// Example with structured content (text blocks)
const exampleWithStructuredContent: LanggraphStateHistory = [
  [
    {
      messages: [
        {
          lc: 1,
          type: "constructor",
          id: ["langchain", "schema", "messages", "HumanMessage"],
          kwargs: {
            content: [
              { type: "text", text: "Hello!" }
            ],
            type: "human",
            id: "cccf75ac-19e5-4092-bcba-8f8ce7f1f407"
          }
        },
        {
          lc: 1,
          type: "constructor",
          id: ["langchain", "schema", "messages", "AIMessage"],
          kwargs: {
            content: "Hello! How can I assist you today?",
            response_metadata: {
              finish_reason: "stop",
              model_name: "gpt-4-turbo-2024-04-09"
            },
            type: "ai",
            id: "run--c79a18d7-73ff-429a-ba49-9347b1bdef49",
            tool_calls: [],
            invalid_tool_calls: []
          }
        }
      ]
    },
    [],
    {
      configurable: {
        thread_id: "c4494f01-e1b1-4fbf-a0bb-125e0983833b",
        checkpoint_ns: "",
        checkpoint_id: "1f099caa-09a3-6f8e-8001-68a280505302"
      }
    },
    {
      source: "loop",
      step: 1,
      parents: {}
    },
    "2025-09-25T04:46:40.539197+00:00",
    {
      configurable: {
        thread_id: "c4494f01-e1b1-4fbf-a0bb-125e0983833b",
        checkpoint_ns: "",
        checkpoint_id: "1f099ca9-f32e-6f60-8000-39e123e7199c"
      }
    },
    [],
    []
  ]
];

/**
 * Example 1: Convert the latest state from Langgraph to Assistant UI format
 */
export function example1_ConvertLatestState() {
  console.log('=== Example 1: Convert Latest State ===');
  
  const assistantUIMessages = convertLanggraphStateToAssistantUI(exampleStateHistory);
  
  console.log('Converted messages:', JSON.stringify(assistantUIMessages, null, 2));
  
  // Expected output: Array of messages with parent relationships
  // Each message will have a ThreadMessage and parentId
  return assistantUIMessages;
}

/**
 * Example 2: Extract full conversation history from multiple checkpoints
 */
export function example2_ExtractConversationHistory() {
  console.log('=== Example 2: Extract Conversation History ===');
  
  const conversationHistory = extractConversationFromHistory(exampleStateHistory);
  
  console.log('Conversation history:', JSON.stringify(conversationHistory, null, 2));
  
  return conversationHistory;
}

/**
 * Example 3: Handle structured content
 */
export function example3_StructuredContent() {
  console.log('=== Example 3: Structured Content ===');
  
  const structuredMessages = convertLanggraphStateToAssistantUI(exampleWithStructuredContent);
  
  console.log('Structured content messages:', JSON.stringify(structuredMessages, null, 2));
  
  return structuredMessages;
}

/**
 * Example 4: Demonstrate the message structure
 */
export function example4_MessageStructure() {
  console.log('=== Example 4: Message Structure Analysis ===');
  
  const messages = convertLanggraphStateToAssistantUI(exampleStateHistory);
  
  messages.forEach((item, index) => {
    const { message, parentId } = item;
    console.log(`Message ${index + 1}:`);
    console.log(`  - ID: ${message.id}`);
    console.log(`  - Role: ${message.role}`);
    console.log(`  - Content: ${JSON.stringify(message.content)}`);
    console.log(`  - Parent ID: ${parentId || 'null (root message)'}`);
    console.log(`  - Created At: ${message.createdAt.toISOString()}`);
    
    if (message.role === 'assistant') {
      const assistantMsg = message as ThreadMessage & { role: 'assistant' };
      console.log(`  - Status: ${JSON.stringify(assistantMsg.status)}`);
      console.log(`  - Steps: ${JSON.stringify(assistantMsg.metadata.steps)}`);
    }
    console.log('');
  });
  
  return messages;
}

/**
 * Example 5: Working with tool calls (demonstrates the fixed bug)
 * Shows how ToolMessage results are properly incorporated into AIMessage tool calls
 */
export function example5_ToolCallExample() {
  console.log('=== Example 5: Tool Call Structure (Fixed Bug) ===');
  
  // This is the actual tool call example from the JSON with ToolMessage properly handled
  const toolCallExample: LanggraphStateHistory = [
    [
      {
        messages: [
          {
            lc: 1,
            type: "constructor",
            id: ["langchain", "schema", "messages", "HumanMessage"],
            kwargs: {
              content: [{ type: "text", text: "What time is today?" }],
              type: "human",
              id: "6a4d82b1-5e89-475c-b5c1-13a881838e32"
            }
          },
          {
            lc: 1,
            type: "constructor",
            id: ["langchain", "schema", "messages", "AIMessage"],
            kwargs: {
              content: "",
              additional_kwargs: {
                tool_calls: [{
                  index: 0,
                  id: "call_bE2nvkBE6XAdSdFTpdRTzO47",
                  function: { arguments: "{}", name: "get_current_time" },
                  type: "function"
                }]
              },
              response_metadata: {
                finish_reason: "tool_calls",
                model_name: "gpt-4-turbo-2024-04-09",
                system_fingerprint: "fp_5603ee5e2e"
              },
              type: "ai",
              id: "run--48b50c69-cea4-4935-9699-9f63f97eb806",
              tool_calls: [{
                name: "get_current_time",
                args: {},
                id: "call_bE2nvkBE6XAdSdFTpdRTzO47",
                type: "tool_call"
              }],
              invalid_tool_calls: []
            }
          },
          {
            lc: 1,
            type: "constructor",
            id: ["langchain", "schema", "messages", "ToolMessage"],
            kwargs: {
              content: "2025-09-25T12:30:42.889461",
              type: "tool",
              name: "get_current_time",
              id: "50b7660b-b546-4d11-830e-f50b90be1b5c",
              tool_call_id: "call_bE2nvkBE6XAdSdFTpdRTzO47",
              status: "success"
            }
          },
          {
            lc: 1,
            type: "constructor",
            id: ["langchain", "schema", "messages", "AIMessage"],
            kwargs: {
              content: "Today is September 25, 2025.",
              response_metadata: {
                finish_reason: "stop",
                model_name: "gpt-4-turbo-2024-04-09",
                system_fingerprint: "fp_5603ee5e2e"
              },
              type: "ai",
              id: "run--a23a6454-9e51-469c-bec1-aeffa9c0fd18",
              tool_calls: [],
              invalid_tool_calls: []
            }
          }
        ]
      },
      [],
      {
        configurable: {
          thread_id: "46d283f1-cf5a-4182-9d04-b36e2f2e078b",
          checkpoint_ns: "",
          checkpoint_id: "1f099d0c-84c5-6674-8003-2ef82bf8aae3"
        }
      },
      {
        source: "loop",
        step: 3,
        parents: {}
      },
      "2025-09-25T05:30:44.117862+00:00",
      {
        configurable: {
          thread_id: "46d283f1-cf5a-4182-9d04-b36e2f2e078b",
          checkpoint_ns: "",
          checkpoint_id: "1f099d0c-790f-6d02-8002-f1dba09377e6"
        }
      },
      [],
      []
    ]
  ];
  
  const toolMessages = convertLanggraphStateToAssistantUI(toolCallExample);
  
  console.log('Fixed tool call messages:', JSON.stringify(toolMessages, null, 2));
  console.log('\n🔧 Bug Fix Demonstration:');
  console.log('- ToolMessage is no longer converted to a user message');
  console.log('- Tool results are properly incorporated into the AIMessage tool calls');
  console.log('- The conversation flow shows: User -> Assistant (tool call) -> Assistant (final response)');
  console.log('- Tool results are accessible via the ToolCallMessagePart.result property');
  
  return toolMessages;
}

/**
 * Run all examples
 */
export function runAllExamples() {
  console.log('🚀 Running Langgraph to Assistant UI conversion examples...\n');
  
  const results = {
    example1: example1_ConvertLatestState(),
    example2: example2_ExtractConversationHistory(),
    example3: example3_StructuredContent(),
    example4: example4_MessageStructure(),
    example5: example5_ToolCallExample()
  };
  
  console.log('✅ All examples completed!');
  
  return results;
}

// Export the example data for testing
export {
  exampleStateHistory,
  exampleWithStructuredContent
};

// If running this file directly, run all examples
if (require.main === module) {
  runAllExamples();
}
