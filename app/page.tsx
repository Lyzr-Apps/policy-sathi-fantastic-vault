'use client'

/**
 * Policy Sathi - Government Policy Assistant
 *
 * Agent ID: 6985a3695eb49186d63e5dd6
 * RAG ID: 6985a356de7de278e55d2891
 * Model: gpt-4o (OpenAI)
 */

import * as React from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { KnowledgeBaseUpload } from '@/components/KnowledgeBaseUpload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Settings, Menu, Copy, Check, ChevronDown, ChevronUp, FileText, AlertCircle, BookOpen, Lightbulb, Gift, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

// TypeScript interfaces from actual agent response
interface PolicySathiResponse {
  status: 'success' | 'error'
  result: {
    formatted_response: string
    policy_name: string
    sections_included: string[]
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  policyName?: string
  sectionsIncluded?: string[]
  parsedSections?: ParsedSection[]
}

interface ParsedSection {
  title: string
  content: string
  icon: React.ReactNode
}

const AGENT_ID = '6985a3695eb49186d63e5dd6'
const RAG_ID = '6985a356de7de278e55d2891'

// Quick suggestion prompts
const QUICK_SUGGESTIONS = [
  'Maternity benefits',
  'Student scholarships',
  'Senior citizen schemes',
  'Farmer welfare policies',
  'Small business loans',
  'Healthcare benefits',
]

// Parse formatted response into sections
function parseResponse(formattedResponse: string, sectionsIncluded: string[]): ParsedSection[] {
  const sections: ParsedSection[] = []

  // Common section patterns
  const sectionPatterns = [
    { title: 'Policy at a Glance', icon: <FileText className="h-5 w-5" />, keywords: ['glance', 'overview', 'summary'] },
    { title: 'Key Takeaways', icon: <Lightbulb className="h-5 w-5" />, keywords: ['takeaway', 'highlights', 'important points'] },
    { title: 'Benefits', icon: <Gift className="h-5 w-5" />, keywords: ['benefits', 'advantages', 'what you get'] },
    { title: 'Eligibility', icon: <Shield className="h-5 w-5" />, keywords: ['eligibility', 'who can apply', 'requirements'] },
    { title: 'How to Apply', icon: <BookOpen className="h-5 w-5" />, keywords: ['apply', 'application', 'process', 'steps'] },
  ]

  // Try to split by common delimiters
  const lines = formattedResponse.split('\n')
  let currentSection: ParsedSection | null = null
  let currentContent: string[] = []

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Check if line is a section header
    let matchedPattern = false
    for (const pattern of sectionPatterns) {
      if (pattern.keywords.some(keyword => trimmedLine.toLowerCase().includes(keyword)) &&
          (trimmedLine.endsWith(':') || trimmedLine.length < 50)) {
        // Save previous section
        if (currentSection && currentContent.length > 0) {
          currentSection.content = currentContent.join('\n').trim()
          sections.push(currentSection)
        }

        // Start new section
        currentSection = {
          title: pattern.title,
          content: '',
          icon: pattern.icon,
        }
        currentContent = []
        matchedPattern = true
        break
      }
    }

    if (!matchedPattern && trimmedLine) {
      currentContent.push(line)
    }
  }

  // Save last section
  if (currentSection && currentContent.length > 0) {
    currentSection.content = currentContent.join('\n').trim()
    sections.push(currentSection)
  }

  // If no sections found, create a single section with all content
  if (sections.length === 0 && formattedResponse.trim()) {
    sections.push({
      title: 'Policy Information',
      content: formattedResponse,
      icon: <FileText className="h-5 w-5" />,
    })
  }

  return sections
}

// Section card component
function SectionCard({ section, isExpanded, onToggle, onCopy }: {
  section: ParsedSection
  isExpanded: boolean
  onToggle: () => void
  onCopy: () => void
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await copyToClipboard(section.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy()
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-[#ed8936]">{section.icon}</div>
          <h3 className="text-base font-semibold text-gray-900">{section.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Copy section"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 bg-white">
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {section.content}
          </div>
        </div>
      )}
    </div>
  )
}

// Message bubble component
function MessageBubble({ message }: { message: Message }) {
  const [expandedSections, setExpandedSections] = React.useState<Set<number>>(new Set([0]))
  const [copiedAll, setCopiedAll] = React.useState(false)

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const copyAllSections = async () => {
    await copyToClipboard(message.content)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[70%] bg-[#3182ce] text-white rounded-lg px-4 py-3 shadow-sm">
          <p className="text-base">{message.content}</p>
        </div>
      </div>
    )
  }

  // Assistant message with structured response
  const hasNoPolicyData = message.content.toLowerCase().includes("don't have information") ||
                          message.content.toLowerCase().includes("no information")

  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[85%]">
        <Card className="shadow-md border-gray-200">
          <CardHeader className="pb-3 bg-[#f7fafc]">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#1a365d]">
                  {message.policyName || 'Policy Response'}
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={copyAllSections}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
                title="Copy entire response"
              >
                {copiedAll ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <Copy className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {hasNoPolicyData ? (
              <div className="bg-[#fffbeb] border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    No Policy Information Available
                  </p>
                  <p className="text-sm text-yellow-800">
                    {message.content}
                  </p>
                  <p className="text-sm text-yellow-800 mt-2">
                    Please upload policy documents using the admin panel (settings icon) to enable policy queries.
                  </p>
                </div>
              </div>
            ) : message.parsedSections && message.parsedSections.length > 0 ? (
              message.parsedSections.map((section, index) => (
                <SectionCard
                  key={index}
                  section={section}
                  isExpanded={expandedSections.has(index)}
                  onToggle={() => toggleSection(index)}
                  onCopy={() => {}}
                />
              ))
            ) : (
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Home() {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [showAdminPanel, setShowAdminPanel] = React.useState(false)
  const [showSidebar, setShowSidebar] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const chatContainerRef = React.useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const result = await callAIAgent(text, AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const response = result.response as unknown as PolicySathiResponse
        const parsedSections = parseResponse(
          response.result.formatted_response,
          response.result.sections_included
        )

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response.result.formatted_response,
          timestamp: response.metadata.timestamp || new Date().toISOString(),
          policyName: response.result.policy_name,
          sectionsIncluded: response.result.sections_included,
          parsedSections,
        }

        setMessages(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.error || 'Failed to get response from the policy assistant.',
          timestamp: new Date().toISOString(),
          policyName: 'Error',
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'An unexpected error occurred. Please try again.',
        timestamp: new Date().toISOString(),
        policyName: 'Error',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a365d] text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-[#2a4a7d] rounded transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Policy Sathi</h1>
              <p className="text-sm text-gray-300">Your Policy Guide</p>
            </div>
          </div>
          <button
            onClick={() => setShowAdminPanel(!showAdminPanel)}
            className="p-2 hover:bg-[#2a4a7d] rounded transition-colors"
            title="Admin Panel"
          >
            <Settings className={cn("h-6 w-6 transition-transform", showAdminPanel && "rotate-90")} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation History */}
        {showSidebar && (
          <aside className="w-64 bg-[#f7fafc] border-r border-gray-200 overflow-y-auto lg:block">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Conversation History</h2>
              {messages.filter(m => m.role === 'user').length === 0 ? (
                <p className="text-sm text-gray-500">No conversations yet</p>
              ) : (
                <div className="space-y-2">
                  {messages
                    .filter(m => m.role === 'user')
                    .reverse()
                    .slice(0, 10)
                    .map(msg => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          const msgElement = document.getElementById(`msg-${msg.id}`)
                          msgElement?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors text-sm text-gray-700 truncate"
                      >
                        {msg.content}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Chat Area */}
        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Admin Panel */}
          {showAdminPanel && (
            <div className="bg-[#f7fafc] border-b border-gray-200 p-6">
              <h2 className="text-xl font-bold text-[#1a365d] mb-4">Admin Panel - Document Management</h2>
              <KnowledgeBaseUpload
                ragId={RAG_ID}
                onUploadSuccess={(doc) => {
                  console.log('Document uploaded successfully:', doc)
                }}
                onDeleteSuccess={(fileName) => {
                  console.log('Document deleted:', fileName)
                }}
              />
            </div>
          )}

          {/* Messages Container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="bg-[#f7fafc] rounded-full p-6 mb-4">
                  <BookOpen className="h-12 w-12 text-[#1a365d]" />
                </div>
                <h2 className="text-2xl font-bold text-[#1a365d] mb-2">
                  Welcome to Policy Sathi
                </h2>
                <p className="text-gray-600 mb-6 max-w-md">
                  Ask me anything about government policies, schemes, and benefits. I'm here to help you understand policy information.
                </p>
                <div className="bg-[#fffbeb] border border-yellow-200 rounded-lg p-4 max-w-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> For the best results, upload policy documents using the admin panel (settings icon) above.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <div key={message.id} id={`msg-${message.id}`}>
                    <MessageBubble message={message} />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-[#f7fafc] rounded-lg px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#1a365d]" />
                      <span className="text-sm text-gray-600">Processing your query...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Suggestions */}
          {messages.length === 0 && (
            <div className="px-4 pb-2">
              <p className="text-sm text-gray-600 mb-2">Quick suggestions:</p>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex-shrink-0 px-4 py-2 bg-[#f7fafc] hover:bg-gray-200 text-gray-700 text-sm rounded-full border border-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-3xl mx-auto flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about any policy..."
                disabled={isLoading}
                className="flex-1 h-12 text-base"
              />
              <Button
                onClick={() => sendMessage(inputValue)}
                disabled={isLoading || !inputValue.trim()}
                className="h-12 px-6 bg-[#3182ce] hover:bg-[#2c5aa0]"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
