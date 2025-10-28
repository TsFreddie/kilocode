/**
 * JsonRenderer - Component for JSON output mode in CI
 * Outputs messages as JSON instead of rendering React components
 */

import React, { useEffect, useRef } from "react"
import { useAtomValue } from "jotai"
import { mergedMessagesAtom, type UnifiedMessage } from "../state/atoms/ui.js"
import { outputJsonMessage } from "./utils/jsonOutput.js"

interface JsonRendererProps {
	/** Callback when rendering is complete (for CI mode exit) */
	onComplete?: () => void
}

/**
 * Create a unique key for a message to track if it has changed
 */
function getMessageKey(message: UnifiedMessage): string {
	const baseKey = `${message.source}-${message.message.ts}`
	const content = message.source === "cli" ? message.message.content : message.message.text || ""
	const partial = message.message.partial ? "partial" : "complete"
	return `${baseKey}-${content.length}-${partial}`
}

/**
 * JsonRenderer component
 *
 * This component monitors the message stream and outputs each message as JSON
 * to stdout. It's designed for CI mode where we want machine-readable output
 * instead of the interactive terminal UI.
 *
 * Key behaviors:
 * - Outputs every message update, including partial messages
 * - When a partial message is updated, outputs a new JSON line with the updated content
 * - When a message becomes complete (partial: false), outputs the final version
 * - This allows consumers to build streaming UIs that show real-time updates
 * - Does not render any visual components (returns null)
 *
 * Example output stream:
 * {"timestamp":123,"source":"extension","type":"say","content":"Hello","metadata":{"partial":true}}
 * {"timestamp":123,"source":"extension","type":"say","content":"Hello world","metadata":{"partial":true}}
 * {"timestamp":123,"source":"extension","type":"say","content":"Hello world!","metadata":{"partial":false}}
 */
export const JsonRenderer: React.FC<JsonRendererProps> = ({ onComplete }) => {
	const messages = useAtomValue(mergedMessagesAtom)
	const lastOutputKeysRef = useRef<string[]>([])

	useEffect(() => {
		// Build current message keys
		const currentKeys = messages.map(getMessageKey)

		// Output messages that have changed or are new
		for (let i = 0; i < messages.length; i++) {
			const message = messages[i]
			const currentKey = currentKeys[i]
			const lastKey = lastOutputKeysRef.current[i]

			if (!message || !currentKey) continue

			// Output if this is a new message or if the message has changed
			if (currentKey !== lastKey) {
				outputJsonMessage(message)
			}
		}

		// Update the reference to current keys
		lastOutputKeysRef.current = currentKeys

		// Note: We don't call onComplete here because we want to let
		// the CI mode hook handle exit timing based on completion detection
	}, [messages, onComplete])

	// Don't render anything - we're just outputting JSON
	return null
}
