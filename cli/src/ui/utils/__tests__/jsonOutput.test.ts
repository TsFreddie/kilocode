/**
 * Tests for JSON output utilities
 */

import { describe, it, expect } from "@jest/globals"
import { formatMessageAsJson } from "../jsonOutput.js"
import type { UnifiedMessage } from "../../../state/atoms/ui.js"
import type { CliMessage } from "../../../types/cli.js"
import type { ExtensionChatMessage } from "../../../types/messages.js"

describe("jsonOutput", () => {
	describe("formatMessageAsJson", () => {
		it("should format CLI message correctly", () => {
			const cliMessage: CliMessage = {
				id: "test-1",
				type: "user",
				content: "Hello world",
				ts: 1234567890,
			}

			const unifiedMessage: UnifiedMessage = {
				source: "cli",
				message: cliMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result).toEqual({
				timestamp: 1234567890,
				source: "cli",
				type: "user",
				content: "Hello world",
			})
		})

		it("should format CLI message with metadata", () => {
			const cliMessage: CliMessage = {
				id: "test-2",
				type: "welcome",
				content: "Welcome!",
				ts: 1234567890,
				metadata: {
					welcomeOptions: {
						clearScreen: true,
					},
				},
			}

			const unifiedMessage: UnifiedMessage = {
				source: "cli",
				message: cliMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result).toEqual({
				timestamp: 1234567890,
				source: "cli",
				type: "welcome",
				content: "Welcome!",
				metadata: {
					welcomeOptions: {
						clearScreen: true,
					},
				},
			})
		})

		it("should format extension say message correctly", () => {
			const extMessage: ExtensionChatMessage = {
				ts: 1234567890,
				type: "say",
				say: "text",
				text: "Assistant response",
			}

			const unifiedMessage: UnifiedMessage = {
				source: "extension",
				message: extMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result).toEqual({
				timestamp: 1234567890,
				source: "extension",
				type: "say",
				content: "Assistant response",
				metadata: {
					say: "text",
				},
			})
		})

		it("should format extension ask message correctly", () => {
			const extMessage: ExtensionChatMessage = {
				ts: 1234567890,
				type: "ask",
				ask: "tool",
				text: "Tool approval request",
				partial: false,
			}

			const unifiedMessage: UnifiedMessage = {
				source: "extension",
				message: extMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result).toEqual({
				timestamp: 1234567890,
				source: "extension",
				type: "ask",
				content: "Tool approval request",
				metadata: {
					ask: "tool",
					partial: false,
				},
			})
		})

		it("should include partial status in metadata", () => {
			const extMessage: ExtensionChatMessage = {
				ts: 1234567890,
				type: "say",
				say: "text",
				text: "Streaming...",
				partial: true,
			}

			const unifiedMessage: UnifiedMessage = {
				source: "extension",
				message: extMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result.metadata).toEqual({
				say: "text",
				partial: true,
			})
		})

		it("should include images in metadata", () => {
			const extMessage: ExtensionChatMessage = {
				ts: 1234567890,
				type: "say",
				say: "text",
				text: "Message with images",
				images: ["data:image/png;base64,abc123"],
			}

			const unifiedMessage: UnifiedMessage = {
				source: "extension",
				message: extMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result.metadata).toEqual({
				say: "text",
				images: ["data:image/png;base64,abc123"],
			})
		})

		it("should not include metadata if empty", () => {
			const extMessage: ExtensionChatMessage = {
				ts: 1234567890,
				type: "say",
				text: "Simple message",
			}

			const unifiedMessage: UnifiedMessage = {
				source: "extension",
				message: extMessage,
			}

			const result = formatMessageAsJson(unifiedMessage)

			expect(result).toEqual({
				timestamp: 1234567890,
				source: "extension",
				type: "say",
				content: "Simple message",
			})

			it("should handle messages without text field", () => {
				const extMessage: ExtensionChatMessage = {
					ts: 1234567890,
					type: "say",
					say: "api_req_started",
				}

				const unifiedMessage: UnifiedMessage = {
					source: "extension",
					message: extMessage,
				}

				const result = formatMessageAsJson(unifiedMessage)

				expect(result).toEqual({
					timestamp: 1234567890,
					source: "extension",
					type: "say",
					metadata: {
						say: "api_req_started",
					},
				})
			})
		})
	})
})
