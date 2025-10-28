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
 * Check if a message is complete (not partial)
 */
function isMessageComplete(message: UnifiedMessage): boolean {
	if (message.source === "cli") {
		// CLI messages are complete if partial is not true
		return message.message.partial !== true
	} else {
		// Extension messages are complete if partial is not true
		return message.message.partial !== true
	}
}

/**
 * JsonRenderer component
 *
 * This component monitors the message stream and outputs each message as JSON
 * to stdout. It's designed for CI mode where we want machine-readable output
 * instead of the interactive terminal UI.
 *
 * Key behaviors:
 * - Only outputs complete (non-partial) messages
 * - Waits for a message to be complete before outputting it
 * - If a new message arrives, outputs any previous partial messages that are now complete
 * - Tracks which messages have been output to avoid duplicates
 * - Does not render any visual components (returns null)
 */
export const JsonRenderer: React.FC<JsonRendererProps> = ({ onComplete }) => {
	const messages = useAtomValue(mergedMessagesAtom)
	const outputCountRef = useRef(0)

	useEffect(() => {
		// Determine how many messages we can output
		// We can output all complete messages, plus any partial messages that have been superseded
		let outputUpTo = outputCountRef.current

		for (let i = outputCountRef.current; i < messages.length; i++) {
			const message = messages[i]
			if (!message) continue

			const isComplete = isMessageComplete(message)
			const isLastMessage = i === messages.length - 1

			if (isComplete) {
				// Complete message - can output
				outputUpTo = i + 1
			} else if (!isLastMessage) {
				// Partial message but not the last one - a newer message exists, so output this one
				outputUpTo = i + 1
			}
			// If it's partial AND the last message, don't output it yet
		}

		// Output messages from outputCountRef.current to outputUpTo
		for (let i = outputCountRef.current; i < outputUpTo; i++) {
			const message = messages[i]
			if (message) {
				outputJsonMessage(message)
			}
		}

		// Update the count of output messages
		outputCountRef.current = outputUpTo

		// Note: We don't call onComplete here because we want to let
		// the CI mode hook handle exit timing based on completion detection
	}, [messages, onComplete])

	// Don't render anything - we're just outputting JSON
	return null
}
