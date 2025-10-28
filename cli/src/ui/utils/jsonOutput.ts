/**
 * JSON output utilities for CI mode
 * Converts messages to JSON format for non-interactive output
 */

import type { UnifiedMessage } from "../../state/atoms/ui.js"
import type { ExtensionChatMessage } from "../../types/messages.js"
import type { CliMessage } from "../../types/cli.js"

/**
 * JSON output format for a message
 */
export interface JsonMessageOutput {
	timestamp: number
	source: "cli" | "extension"
	type: string
	content?: string
	metadata?: Record<string, any>
}

/**
 * Convert a CLI message to JSON output format
 */
function formatCliMessage(message: CliMessage): JsonMessageOutput {
	return {
		timestamp: message.ts,
		source: "cli",
		type: message.type,
		content: message.content,
		...(message.metadata && { metadata: message.metadata }),
	}
}

/**
 * Convert an extension message to JSON output format
 */
function formatExtensionMessage(message: ExtensionChatMessage): JsonMessageOutput {
	const output: JsonMessageOutput = {
		timestamp: message.ts,
		source: "extension",
		type: message.type,
	}

	// Add content from text field if available
	if (message.text) {
		output.content = message.text
	}

	// Build metadata object with relevant fields
	const metadata: Record<string, any> = {}

	// Add message subtype (say/ask)
	if (message.type === "say" && message.say) {
		metadata.say = message.say
	}
	if (message.type === "ask" && message.ask) {
		metadata.ask = message.ask
	}

	// Add partial status
	if (message.partial !== undefined) {
		metadata.partial = message.partial
	}

	// Add protection status
	if (message.isProtected !== undefined) {
		metadata.isProtected = message.isProtected
	}

	// Add answered status
	if (message.isAnswered !== undefined) {
		metadata.isAnswered = message.isAnswered
	}

	// Add images if present
	if (message.images && message.images.length > 0) {
		metadata.images = message.images
	}

	// Add any additional metadata from the message
	if (message.metadata) {
		metadata.messageMetadata = message.metadata
	}

	// Only add metadata if it has content
	if (Object.keys(metadata).length > 0) {
		output.metadata = metadata
	}

	return output
}

/**
 * Convert a unified message to JSON output format
 */
export function formatMessageAsJson(unifiedMessage: UnifiedMessage): JsonMessageOutput {
	if (unifiedMessage.source === "cli") {
		return formatCliMessage(unifiedMessage.message)
	} else {
		return formatExtensionMessage(unifiedMessage.message)
	}
}

/**
 * Output a message as JSON to stdout
 */
export function outputJsonMessage(unifiedMessage: UnifiedMessage): void {
	const jsonOutput = formatMessageAsJson(unifiedMessage)
	console.log(JSON.stringify(jsonOutput))
}

/**
 * Output multiple messages as JSON array to stdout
 */
export function outputJsonMessages(messages: UnifiedMessage[]): void {
	const jsonOutputs = messages.map(formatMessageAsJson)
	console.log(JSON.stringify(jsonOutputs))
}
