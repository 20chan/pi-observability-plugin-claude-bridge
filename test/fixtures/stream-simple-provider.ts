/**
 * Test fixture: a provider that streams through `streamSimple` instead of an
 * HTTP request, like pi-claude-bridge. pi then fires no
 * `before_provider_request`, only the message events.
 */
import { type AssistantMessage, createAssistantMessageEventStream, type Model } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { STREAM_SIMPLE_ANSWER } from "../helpers.ts";

function message(model: Model<any>, text: string): AssistantMessage {
  return {
    role: "assistant",
    content: [{ type: "text", text }],
    api: model.api,
    provider: model.provider,
    model: model.id,
    usage: {
      input: 12,
      output: 5,
      cacheRead: 0,
      cacheWrite: 0,
      totalTokens: 17,
      cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    },
    stopReason: "stop",
    timestamp: Date.now(),
  };
}

export default function (pi: ExtensionAPI) {
  pi.registerProvider("stream-simple", {
    baseUrl: "stream-simple",
    apiKey: "not-used",
    api: "stream-simple",
    models: [
      {
        id: "stream-simple-1",
        name: "Stream simple",
        reasoning: false,
        input: ["text"],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
        contextWindow: 100000,
        maxTokens: 1000,
      },
    ],
    streamSimple: (model: Model<any>) => {
      const stream = createAssistantMessageEventStream();
      setTimeout(() => {
        const partial = message(model, "");
        stream.push({ type: "start", partial });
        stream.push({ type: "text_start", contentIndex: 0, partial });
        stream.push({ type: "text_delta", contentIndex: 0, delta: STREAM_SIMPLE_ANSWER, partial });
        stream.push({ type: "text_end", contentIndex: 0, content: STREAM_SIMPLE_ANSWER, partial });
        stream.push({ type: "done", reason: "stop", message: message(model, STREAM_SIMPLE_ANSWER) });
        stream.end();
      }, 0);
      return stream;
    },
  } as any);
}
