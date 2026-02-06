'use client'

/**
 * AI Travel Companion - Multi-Agent Travel Assistant
 *
 * Route & Transport Planner Agent ID: 6985aa8af513a931daeaad1c
 * Local Services & Safety Agent ID: 6985aaa37551cb7920ffe9f5
 * Itinerary & Expense Tracker Agent ID: 6985aabc301c62c7ca2c7e48
 * Trip Manager Agent ID: 6985ae9af513a931daeaad84
 * Expense Tracker Agent ID: 6985aeae4e2223b52121c423
 * Settlement Calculator Agent ID: 6985aec5f513a931daeaad89
 * Trip Summary Agent ID: 6985aedd4e2223b52121c427
 * Model: gpt-4o (OpenAI)
 */

import * as React from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Copy, Check, ChevronDown, ChevronUp, AlertCircle, MapPin, DollarSign, Calendar, Clock, Navigation, Shield, Phone, Utensils, Hospital, Building, Zap, TrendingDown, Users, Wallet, Calculator, FileText, Plus, Minus, ArrowRight, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Agent IDs
const ROUTE_PLANNER_AGENT_ID = '6985aa8af513a931daeaad1c'
const LOCAL_SERVICES_AGENT_ID = '6985aaa37551cb7920ffe9f5'
const ITINERARY_AGENT_ID = '6985aabc301c62c7ca2c7e48'
const TRIP_MANAGER_AGENT_ID = '6985ae9af513a931daeaad84'
const EXPENSE_TRACKER_AGENT_ID = '6985aeae4e2223b52121c423'
const SETTLEMENT_CALCULATOR_AGENT_ID = '6985aec5f513a931daeaad89'
const TRIP_SUMMARY_AGENT_ID = '6985aedd4e2223b52121c427'

// TypeScript interfaces from actual agent responses
interface RoutePlannerResponse {
  status: 'success' | 'error'
  result: {
    fastest_route: {
      details: string
      time: string
      cost: string
    }
    cheapest_route: {
      details: string
      time: string
      cost: string
    }
    most_convenient_route: {
      details: string
      time: string
      cost: string
    }
    alternatives: string
    travel_tips: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface LocalServicesResponse {
  status: 'success' | 'error'
  result: {
    nearby_services: {
      restaurants: string[]
      medical: string[]
      essential_services: string[]
    }
    safety_alerts: string
    emergency_contacts: string
    safety_tips: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface ItineraryResponse {
  status: 'success' | 'error'
  result: {
    daily_itinerary: string[]
    expense_summary: {
      total_budget: string
      spent_so_far: string
      remaining: string
      breakdown: {
        transport: string
        accommodation: string
        food: string
        activities: string
      }
    }
    upcoming_reminders: string[]
    schedule_conflicts: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

// Group Expenses Interfaces (from test responses)
interface TripManagerResponse {
  status: 'success' | 'error'
  result: {
    trip_name: string
    destination: string
    start_date: string
    end_date: string
    participants: string[]
    trip_status: 'active' | 'completed'
    actions_available: string[]
    message: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface ExpenseTrackerResponse {
  status: 'success' | 'error'
  result: {
    paid_by: string
    amount: number
    currency: string
    category: string
    description: string
    date: string
    split_among: string[]
    per_person_share: number
    running_total: number
    message: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface SettlementCalculatorResponse {
  status: 'success' | 'error'
  result: {
    individual_balances: Array<{
      person: string
      paid: number
      owes: number
      balance: number
    }>
    settlement_plan: Array<{
      from: string
      to: string
      amount: number
    }>
    summary: {
      people_owe: number
      people_owed: number
      transactions_needed: number
      total_expenses: number
    }
    message?: string
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

interface TripSummaryResponse {
  status: 'success' | 'error'
  result: {
    overall_statistics: {
      total_spent: number
      number_of_expenses: number
      trip_duration_days: number
      average_per_person: number
    }
    category_breakdown: Array<{
      category: string
      amount: number
      percentage: number
    }>
    per_person_analysis: Array<{
      person: string
      paid: number
      share: number
      net: number
    }>
    top_expenses?: Array<{
      description: string
      amount: number
      paid_by: string
    }>
    settlement_instructions: Array<{
      from: string
      to: string
      amount: number
    }>
    insights?: {
      biggest_spender: string
      most_expensive_category: string
      message?: string
    }
  }
  metadata: {
    agent_name: string
    timestamp: string
  }
}

// Local expense data structure
interface ExpenseItem {
  id: string
  description: string
  amount: number
  paidBy: string
  category: string
  date: string
  splitAmong: string[]
}

// Tab types
type TabType = 'route' | 'services' | 'itinerary' | 'expenses'

// Route card component
function RouteCard({
  title,
  details,
  time,
  cost,
  accentColor,
  icon
}: {
  title: string
  details: string
  time: string
  cost: string
  accentColor: string
  icon: React.ReactNode
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    const content = `${title}\n${details}\nTime: ${time}\nCost: ${cost}`
    await copyToClipboard(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className={cn("border-l-4", accentColor)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            title="Copy route details"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{details}</p>
        <div className="flex gap-4 pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">{cost}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Collapsible section component
function CollapsibleSection({ title, content, icon }: { title: string; content: string; icon: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      {isExpanded && (
        <div className="px-4 pb-4 bg-white">
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<TabType>('route')
  const [isLoading, setIsLoading] = React.useState(false)

  // Route Planner State
  const [routeForm, setRouteForm] = React.useState({
    from: '',
    to: '',
    date: '',
    transport: 'any',
    preference: 'balanced'
  })
  const [routeResponse, setRouteResponse] = React.useState<RoutePlannerResponse | null>(null)

  // Local Services State
  const [servicesForm, setServicesForm] = React.useState({
    location: '',
    services: {
      restaurants: true,
      medical: true,
      atms: true,
      police: true,
      pharmacy: true
    }
  })
  const [servicesResponse, setServicesResponse] = React.useState<LocalServicesResponse | null>(null)

  // Itinerary State
  const [itineraryForm, setItineraryForm] = React.useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    activities: ''
  })
  const [itineraryResponse, setItineraryResponse] = React.useState<ItineraryResponse | null>(null)

  // Group Expenses State
  const [tripForm, setTripForm] = React.useState({
    tripName: '',
    destination: '',
    startDate: '',
    endDate: '',
    participants: ['']
  })
  const [tripData, setTripData] = React.useState<TripManagerResponse | null>(null)

  const [expenseForm, setExpenseForm] = React.useState({
    description: '',
    amount: '',
    paidBy: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    splitAmong: [] as string[]
  })
  const [expenses, setExpenses] = React.useState<ExpenseItem[]>([])
  const [expenseResponse, setExpenseResponse] = React.useState<ExpenseTrackerResponse | null>(null)

  const [settlementData, setSettlementData] = React.useState<SettlementCalculatorResponse | null>(null)
  const [summaryData, setSummaryData] = React.useState<TripSummaryResponse | null>(null)

  // Route Planner Handler
  const handleRoutePlanning = async () => {
    if (!routeForm.from || !routeForm.to) {
      alert('Please enter both origin and destination')
      return
    }

    setIsLoading(true)
    setRouteResponse(null)

    try {
      const message = `I need to travel from ${routeForm.from} to ${routeForm.to}${routeForm.date ? ` on ${routeForm.date}` : ''}. Show me the fastest, cheapest, and most convenient options${routeForm.transport !== 'any' ? ` by ${routeForm.transport}` : ''}.`

      const result = await callAIAgent(message, ROUTE_PLANNER_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setRouteResponse(result.response as unknown as RoutePlannerResponse)
      } else {
        alert(result.error || 'Failed to get route information')
      }
    } catch (error) {
      alert('An error occurred while planning your route')
    } finally {
      setIsLoading(false)
    }
  }

  // Local Services Handler
  const handleServicesSearch = async () => {
    if (!servicesForm.location) {
      alert('Please enter your current location')
      return
    }

    setIsLoading(true)
    setServicesResponse(null)

    try {
      const selectedServices = Object.entries(servicesForm.services)
        .filter(([_, checked]) => checked)
        .map(([service, _]) => service)
        .join(', ')

      const message = `I'm currently in ${servicesForm.location}. What are the nearest ${selectedServices}? Any safety concerns I should know about?`

      const result = await callAIAgent(message, LOCAL_SERVICES_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setServicesResponse(result.response as unknown as LocalServicesResponse)
      } else {
        alert(result.error || 'Failed to get local services information')
      }
    } catch (error) {
      alert('An error occurred while searching for services')
    } finally {
      setIsLoading(false)
    }
  }

  // Itinerary Handler
  const handleItineraryGeneration = async () => {
    if (!itineraryForm.destination || !itineraryForm.activities) {
      alert('Please enter destination and activities')
      return
    }

    setIsLoading(true)
    setItineraryResponse(null)

    try {
      const message = `Help me organize my trip to ${itineraryForm.destination}${itineraryForm.startDate ? ` from ${itineraryForm.startDate}` : ''}${itineraryForm.endDate ? ` to ${itineraryForm.endDate}` : ''}. ${itineraryForm.activities}${itineraryForm.budget ? ` Budget is $${itineraryForm.budget}.` : ''}`

      const result = await callAIAgent(message, ITINERARY_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setItineraryResponse(result.response as unknown as ItineraryResponse)
      } else {
        alert(result.error || 'Failed to generate itinerary')
      }
    } catch (error) {
      alert('An error occurred while generating your itinerary')
    } finally {
      setIsLoading(false)
    }
  }

  // Group Expenses Handlers
  const handleCreateTrip = async () => {
    if (!tripForm.tripName || !tripForm.destination || !tripForm.startDate || !tripForm.endDate) {
      alert('Please fill in all trip details')
      return
    }

    const validParticipants = tripForm.participants.filter(p => p.trim() !== '')
    if (validParticipants.length === 0) {
      alert('Please add at least one participant')
      return
    }

    setIsLoading(true)

    try {
      const participantsList = validParticipants.join(', ')
      const message = `Create a new trip to ${tripForm.destination} from ${tripForm.startDate} to ${tripForm.endDate}. Trip name: ${tripForm.tripName}. Participants are ${participantsList}.`

      const result = await callAIAgent(message, TRIP_MANAGER_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setTripData(result.response as unknown as TripManagerResponse)
      } else {
        alert(result.error || 'Failed to create trip')
      }
    } catch (error) {
      alert('An error occurred while creating the trip')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddExpense = async () => {
    if (!expenseForm.description || !expenseForm.amount || !expenseForm.paidBy || expenseForm.splitAmong.length === 0) {
      alert('Please fill in all expense details and select who to split among')
      return
    }

    setIsLoading(true)

    try {
      const splitList = expenseForm.splitAmong.join(', ')
      const message = `${expenseForm.paidBy} paid ₹${expenseForm.amount} for ${expenseForm.description} on ${expenseForm.date}. Split equally among ${splitList}. Category: ${expenseForm.category}.`

      const result = await callAIAgent(message, EXPENSE_TRACKER_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        const response = result.response as unknown as ExpenseTrackerResponse
        setExpenseResponse(response)

        // Add to local expenses list
        const newExpense: ExpenseItem = {
          id: Date.now().toString(),
          description: expenseForm.description,
          amount: parseFloat(expenseForm.amount),
          paidBy: expenseForm.paidBy,
          category: expenseForm.category,
          date: expenseForm.date,
          splitAmong: expenseForm.splitAmong
        }
        setExpenses(prev => [...prev, newExpense])

        // Reset form
        setExpenseForm({
          description: '',
          amount: '',
          paidBy: '',
          category: 'Food',
          date: new Date().toISOString().split('T')[0],
          splitAmong: []
        })
      } else {
        alert(result.error || 'Failed to add expense')
      }
    } catch (error) {
      alert('An error occurred while adding the expense')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateSettlement = async () => {
    if (expenses.length === 0) {
      alert('Please add some expenses first')
      return
    }

    if (!tripData || tripData.result.participants.length === 0) {
      alert('Please create a trip first')
      return
    }

    setIsLoading(true)

    try {
      // Calculate totals per person
      const personTotals: { [key: string]: number } = {}
      tripData.result.participants.forEach(p => {
        personTotals[p] = 0
      })

      expenses.forEach(expense => {
        personTotals[expense.paidBy] = (personTotals[expense.paidBy] || 0) + expense.amount
      })

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
      const participantList = Object.entries(personTotals)
        .map(([person, paid]) => `${person} paid ₹${paid}`)
        .join(', ')

      const message = `Calculate settlements for our trip. ${participantList}. Total expenses ₹${totalExpenses}. Equal split among ${tripData.result.participants.length} people.`

      const result = await callAIAgent(message, SETTLEMENT_CALCULATOR_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setSettlementData(result.response as unknown as SettlementCalculatorResponse)
      } else {
        alert(result.error || 'Failed to calculate settlement')
      }
    } catch (error) {
      alert('An error occurred while calculating settlement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    if (expenses.length === 0 || !tripData) {
      alert('Please create a trip and add expenses first')
      return
    }

    setIsLoading(true)

    try {
      const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)
      const categoryTotals: { [key: string]: number } = {}

      expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
      })

      const categoryBreakdown = Object.entries(categoryTotals)
        .map(([cat, amount]) => `${cat}: ₹${amount}`)
        .join(', ')

      const personTotals: { [key: string]: number } = {}
      tripData.result.participants.forEach(p => {
        personTotals[p] = 0
      })
      expenses.forEach(expense => {
        personTotals[expense.paidBy] = (personTotals[expense.paidBy] || 0) + expense.amount
      })

      const personBreakdown = Object.entries(personTotals)
        .map(([person, paid]) => `${person} paid ₹${paid}`)
        .join(', ')

      const startDate = new Date(tripData.result.start_date)
      const endDate = new Date(tripData.result.end_date)
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

      const message = `Generate summary for ${tripData.result.trip_name} trip to ${tripData.result.destination} from ${tripData.result.start_date} to ${tripData.result.end_date}. Total spent ₹${totalSpent}. ${categoryBreakdown}. ${personBreakdown}.`

      const result = await callAIAgent(message, TRIP_SUMMARY_AGENT_ID)

      if (result.success && result.response.status === 'success') {
        setSummaryData(result.response as unknown as TripSummaryResponse)
      } else {
        alert(result.error || 'Failed to generate summary')
      }
    } catch (error) {
      alert('An error occurred while generating summary')
    } finally {
      setIsLoading(false)
    }
  }

  const addParticipant = () => {
    setTripForm(prev => ({
      ...prev,
      participants: [...prev.participants, '']
    }))
  }

  const removeParticipant = (index: number) => {
    setTripForm(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }))
  }

  const updateParticipant = (index: number, value: string) => {
    setTripForm(prev => ({
      ...prev,
      participants: prev.participants.map((p, i) => i === index ? value : p)
    }))
  }

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  // Parse expense values
  const parseExpense = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0
  }

  const calculateRunningTotal = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0066CC] to-[#0052A3] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Navigation className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">AI Travel Companion</h1>
              <p className="text-blue-100 text-sm">Your Smart Travel Assistant</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('route')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                activeTab === 'route'
                  ? "text-[#0066CC] border-[#0066CC] bg-blue-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <MapPin className="h-5 w-5" />
              Route Planner
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                activeTab === 'services'
                  ? "text-[#4CAF50] border-[#4CAF50] bg-green-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Shield className="h-5 w-5" />
              Local Services
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                activeTab === 'itinerary'
                  ? "text-[#FF6B35] border-[#FF6B35] bg-orange-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Calendar className="h-5 w-5" />
              Itinerary
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap",
                activeTab === 'expenses'
                  ? "text-[#9333EA] border-[#9333EA] bg-purple-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Wallet className="h-5 w-5" />
              Group Expenses
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        {/* Route Planner Tab */}
        {activeTab === 'route' && (
          <div className="space-y-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#0066CC]" />
                  Plan Your Route
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <Input
                      value={routeForm.from}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, from: e.target.value }))}
                      placeholder="e.g., New York"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <Input
                      value={routeForm.to}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="e.g., Boston"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travel Date</label>
                    <Input
                      type="date"
                      value={routeForm.date}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transport Preference</label>
                    <select
                      value={routeForm.transport}
                      onChange={(e) => setRouteForm(prev => ({ ...prev, transport: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                    >
                      <option value="any">Any</option>
                      <option value="bus">Bus</option>
                      <option value="train">Train</option>
                      <option value="cab">Cab</option>
                      <option value="flight">Flight</option>
                    </select>
                  </div>
                </div>
                <Button
                  onClick={handleRoutePlanning}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-[#0066CC] hover:bg-[#0052A3]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Planning Route...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Plan Route
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {routeResponse && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Your Route Options</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <RouteCard
                    title="Fastest Route"
                    details={routeResponse.result.fastest_route.details}
                    time={routeResponse.result.fastest_route.time}
                    cost={routeResponse.result.fastest_route.cost}
                    accentColor="border-l-[#0066CC]"
                    icon={<Zap className="h-5 w-5 text-[#0066CC]" />}
                  />
                  <RouteCard
                    title="Cheapest Route"
                    details={routeResponse.result.cheapest_route.details}
                    time={routeResponse.result.cheapest_route.time}
                    cost={routeResponse.result.cheapest_route.cost}
                    accentColor="border-l-[#4CAF50]"
                    icon={<TrendingDown className="h-5 w-5 text-[#4CAF50]" />}
                  />
                  <RouteCard
                    title="Most Convenient"
                    details={routeResponse.result.most_convenient_route.details}
                    time={routeResponse.result.most_convenient_route.time}
                    cost={routeResponse.result.most_convenient_route.cost}
                    accentColor="border-l-[#FF6B35]"
                    icon={<Users className="h-5 w-5 text-[#FF6B35]" />}
                  />
                </div>

                <div className="space-y-3">
                  <CollapsibleSection
                    title="Alternative Options"
                    content={routeResponse.result.alternatives}
                    icon={<Navigation className="h-5 w-5 text-gray-600" />}
                  />
                  <CollapsibleSection
                    title="Travel Tips"
                    content={routeResponse.result.travel_tips}
                    icon={<AlertCircle className="h-5 w-5 text-[#FF6B35]" />}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Local Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#4CAF50]" />
                  Find Local Services & Safety Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                  <Input
                    value={servicesForm.location}
                    onChange={(e) => setServicesForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., downtown Paris"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services to Find</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {Object.entries(servicesForm.services).map(([service, checked]) => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => setServicesForm(prev => ({
                            ...prev,
                            services: { ...prev.services, [service]: e.target.checked }
                          }))}
                          className="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-[#4CAF50]"
                        />
                        <span className="text-sm text-gray-700 capitalize">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleServicesSearch}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-[#4CAF50] hover:bg-[#3d8b40]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Find Services
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {servicesResponse && (
              <div className="space-y-4">
                {/* Safety Alert */}
                {servicesResponse.result.safety_alerts && (
                  <Card className="border-l-4 border-l-yellow-500 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-lg text-yellow-900">Safety Alerts</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-yellow-800">{servicesResponse.result.safety_alerts}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Emergency Contacts */}
                <Card className="border-l-4 border-l-red-500 bg-red-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-red-600" />
                      <CardTitle className="text-lg text-red-900">Emergency Contacts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-800 font-medium">{servicesResponse.result.emergency_contacts}</p>
                  </CardContent>
                </Card>

                {/* Nearby Restaurants */}
                {servicesResponse.result.nearby_services.restaurants.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-[#FF6B35]" />
                        <CardTitle className="text-lg">Nearby Restaurants</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {servicesResponse.result.nearby_services.restaurants.map((restaurant, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{restaurant}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Medical Services */}
                {servicesResponse.result.nearby_services.medical.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Hospital className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-lg">Medical Services</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {servicesResponse.result.nearby_services.medical.map((medical, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{medical}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Essential Services */}
                {servicesResponse.result.nearby_services.essential_services.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-5 w-5 text-[#0066CC]" />
                        <CardTitle className="text-lg">Essential Services</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {servicesResponse.result.nearby_services.essential_services.map((service, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{service}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Safety Tips */}
                {servicesResponse.result.safety_tips && (
                  <Card className="border-l-4 border-l-[#4CAF50]">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#4CAF50]" />
                        <CardTitle className="text-lg">Safety Tips</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{servicesResponse.result.safety_tips}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-6">
            {/* Input Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#FF6B35]" />
                  Create Your Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <Input
                      value={itineraryForm.destination}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="e.g., Tokyo"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
                    <Input
                      type="number"
                      value={itineraryForm.budget}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="e.g., 800"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={itineraryForm.startDate}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={itineraryForm.endDate}
                      onChange={(e) => setItineraryForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Activities</label>
                  <textarea
                    value={itineraryForm.activities}
                    onChange={(e) => setItineraryForm(prev => ({ ...prev, activities: e.target.value }))}
                    placeholder="Describe your planned activities day by day, e.g., Day 1: arrival at 2pm, hotel check-in. Day 2: visit temple, lunch in downtown..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                  />
                </div>
                <Button
                  onClick={handleItineraryGeneration}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-[#FF6B35] hover:bg-[#e55a2b]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Generate Itinerary
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {itineraryResponse && (
              <div className="space-y-4">
                {/* Expense Dashboard */}
                <Card className="border-l-4 border-l-[#FF6B35]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[#FF6B35]" />
                      <CardTitle className="text-lg">Expense Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Budget</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {itineraryResponse.result.expense_summary.total_budget}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Spent So Far</p>
                        <p className="text-2xl font-bold text-red-600">
                          {itineraryResponse.result.expense_summary.spent_so_far}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Remaining</p>
                        <p className="text-2xl font-bold text-green-600">
                          {itineraryResponse.result.expense_summary.remaining}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Budget Usage</span>
                        <span>
                          {parseExpense(itineraryResponse.result.expense_summary.spent_so_far) > 0
                            ? Math.round((parseExpense(itineraryResponse.result.expense_summary.spent_so_far) /
                               parseExpense(itineraryResponse.result.expense_summary.total_budget)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#4CAF50] to-[#FF6B35] h-full transition-all"
                          style={{
                            width: `${parseExpense(itineraryResponse.result.expense_summary.spent_so_far) > 0
                              ? Math.min((parseExpense(itineraryResponse.result.expense_summary.spent_so_far) /
                                 parseExpense(itineraryResponse.result.expense_summary.total_budget)) * 100, 100)
                              : 0}%`
                          }}
                        />
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-3">Category Breakdown</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-[#0066CC]" />
                          <div>
                            <p className="text-xs text-gray-600">Transport</p>
                            <p className="text-sm font-semibold">{itineraryResponse.result.expense_summary.breakdown.transport}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Utensils className="h-4 w-4 text-[#FF6B35]" />
                          <div>
                            <p className="text-xs text-gray-600">Food</p>
                            <p className="text-sm font-semibold">{itineraryResponse.result.expense_summary.breakdown.food}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#4CAF50]" />
                          <div>
                            <p className="text-xs text-gray-600">Activities</p>
                            <p className="text-sm font-semibold">{itineraryResponse.result.expense_summary.breakdown.activities}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-purple-600" />
                          <div>
                            <p className="text-xs text-gray-600">Accommodation</p>
                            <p className="text-sm font-semibold">{itineraryResponse.result.expense_summary.breakdown.accommodation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Daily Itinerary */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-[#0066CC]" />
                      <CardTitle className="text-lg">Daily Schedule</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {itineraryResponse.result.daily_itinerary.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-1 bg-[#0066CC] rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Reminders */}
                {itineraryResponse.result.upcoming_reminders.length > 0 && (
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-blue-600" />
                        <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {itineraryResponse.result.upcoming_reminders.map((reminder, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{reminder}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Schedule Conflicts */}
                {itineraryResponse.result.schedule_conflicts && (
                  <Card className="border-l-4 border-l-red-500 bg-red-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-lg text-red-900">Schedule Conflicts</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-red-800">{itineraryResponse.result.schedule_conflicts}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* Group Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            {/* Section 1: Create/Manage Trip */}
            <Card className="border-l-4 border-l-[#9333EA]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#9333EA]">
                  <Users className="h-5 w-5" />
                  Step 1: Create/Manage Trip
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trip Name</label>
                    <Input
                      value={tripForm.tripName}
                      onChange={(e) => setTripForm(prev => ({ ...prev, tripName: e.target.value }))}
                      placeholder="e.g., Goa Adventure"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
                    <Input
                      value={tripForm.destination}
                      onChange={(e) => setTripForm(prev => ({ ...prev, destination: e.target.value }))}
                      placeholder="e.g., Goa"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <Input
                      type="date"
                      value={tripForm.startDate}
                      onChange={(e) => setTripForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <Input
                      type="date"
                      value={tripForm.endDate}
                      onChange={(e) => setTripForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                  <div className="space-y-2">
                    {tripForm.participants.map((participant, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={participant}
                          onChange={(e) => updateParticipant(index, e.target.value)}
                          placeholder={`Participant ${index + 1} name`}
                          className="flex-1"
                        />
                        {tripForm.participants.length > 1 && (
                          <button
                            onClick={() => removeParticipant(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove participant"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addParticipant}
                      className="flex items-center gap-2 text-sm text-[#9333EA] hover:text-[#7E22CE] font-medium"
                    >
                      <Plus className="h-4 w-4" />
                      Add Participant
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleCreateTrip}
                  disabled={isLoading}
                  className="w-full md:w-auto bg-[#9333EA] hover:bg-[#7E22CE]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Trip...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Create Trip
                    </>
                  )}
                </Button>

                {/* Current Trip Display */}
                {tripData && (
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[#9333EA]">Current Trip</h4>
                      <span className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        tripData.result.trip_status === 'active'
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      )}>
                        {tripData.result.trip_status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Trip:</span>
                        <span className="ml-2 font-medium">{tripData.result.trip_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Destination:</span>
                        <span className="ml-2 font-medium">{tripData.result.destination}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dates:</span>
                        <span className="ml-2 font-medium">{tripData.result.start_date} to {tripData.result.end_date}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Participants:</span>
                        <span className="ml-2 font-medium">{tripData.result.participants.length} people</span>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Participants: {tripData.result.participants.join(', ')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 2: Log Expenses */}
            <Card className="border-l-4 border-l-[#A855F7]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#9333EA]">
                  <Wallet className="h-5 w-5" />
                  Step 2: Log Expenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="e.g., Dinner at restaurant"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                    <Input
                      type="number"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="e.g., 2400"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Paid By</label>
                    <select
                      value={expenseForm.paidBy}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, paidBy: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                    >
                      <option value="">Select person</option>
                      {tripData?.result.participants.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={expenseForm.category}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#9333EA]"
                    >
                      <option value="Food">Food</option>
                      <option value="Transport">Transport</option>
                      <option value="Accommodation">Accommodation</option>
                      <option value="Activities">Activities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input
                      type="date"
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Split Among</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {tripData?.result.participants.map(participant => (
                      <label key={participant} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={expenseForm.splitAmong.includes(participant)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExpenseForm(prev => ({
                                ...prev,
                                splitAmong: [...prev.splitAmong, participant]
                              }))
                            } else {
                              setExpenseForm(prev => ({
                                ...prev,
                                splitAmong: prev.splitAmong.filter(p => p !== participant)
                              }))
                            }
                          }}
                          className="w-4 h-4 text-[#9333EA] border-gray-300 rounded focus:ring-[#9333EA]"
                        />
                        <span className="text-sm text-gray-700">{participant}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleAddExpense}
                  disabled={isLoading || !tripData}
                  className="w-full md:w-auto bg-[#9333EA] hover:bg-[#7E22CE]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </>
                  )}
                </Button>

                {/* Expense List */}
                {expenses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Expense List</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Date</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Description</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Paid By</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-700">Amount</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Category</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-700">Split Among</th>
                            <th className="px-4 py-2 text-center font-medium text-gray-700">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((expense) => (
                            <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-700">{expense.date}</td>
                              <td className="px-4 py-2 text-gray-700">{expense.description}</td>
                              <td className="px-4 py-2 text-gray-700">{expense.paidBy}</td>
                              <td className="px-4 py-2 text-right font-medium text-gray-900">₹{expense.amount}</td>
                              <td className="px-4 py-2 text-gray-700">{expense.category}</td>
                              <td className="px-4 py-2 text-gray-700 text-xs">{expense.splitAmong.join(', ')}</td>
                              <td className="px-4 py-2 text-center">
                                <button
                                  onClick={() => removeExpense(expense.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  title="Delete expense"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-purple-50 border-t-2 border-[#9333EA]">
                          <tr>
                            <td colSpan={3} className="px-4 py-2 font-semibold text-gray-900">Running Total</td>
                            <td className="px-4 py-2 text-right font-bold text-[#9333EA]">₹{calculateRunningTotal()}</td>
                            <td colSpan={3}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 3: Calculate Settlement */}
            <Card className="border-l-4 border-l-[#7E22CE]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#9333EA]">
                  <Calculator className="h-5 w-5" />
                  Step 3: Calculate Settlement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleCalculateSettlement}
                  disabled={isLoading || expenses.length === 0}
                  className="w-full md:w-auto bg-[#9333EA] hover:bg-[#7E22CE]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calculate Balances
                    </>
                  )}
                </Button>

                {settlementData && (
                  <div className="space-y-4">
                    {/* Individual Balances */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Individual Balances</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {settlementData.result.individual_balances.map((balance) => (
                          <div
                            key={balance.person}
                            className={cn(
                              "p-4 rounded-lg border-2",
                              balance.balance > 0
                                ? "bg-green-50 border-green-200"
                                : balance.balance < 0
                                  ? "bg-red-50 border-red-200"
                                  : "bg-gray-50 border-gray-200"
                            )}
                          >
                            <div className="font-semibold text-gray-900 mb-2">{balance.person}</div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>Paid: ₹{balance.paid}</div>
                              <div>Share: ₹{balance.owes}</div>
                              <div className={cn(
                                "font-bold text-sm pt-1 border-t",
                                balance.balance > 0
                                  ? "text-green-700 border-green-200"
                                  : balance.balance < 0
                                    ? "text-red-700 border-red-200"
                                    : "text-gray-700 border-gray-200"
                              )}>
                                Net: {balance.balance > 0 ? '+' : ''}₹{balance.balance}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Settlement Plan */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Settlement Plan</h4>
                      <div className="space-y-2">
                        {settlementData.result.settlement_plan.map((transaction, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex-1 flex items-center gap-2">
                              <span className="font-medium text-gray-900">{transaction.from}</span>
                              <ArrowRight className="h-4 w-4 text-[#9333EA]" />
                              <span className="font-medium text-gray-900">{transaction.to}</span>
                            </div>
                            <div className="font-bold text-[#9333EA]">₹{transaction.amount}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">People Owe</div>
                        <div className="text-xl font-bold text-red-600">{settlementData.result.summary.people_owe}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">People Owed</div>
                        <div className="text-xl font-bold text-green-600">{settlementData.result.summary.people_owed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Transactions</div>
                        <div className="text-xl font-bold text-[#9333EA]">{settlementData.result.summary.transactions_needed}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Total Expenses</div>
                        <div className="text-xl font-bold text-gray-900">₹{settlementData.result.summary.total_expenses}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section 4: Generate Summary Report */}
            <Card className="border-l-4 border-l-[#6B21A8]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#9333EA]">
                  <FileText className="h-5 w-5" />
                  Step 4: Generate Summary Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isLoading || expenses.length === 0 || !tripData}
                  className="w-full md:w-auto bg-[#9333EA] hover:bg-[#7E22CE]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Trip Summary
                    </>
                  )}
                </Button>

                {summaryData && (
                  <div className="space-y-4">
                    {/* Overall Statistics */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Overall Statistics</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Total Spent</div>
                          <div className="text-2xl font-bold text-[#9333EA]">₹{summaryData.result.overall_statistics.total_spent}</div>
                        </div>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Number of Expenses</div>
                          <div className="text-2xl font-bold text-blue-700">{summaryData.result.overall_statistics.number_of_expenses}</div>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Trip Duration</div>
                          <div className="text-2xl font-bold text-green-700">{summaryData.result.overall_statistics.trip_duration_days} days</div>
                        </div>
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">Average Per Person</div>
                          <div className="text-2xl font-bold text-orange-700">₹{summaryData.result.overall_statistics.average_per_person}</div>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Category Breakdown</h4>
                      <div className="space-y-2">
                        {summaryData.result.category_breakdown.map((category) => (
                          <div key={category.category} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">{category.category}</span>
                              <span className="text-gray-900">₹{category.amount} ({category.percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-[#9333EA] h-full transition-all"
                                style={{ width: `${category.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Per Person Analysis */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Per Person Analysis</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-700">Person</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">Paid</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">Share</th>
                              <th className="px-4 py-2 text-right font-medium text-gray-700">Net Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summaryData.result.per_person_analysis.map((person) => (
                              <tr key={person.person} className="border-b border-gray-100">
                                <td className="px-4 py-2 font-medium text-gray-900">{person.person}</td>
                                <td className="px-4 py-2 text-right text-gray-700">₹{person.paid}</td>
                                <td className="px-4 py-2 text-right text-gray-700">₹{person.share}</td>
                                <td className={cn(
                                  "px-4 py-2 text-right font-semibold",
                                  person.net > 0 ? "text-green-600" : person.net < 0 ? "text-red-600" : "text-gray-700"
                                )}>
                                  {person.net > 0 ? '+' : ''}₹{person.net}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Top Expenses */}
                    {summaryData.result.top_expenses && summaryData.result.top_expenses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Top Expenses</h4>
                        <div className="space-y-2">
                          {summaryData.result.top_expenses.slice(0, 5).map((expense, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="text-sm font-medium text-gray-900">{expense.description}</span>
                                <span className="text-xs text-gray-600 ml-2">by {expense.paid_by}</span>
                              </div>
                              <span className="font-semibold text-[#9333EA]">₹{expense.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Settlement Instructions */}
                    {summaryData.result.settlement_instructions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Settlement Instructions</h4>
                        <div className="space-y-2">
                          {summaryData.result.settlement_instructions.map((instruction, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              <div className="flex-1 flex items-center gap-2">
                                <span className="font-medium text-gray-900">{instruction.from}</span>
                                <ArrowRight className="h-4 w-4 text-[#9333EA]" />
                                <span className="font-medium text-gray-900">{instruction.to}</span>
                              </div>
                              <div className="font-bold text-[#9333EA]">₹{instruction.amount}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Insights */}
                    {summaryData.result.insights && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          Insights
                        </h4>
                        <div className="text-sm text-yellow-800 space-y-1">
                          <div>Biggest Spender: <span className="font-semibold">{summaryData.result.insights.biggest_spender}</span></div>
                          <div>Most Expensive Category: <span className="font-semibold">{summaryData.result.insights.most_expensive_category}</span></div>
                          {summaryData.result.insights.message && (
                            <div className="mt-2 pt-2 border-t border-yellow-300">{summaryData.result.insights.message}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        AI Travel Companion - Powered by GPT-4o
      </footer>
    </div>
  )
}
