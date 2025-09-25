# Langgraph Thread Data to Assistant UI External Message Daata Types


## Assistant UI Target Types
Analyze this Assistant UI types:

This are the conversion that i want:
```typescript
 /** Array of all messages with their parent references */
  messages: Array<{
    message: ThreadMessage;
    parentId: string | null; // This can be null if it's a root message
  }>;
```

Here are about ThreadMessage:  
```typescript
import { ReadonlyJSONObject } from "assistant-stream/utils";

export type TextMessagePart = {
  readonly type: "text";
  readonly text: string;
  readonly parentId?: string;
};

export type ReasoningMessagePart = {
  readonly type: "reasoning";
  readonly text: string;
  readonly parentId?: string;
};

export type SourceMessagePart = {
  readonly type: "source";
  readonly sourceType: "url";
  readonly id: string;
  readonly url: string;
  readonly title?: string;
  readonly parentId?: string;
};

export type ImageMessagePart = {
  readonly type: "image";
  readonly image: string;
  readonly filename?: string;
};

export type FileMessagePart = {
  readonly type: "file";
  readonly filename?: string;
  readonly data: string;
  readonly mimeType: string;
};

export type Unstable_AudioMessagePart = {
  readonly type: "audio";
  readonly audio: {
    readonly data: string;
    readonly format: "mp3" | "wav";
  };
};

export type ToolCallMessagePart<
  TArgs = ReadonlyJSONObject,
  TResult = unknown,
> = {
  readonly type: "tool-call";
  readonly toolCallId: string;
  readonly toolName: string;
  readonly args: TArgs;
  readonly result?: TResult | undefined;
  readonly isError?: boolean | undefined;
  readonly argsText: string;
  readonly artifact?: unknown;
  readonly parentId?: string;
};

export type ThreadUserMessagePart =
  | TextMessagePart
  | ImageMessagePart
  | FileMessagePart
  | Unstable_AudioMessagePart;

export type ThreadAssistantMessagePart =
  | TextMessagePart
  | ReasoningMessagePart
  | ToolCallMessagePart
  | SourceMessagePart
  | FileMessagePart
  | ImageMessagePart;
```

```typescript
import type { CompleteAttachment } from "./AttachmentTypes";
import type { ReadonlyJSONValue } from "assistant-stream/utils";
import type {
  TextMessagePart,
  ReasoningMessagePart,
  SourceMessagePart,
  ImageMessagePart,
  FileMessagePart,
  Unstable_AudioMessagePart,
  ToolCallMessagePart,
  ThreadUserMessagePart,
  ThreadAssistantMessagePart,
} from "./MessagePartTypes";

// Re-export message part types for convenience
export type {
  TextMessagePart,
  ReasoningMessagePart,
  SourceMessagePart,
  ImageMessagePart,
  FileMessagePart,
  Unstable_AudioMessagePart,
  ToolCallMessagePart,
  ThreadUserMessagePart,
  ThreadAssistantMessagePart,
};

// Alias for the role of a thread message
export type MessageRole = ThreadMessage["role"];

type MessageCommonProps = {
  readonly id: string;
  readonly createdAt: Date;
};

export type ThreadStep = {
  readonly messageId?: string;
  readonly usage?:
    | {
        readonly promptTokens: number;
        readonly completionTokens: number;
      }
    | undefined;
};

export type MessagePartStatus =
  | {
      readonly type: "running";
    }
  | {
      readonly type: "complete";
    }
  | {
      readonly type: "incomplete";
      readonly reason:
        | "cancelled"
        | "length"
        | "content-filter"
        | "other"
        | "error";
      readonly error?: unknown;
    };

export type ToolCallMessagePartStatus =
  | {
      readonly type: "requires-action";
      readonly reason: "tool-calls";
    }
  | MessagePartStatus;

export type MessageStatus =
  | {
      readonly type: "running";
    }
  | {
      readonly type: "requires-action";
      readonly reason: "tool-calls";
    }
  | {
      readonly type: "complete";
      readonly reason: "stop" | "unknown";
    }
  | {
      readonly type: "incomplete";
      readonly reason:
        | "cancelled"
        | "tool-calls"
        | "length"
        | "content-filter"
        | "other"
        | "error";
      readonly error?: ReadonlyJSONValue;
    };

export type ThreadSystemMessage = MessageCommonProps & {
  readonly role: "system";
  readonly content: readonly [TextMessagePart];
  readonly metadata: {
    readonly custom: Record<string, unknown>;
  };
};

export type ThreadUserMessage = MessageCommonProps & {
  readonly role: "user";
  readonly content: readonly ThreadUserMessagePart[];
  readonly attachments: readonly CompleteAttachment[];
  readonly metadata: {
    readonly custom: Record<string, unknown>;
  };
};

export type ThreadAssistantMessage = MessageCommonProps & {
  readonly role: "assistant";
  readonly content: readonly ThreadAssistantMessagePart[];
  readonly status: MessageStatus;
  readonly metadata: {
    readonly unstable_state: ReadonlyJSONValue;
    readonly unstable_annotations: readonly ReadonlyJSONValue[];
    readonly unstable_data: readonly ReadonlyJSONValue[];
    readonly steps: readonly ThreadStep[];
    readonly custom: Record<string, unknown>;
  };
};

export type RunConfig = {
  // TODO allow user customization via global type overrides
  readonly custom?: Record<string, unknown>;
};

export type AppendMessage = Omit<ThreadMessage, "id"> & {
  parentId: string | null;

  /** The ID of the message that was edited or undefined. */
  sourceId: string | null;
  runConfig: RunConfig | undefined;
  startRun?: boolean | undefined;
};

type BaseThreadMessage = {
  readonly status?: ThreadAssistantMessage["status"];
  readonly metadata: {
    readonly unstable_state?: ReadonlyJSONValue;
    readonly unstable_annotations?: readonly ReadonlyJSONValue[];
    readonly unstable_data?: readonly ReadonlyJSONValue[];
    readonly steps?: readonly ThreadStep[];
    readonly custom: Record<string, unknown>;
  };
  readonly attachments?: ThreadUserMessage["attachments"];
};

export type ThreadMessage = BaseThreadMessage &
  (ThreadSystemMessage | ThreadUserMessage | ThreadAssistantMessage);
```

## Langchain JSON Serialization

This is the serialized of the list of get state history

```json
[[{"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Hello!", "type": "human", "id": "f5a28c2c-9829-46c0-a602-3a58f5878b43"}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Hello! How can I assist you today?", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 10, "prompt_tokens": 148, "total_tokens": 158, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv4IwINBICeuKlA6mT5Z36va1gH", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_code": {"filtered": false, "detected": false}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--fa7709c0-1edb-4bc0-a08d-ecf54297ec28-0", "usage_metadata": {"input_tokens": 148, "output_tokens": 10, "total_tokens": 158, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Nothing!", "type": "human", "id": "6ad6706a-c86a-4acf-a1a4-ec8943d04519"}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Alright! If you have any questions or need assistance in the future, feel free to ask. Have a great day!", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 25, "prompt_tokens": 167, "total_tokens": 192, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv9ddGxctQVFyBEWSBNNnnIQdZ1", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--a5b0baa6-8190-4517-9478-3661b877bd66-0", "usage_metadata": {"input_tokens": 167, "output_tokens": 25, "total_tokens": 192, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}]}, [], {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c87-00df-60d8-8004-806a91e68b5d"}}, {"source": "loop", "step": 4, "parents": {}}, "2025-09-25T04:31:00.095580+00:00", {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-f3c7-6dfa-8003-a2d974f8ce2a"}}, [], []], [{"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Hello!", "type": "human", "id": "f5a28c2c-9829-46c0-a602-3a58f5878b43"}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Hello! How can I assist you today?", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 10, "prompt_tokens": 148, "total_tokens": 158, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv4IwINBICeuKlA6mT5Z36va1gH", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_code": {"filtered": false, "detected": false}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--fa7709c0-1edb-4bc0-a08d-ecf54297ec28-0", "usage_metadata": {"input_tokens": 148, "output_tokens": 10, "total_tokens": 158, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Nothing!", "type": "human", "id": "6ad6706a-c86a-4acf-a1a4-ec8943d04519"}}]}, ["llm_node"], {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-f3c7-6dfa-8003-a2d974f8ce2a"}}, {"source": "loop", "step": 3, "parents": {}}, "2025-09-25T04:30:58.722958+00:00", {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-f3c5-6596-8002-68b52601f098"}}, [["d6d36b28-5aab-743a-2198-e434f6fba408", "llm_node", ["__pregel_pull", "llm_node"], null, [], null, {"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Alright! If you have any questions or need assistance in the future, feel free to ask. Have a great day!", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 25, "prompt_tokens": 167, "total_tokens": 192, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv9ddGxctQVFyBEWSBNNnnIQdZ1", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--a5b0baa6-8190-4517-9478-3661b877bd66-0", "usage_metadata": {"input_tokens": 167, "output_tokens": 25, "total_tokens": 192, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}]}]], []], [{"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Hello!", "type": "human", "id": "f5a28c2c-9829-46c0-a602-3a58f5878b43"}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Hello! How can I assist you today?", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 10, "prompt_tokens": 148, "total_tokens": 158, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv4IwINBICeuKlA6mT5Z36va1gH", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_code": {"filtered": false, "detected": false}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--fa7709c0-1edb-4bc0-a08d-ecf54297ec28-0", "usage_metadata": {"input_tokens": 148, "output_tokens": 10, "total_tokens": 158, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}]}, ["__start__"], {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-f3c5-6596-8002-68b52601f098"}}, {"source": "input", "step": 2, "parents": {}}, "2025-09-25T04:30:58.721908+00:00", {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-d415-69bc-8001-8ef7b022c5ef"}}, [["321916a3-73c4-c5c8-4304-3e15c1f0a53b", "__start__", ["__pregel_pull", "__start__"], null, [], null, {"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Nothing!", "type": "human", "id": "6ad6706a-c86a-4acf-a1a4-ec8943d04519"}}]}]], []], [{"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Hello!", "type": "human", "id": "f5a28c2c-9829-46c0-a602-3a58f5878b43"}}, {"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Hello! How can I assist you today?", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 10, "prompt_tokens": 148, "total_tokens": 158, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv4IwINBICeuKlA6mT5Z36va1gH", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_code": {"filtered": false, "detected": false}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--fa7709c0-1edb-4bc0-a08d-ecf54297ec28-0", "usage_metadata": {"input_tokens": 148, "output_tokens": 10, "total_tokens": 158, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}]}, [], {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-d415-69bc-8001-8ef7b022c5ef"}}, {"source": "loop", "step": 1, "parents": {}}, "2025-09-25T04:30:55.399322+00:00", {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-c35a-605a-8000-1d9560055f75"}}, [], []], [{"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Hello!", "type": "human", "id": "f5a28c2c-9829-46c0-a602-3a58f5878b43"}}]}, ["llm_node"], {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-c35a-605a-8000-1d9560055f75"}}, {"source": "loop", "step": 0, "parents": {}}, "2025-09-25T04:30:53.644790+00:00", {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-c354-6b82-bfff-b5c546dbaa3b"}}, [["41d9ca75-b1ea-bb4b-67e3-8f2cdcca2f7a", "llm_node", ["__pregel_pull", "llm_node"], null, [], null, {"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "AIMessage"], "kwargs": {"content": "Hello! How can I assist you today?", "additional_kwargs": {"refusal": null}, "response_metadata": {"token_usage": {"completion_tokens": 10, "prompt_tokens": 148, "total_tokens": 158, "completion_tokens_details": null, "prompt_tokens_details": null}, "model_name": "gpt-4-turbo-2024-04-09", "system_fingerprint": "fp_5603ee5e2e", "id": "chatcmpl-CJXv4IwINBICeuKlA6mT5Z36va1gH", "service_tier": null, "prompt_filter_results": [{"prompt_index": 0, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "jailbreak": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}], "finish_reason": "stop", "logprobs": null, "content_filter_results": {"hate": {"filtered": false, "severity": "safe"}, "protected_material_code": {"filtered": false, "detected": false}, "protected_material_text": {"filtered": false, "detected": false}, "self_harm": {"filtered": false, "severity": "safe"}, "sexual": {"filtered": false, "severity": "safe"}, "violence": {"filtered": false, "severity": "safe"}}}, "type": "ai", "id": "run--fa7709c0-1edb-4bc0-a08d-ecf54297ec28-0", "usage_metadata": {"input_tokens": 148, "output_tokens": 10, "total_tokens": 158, "input_token_details": {}, "output_token_details": {}}, "tool_calls": [], "invalid_tool_calls": []}}]}]], []], [{"messages": []}, ["__start__"], {"configurable": {"thread_id": "unique-id-09", "checkpoint_ns": "", "checkpoint_id": "1f099c86-c354-6b82-bfff-b5c546dbaa3b"}}, {"source": "input", "step": -1, "parents": {}}, "2025-09-25T04:30:53.642625+00:00", null, [["2f887c07-3d2e-51f2-ee95-2426741636b3", "__start__", ["__pregel_pull", "__start__"], null, [], null, {"messages": [{"lc": 1, "type": "constructor", "id": ["langchain", "schema", "messages", "HumanMessage"], "kwargs": {"content": "Hello!", "type": "human", "id": "f5a28c2c-9829-46c0-a602-3a58f5878b43"}}]}]], []]]
```

Another example:
```json
[[{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","HumanMessage"],"kwargs":{"content":[{"type":"text","text":"Hello!"}],"type":"human","id":"cccf75ac-19e5-4092-bcba-8f8ce7f1f407"}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"Hello! How can I assist you today?","response_metadata":{"finish_reason":"stop","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--c79a18d7-73ff-429a-ba49-9347b1bdef49","tool_calls":[],"invalid_tool_calls":[]}}]},[],{"configurable":{"thread_id":"c4494f01-e1b1-4fbf-a0bb-125e0983833b","checkpoint_ns":"","checkpoint_id":"1f099caa-09a3-6f8e-8001-68a280505302"}},{"source":"loop","step":1,"parents":{}},"2025-09-25T04:46:40.539197+00:00",{"configurable":{"thread_id":"c4494f01-e1b1-4fbf-a0bb-125e0983833b","checkpoint_ns":"","checkpoint_id":"1f099ca9-f32e-6f60-8000-39e123e7199c"}},[],[]],[{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","HumanMessage"],"kwargs":{"content":[{"type":"text","text":"Hello!"}],"type":"human","id":"cccf75ac-19e5-4092-bcba-8f8ce7f1f407"}}]},["agent"],{"configurable":{"thread_id":"c4494f01-e1b1-4fbf-a0bb-125e0983833b","checkpoint_ns":"","checkpoint_id":"1f099ca9-f32e-6f60-8000-39e123e7199c"}},{"source":"loop","step":0,"parents":{}},"2025-09-25T04:46:38.184417+00:00",{"configurable":{"thread_id":"c4494f01-e1b1-4fbf-a0bb-125e0983833b","checkpoint_ns":"","checkpoint_id":"1f099ca9-f324-6cb8-bfff-0fe8e41345d7"}},[["c8af9a98-ab16-4882-db15-d873b1b42bd3","agent",["__pregel_pull","agent"],null,[],null,{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"Hello! How can I assist you today?","response_metadata":{"finish_reason":"stop","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--c79a18d7-73ff-429a-ba49-9347b1bdef49","tool_calls":[],"invalid_tool_calls":[]}}]}]],[]],[{"messages":[]},["__start__"],{"configurable":{"thread_id":"c4494f01-e1b1-4fbf-a0bb-125e0983833b","checkpoint_ns":"","checkpoint_id":"1f099ca9-f324-6cb8-bfff-0fe8e41345d7"}},{"source":"input","step":-1,"parents":{}},"2025-09-25T04:46:38.180156+00:00",null,[["d0724ba9-84b8-3377-5519-4f707b42afc4","__start__",["__pregel_pull","__start__"],null,[],null,{"messages":{"role":"user","content":[{"type":"text","text":"Hello!"}]}}]],[]]]
```

With tools calling
```json
[[{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","HumanMessage"],"kwargs":{"content":[{"type":"text","text":"What time is today?"}],"type":"human","id":"6a4d82b1-5e89-475c-b5c1-13a881838e32"}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"","additional_kwargs":{"tool_calls":[{"index":0,"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","function":{"arguments":"{}","name":"get_current_time"},"type":"function"}]},"response_metadata":{"finish_reason":"tool_calls","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--48b50c69-cea4-4935-9699-9f63f97eb806","tool_calls":[{"name":"get_current_time","args":{},"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","type":"tool_call"}],"invalid_tool_calls":[]}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","ToolMessage"],"kwargs":{"content":"2025-09-25T12:30:42.889461","type":"tool","name":"get_current_time","id":"50b7660b-b546-4d11-830e-f50b90be1b5c","tool_call_id":"call_bE2nvkBE6XAdSdFTpdRTzO47","status":"success"}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"Today is September 25, 2025.","response_metadata":{"finish_reason":"stop","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--a23a6454-9e51-469c-bec1-aeffa9c0fd18","tool_calls":[],"invalid_tool_calls":[]}}]},[],{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-84c5-6674-8003-2ef82bf8aae3"}},{"source":"loop","step":3,"parents":{}},"2025-09-25T05:30:44.117862+00:00",{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-790f-6d02-8002-f1dba09377e6"}},[],[]],[{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","HumanMessage"],"kwargs":{"content":[{"type":"text","text":"What time is today?"}],"type":"human","id":"6a4d82b1-5e89-475c-b5c1-13a881838e32"}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"","additional_kwargs":{"tool_calls":[{"index":0,"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","function":{"arguments":"{}","name":"get_current_time"},"type":"function"}]},"response_metadata":{"finish_reason":"tool_calls","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--48b50c69-cea4-4935-9699-9f63f97eb806","tool_calls":[{"name":"get_current_time","args":{},"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","type":"tool_call"}],"invalid_tool_calls":[]}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","ToolMessage"],"kwargs":{"content":"2025-09-25T12:30:42.889461","type":"tool","name":"get_current_time","id":"50b7660b-b546-4d11-830e-f50b90be1b5c","tool_call_id":"call_bE2nvkBE6XAdSdFTpdRTzO47","status":"success"}}]},["agent"],{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-790f-6d02-8002-f1dba09377e6"}},{"source":"loop","step":2,"parents":{}},"2025-09-25T05:30:42.890054+00:00",{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-790b-6f9a-8001-c5ef5e1d66b8"}},[["a54cd419-c3ac-248d-b218-f0f6f4b7173a","agent",["__pregel_pull","agent"],null,[],null,{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"Today is September 25, 2025.","response_metadata":{"finish_reason":"stop","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--a23a6454-9e51-469c-bec1-aeffa9c0fd18","tool_calls":[],"invalid_tool_calls":[]}}]}]],[]],[{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","HumanMessage"],"kwargs":{"content":[{"type":"text","text":"What time is today?"}],"type":"human","id":"6a4d82b1-5e89-475c-b5c1-13a881838e32"}},{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"","additional_kwargs":{"tool_calls":[{"index":0,"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","function":{"arguments":"{}","name":"get_current_time"},"type":"function"}]},"response_metadata":{"finish_reason":"tool_calls","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--48b50c69-cea4-4935-9699-9f63f97eb806","tool_calls":[{"name":"get_current_time","args":{},"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","type":"tool_call"}],"invalid_tool_calls":[]}}]},["tools"],{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-790b-6f9a-8001-c5ef5e1d66b8"}},{"source":"loop","step":1,"parents":{}},"2025-09-25T05:30:42.888468+00:00",{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-5bbd-64b6-8000-b1001ece1557"}},[["8f78c7b9-e68c-b4a8-efe9-0c371e2c24a6","tools",["__pregel_pull","tools"],null,[],null,{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","ToolMessage"],"kwargs":{"content":"2025-09-25T12:30:42.889461","type":"tool","name":"get_current_time","id":"50b7660b-b546-4d11-830e-f50b90be1b5c","tool_call_id":"call_bE2nvkBE6XAdSdFTpdRTzO47","status":"success"}}]}]],[]],[{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","HumanMessage"],"kwargs":{"content":[{"type":"text","text":"What time is today?"}],"type":"human","id":"6a4d82b1-5e89-475c-b5c1-13a881838e32"}}]},["agent"],{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-5bbd-64b6-8000-b1001ece1557"}},{"source":"loop","step":0,"parents":{}},"2025-09-25T05:30:39.815380+00:00",{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-5bb9-6f3c-bfff-7ab89407513c"}},[["964d39ff-01fe-2691-a6eb-7d79b1e17967","agent",["__pregel_pull","agent"],null,[],null,{"messages":[{"lc":1,"type":"constructor","id":["langchain","schema","messages","AIMessage"],"kwargs":{"content":"","additional_kwargs":{"tool_calls":[{"index":0,"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","function":{"arguments":"{}","name":"get_current_time"},"type":"function"}]},"response_metadata":{"finish_reason":"tool_calls","model_name":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_5603ee5e2e"},"type":"ai","id":"run--48b50c69-cea4-4935-9699-9f63f97eb806","tool_calls":[{"name":"get_current_time","args":{},"id":"call_bE2nvkBE6XAdSdFTpdRTzO47","type":"tool_call"}],"invalid_tool_calls":[]}}]}]],[]],[{"messages":[]},["__start__"],{"configurable":{"thread_id":"46d283f1-cf5a-4182-9d04-b36e2f2e078b","checkpoint_ns":"","checkpoint_id":"1f099d0c-5bb9-6f3c-bfff-7ab89407513c"}},{"source":"input","step":-1,"parents":{}},"2025-09-25T05:30:39.814011+00:00",null,[["6a3ce7b2-2af4-0c1a-aca6-11777dc73d1a","__start__",["__pregel_pull","__start__"],null,[],null,{"messages":{"role":"user","content":[{"type":"text","text":"What time is today?"}]}}]],[]]]
```
