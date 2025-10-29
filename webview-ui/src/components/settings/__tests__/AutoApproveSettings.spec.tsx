import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AutoApproveSettings } from "../AutoApproveSettings"
import { ExtensionStateContext } from "@/context/ExtensionStateContext"
import { TooltipProvider } from "@/components/ui/tooltip"
import { I18nextProvider } from "react-i18next"
import i18n from "i18next"

// Mock vscode
vi.mock("@/utils/vscode", () => ({
	vscode: {
		postMessage: vi.fn(),
	},
}))

import { vscode } from "@/utils/vscode"

// Mock hooks
vi.mock("@/hooks/useAutoApprovalState", () => ({
	useAutoApprovalState: vi.fn(() => ({ effectiveAutoApprovalEnabled: true })),
}))

vi.mock("@/hooks/useAutoApprovalToggles", () => ({
	useAutoApprovalToggles: vi.fn(() => ({})),
}))

// Setup i18n for tests
i18n.init({
	lng: "en",
	fallbackLng: "en",
	resources: {
		en: {
			settings: {
				sections: {
					autoApprove: "Auto-Approve",
				},
				autoApprove: {
					showMenu: {
						label: "Show auto-approve menu",
						description: "Show auto-approve menu in chat",
					},
					enabled: "Enable auto-approval",
					description: "Auto-approve certain operations",
					toggleShortcut: "Toggle with <SettingsLink>keyboard shortcut</SettingsLink>",
				},
			},
		},
	},
})

describe("AutoApproveSettings - YOLO Mode", () => {
	const mockSetCachedStateField = vi.fn()
	const mockSetYoloMode = vi.fn()
	const mockSetAutoApprovalEnabled = vi.fn()

	const createMockContext = (yoloMode: boolean = false) =>
		({
			yoloMode,
			setYoloMode: mockSetYoloMode,
			autoApprovalEnabled: true,
			setAutoApprovalEnabled: mockSetAutoApprovalEnabled,
			// Add other required context properties
			didHydrateState: true,
			showWelcome: false,
			theme: {},
			mcpServers: [],
			mcpMarketplaceCatalog: { items: [] },
			filePaths: [],
			openedTabs: [],
			commands: [],
			organizationAllowList: "all",
			organizationSettingsVersion: 0,
			cloudIsAuthenticated: false,
			sharingEnabled: false,
			hasOpenedModeSelector: false,
			setHasOpenedModeSelector: vi.fn(),
			alwaysAllowFollowupQuestions: false,
			setAlwaysAllowFollowupQuestions: vi.fn(),
			followupAutoApproveTimeoutMs: 60000,
			setFollowupAutoApproveTimeoutMs: vi.fn(),
			setCondensingApiConfigId: vi.fn(),
			setCustomCondensingPrompt: vi.fn(),
			profileThresholds: {},
			setProfileThresholds: vi.fn(),
			setApiConfiguration: vi.fn(),
			setCustomInstructions: vi.fn(),
			setAlwaysAllowReadOnly: vi.fn(),
			setAlwaysAllowReadOnlyOutsideWorkspace: vi.fn(),
			setAlwaysAllowWrite: vi.fn(),
			setAlwaysAllowWriteOutsideWorkspace: vi.fn(),
			setAlwaysAllowExecute: vi.fn(),
			setAlwaysAllowBrowser: vi.fn(),
			setAlwaysAllowMcp: vi.fn(),
			setAlwaysAllowModeSwitch: vi.fn(),
			setAlwaysAllowSubtasks: vi.fn(),
			setBrowserToolEnabled: vi.fn(),
			setShowRooIgnoredFiles: vi.fn(),
			setShowAutoApproveMenu: vi.fn(),
			setShowAnnouncement: vi.fn(),
			setAllowedCommands: vi.fn(),
			setDeniedCommands: vi.fn(),
			setAllowedMaxRequests: vi.fn(),
			setAllowedMaxCost: vi.fn(),
			setSoundEnabled: vi.fn(),
			setSoundVolume: vi.fn(),
			setTerminalShellIntegrationTimeout: vi.fn(),
			setTerminalShellIntegrationDisabled: vi.fn(),
			setTerminalZdotdir: vi.fn(),
			setTtsEnabled: vi.fn(),
			setTtsSpeed: vi.fn(),
			setDiffEnabled: vi.fn(),
			setEnableCheckpoints: vi.fn(),
			setBrowserViewportSize: vi.fn(),
			setFuzzyMatchThreshold: vi.fn(),
			setWriteDelayMs: vi.fn(),
			setScreenshotQuality: vi.fn(),
			setTerminalOutputLineLimit: vi.fn(),
			setTerminalOutputCharacterLimit: vi.fn(),
			mcpEnabled: true,
			setMcpEnabled: vi.fn(),
			enableMcpServerCreation: false,
			setEnableMcpServerCreation: vi.fn(),
			remoteControlEnabled: false,
			setRemoteControlEnabled: vi.fn(),
			taskSyncEnabled: false,
			setTaskSyncEnabled: vi.fn(),
			featureRoomoteControlEnabled: false,
			setFeatureRoomoteControlEnabled: vi.fn(),
			setAlwaysApproveResubmit: vi.fn(),
			setRequestDelaySeconds: vi.fn(),
			setCurrentApiConfigName: vi.fn(),
			setListApiConfigMeta: vi.fn(),
			setMode: vi.fn(),
			setCustomModePrompts: vi.fn(),
			setCustomSupportPrompts: vi.fn(),
			setEnhancementApiConfigId: vi.fn(),
			markNotificationAsDismissed: vi.fn(),
			setGhostServiceSettings: vi.fn(),
			setCommitMessageApiConfigId: vi.fn(),
			setShowTaskTimeline: vi.fn(),
			setSendMessageOnEnter: vi.fn(),
			setHideCostBelowThreshold: vi.fn(),
			setHoveringTaskTimeline: vi.fn(),
			setShowTimestamps: vi.fn(),
			setSystemNotificationsEnabled: vi.fn(),
			dismissedNotificationIds: [],
			setExperimentEnabled: vi.fn(),
			setCustomModes: vi.fn(),
			setMaxOpenTabsContext: vi.fn(),
			setMaxWorkspaceFiles: vi.fn(),
			setTelemetrySetting: vi.fn(),
			setRemoteBrowserEnabled: vi.fn(),
			setAwsUsePromptCache: vi.fn(),
			setMaxReadFileLine: vi.fn(),
			setMaxImageFileSize: vi.fn(),
			setMaxTotalImageSize: vi.fn(),
			setPinnedApiConfigs: vi.fn(),
			togglePinnedApiConfig: vi.fn(),
			setTerminalCompressProgressBar: vi.fn(),
			setHistoryPreviewCollapsed: vi.fn(),
			setReasoningBlockCollapsed: vi.fn(),
			setAutoCondenseContext: vi.fn(),
			setAutoCondenseContextPercent: vi.fn(),
			setAlwaysAllowUpdateTodoList: vi.fn(),
			setIncludeDiagnosticMessages: vi.fn(),
			setMaxDiagnosticMessages: vi.fn(),
			setIncludeTaskHistoryInEnhance: vi.fn(),
			globalRules: {},
			localRules: {},
			globalWorkflows: {},
			localWorkflows: {},
			mdmCompliant: false,
			maxConcurrentFileReads: 5,
			maxWorkspaceFiles: 200,
			requestDelaySeconds: 5,
		}) as any

	const defaultProps = {
		alwaysAllowReadOnly: false,
		alwaysAllowWrite: false,
		alwaysAllowBrowser: false,
		alwaysApproveResubmit: false,
		requestDelaySeconds: 5,
		alwaysAllowMcp: false,
		alwaysAllowModeSwitch: false,
		alwaysAllowSubtasks: false,
		alwaysAllowExecute: false,
		alwaysAllowFollowupQuestions: false,
		alwaysAllowUpdateTodoList: false,
		showAutoApproveMenu: false,
		yoloMode: false,
		setCachedStateField: mockSetCachedStateField,
	}

	beforeEach(() => {
		vi.clearAllMocks()
		// Reset vscode mock
		;(vscode.postMessage as any).mockClear()
	})

	describe("YOLO Mode Toggle Rendering", () => {
		it("should render YOLO mode section with warning styling", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			// Check for warning icon
			expect(screen.getByText("⚠️")).toBeInTheDocument()

			// Check for YOLO Mode heading
			expect(screen.getByText("YOLO Mode")).toBeInTheDocument()

			// Check for checkbox label
			expect(screen.getByText("Enable YOLO Mode - Auto-approve EVERYTHING")).toBeInTheDocument()
		})

		it("should render YOLO mode checkbox with correct data-testid", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox")
			expect(checkbox).toBeInTheDocument()
		})

		it("should display warning messages correctly", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			// Check for primary warning message
			expect(
				screen.getByText(/all operations will be automatically approved without confirmation/i),
			).toBeInTheDocument()

			// Check for secondary warning message
			expect(
				screen.getByText(
					/This includes file modifications, command execution, MCP tools, browser actions, and all other operations/i,
				),
			).toBeInTheDocument()
			expect(screen.getByText(/Use with extreme caution!/i)).toBeInTheDocument()
		})

		it("should show YOLO mode checkbox as unchecked when disabled", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={false} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox") as HTMLInputElement
			expect(checkbox.checked).toBe(false)
		})

		it("should show YOLO mode checkbox as checked when enabled", () => {
			const mockContext = createMockContext(true)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={true} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox") as HTMLInputElement
			expect(checkbox.checked).toBe(true)
		})
	})

	describe("YOLO Mode Toggle Interaction", () => {
		it("should update state when YOLO mode checkbox is clicked", () => {
			const mockContext = createMockContext(false)

			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={false} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox")
			fireEvent.click(checkbox)

			// Should call setCachedStateField with yoloMode (no immediate save)
			expect(mockSetCachedStateField).toHaveBeenCalledWith("yoloMode", true)

			// Should NOT call context setYoloMode immediately (waits for Save button)
			expect(mockSetYoloMode).not.toHaveBeenCalled()

			// Should NOT post message to extension immediately (waits for Save button)
			expect(vscode.postMessage).not.toHaveBeenCalled()
		})

		it("should disable YOLO mode when clicking checked checkbox", () => {
			const mockContext = createMockContext(true)

			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={true} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox")
			fireEvent.click(checkbox)

			// Should call setCachedStateField with yoloMode false (no immediate save)
			expect(mockSetCachedStateField).toHaveBeenCalledWith("yoloMode", false)

			// Should NOT call context setYoloMode immediately (waits for Save button)
			expect(mockSetYoloMode).not.toHaveBeenCalled()

			// Should NOT post message to extension immediately (waits for Save button)
			expect(vscode.postMessage).not.toHaveBeenCalled()
		})

		it("should use prop yoloMode value (prop takes precedence over context)", () => {
			const mockContext = createMockContext(true)

			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={false} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox") as HTMLInputElement
			// Prop value (false) should be used, not context value (true)
			expect(checkbox.checked).toBe(false)
		})
	})

	describe("Active State Indicator", () => {
		it("should not show active state indicator when YOLO mode is disabled", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={false} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			// Should not find the active indicator
			expect(
				screen.queryByText(/YOLO Mode is active - all auto-approval settings below are overridden/i),
			).not.toBeInTheDocument()
		})

		it("should show active state indicator when YOLO mode is enabled", () => {
			const mockContext = createMockContext(true)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={true} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			// Should find the active indicator
			expect(
				screen.getByText(/YOLO Mode is active - all auto-approval settings below are overridden/i),
			).toBeInTheDocument()

			// Should show the lightning emoji
			expect(screen.getByText("⚡")).toBeInTheDocument()
		})

		it("should have proper styling for active state indicator", () => {
			const mockContext = createMockContext(true)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={true} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			// Find the indicator text element
			const indicator = screen.getByText(/YOLO Mode is active - all auto-approval settings below are overridden/i)

			// Check that parent has warning styling classes
			const parent = indicator.closest("div")
			expect(parent?.className).toMatch(/yellow-500/)
		})
	})

	describe("Integration with ExtensionStateContext", () => {
		it("should use prop yoloMode value when provided", () => {
			const mockContext = createMockContext(false)

			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={true} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox") as HTMLInputElement
			expect(checkbox.checked).toBe(true)
		})

		it("should prefer prop value over context value", () => {
			const mockContext = createMockContext(false)

			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={true} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox") as HTMLInputElement
			expect(checkbox.checked).toBe(true)
		})

		it("should only call setCachedStateField on toggle (not immediate save)", () => {
			const mockContext = createMockContext(false)

			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} yoloMode={false} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const checkbox = screen.getByTestId("yolo-mode-checkbox")
			fireEvent.click(checkbox)

			// Should only update local state
			expect(mockSetCachedStateField).toHaveBeenCalledWith("yoloMode", true)
			// Should NOT call setYoloMode immediately (waits for Save button)
			expect(mockSetYoloMode).not.toHaveBeenCalled()
		})
	})

	describe("Warning Section Styling", () => {
		it("should have proper border and background styling", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			// Find the YOLO mode heading
			const heading = screen.getByText("YOLO Mode")
			// Get the outer container div with the warning styling (parent of parent)
			const warningSection = heading.parentElement?.parentElement

			// Check for warning border and background classes
			expect(warningSection?.className).toMatch(/border-yellow-500/)
			expect(warningSection?.className).toMatch(/bg-yellow-500/)
		})

		it("should display bold heading with proper text color", () => {
			const mockContext = createMockContext(false)
			render(
				<TooltipProvider>
					<I18nextProvider i18n={i18n}>
						<ExtensionStateContext.Provider value={mockContext}>
							<AutoApproveSettings {...defaultProps} />
						</ExtensionStateContext.Provider>
					</I18nextProvider>
				</TooltipProvider>,
			)

			const heading = screen.getByText("YOLO Mode")
			expect(heading.className).toMatch(/text-yellow-500/)
			expect(heading.className).toMatch(/font-bold/)
		})
	})
})
