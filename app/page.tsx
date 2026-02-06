'use client'

/**
 * AI Travel Companion - Multi-Agent Travel Assistant
 *
 * Route & Transport Planner Agent ID: 6985aa8af513a931daeaad1c
 * Local Services & Safety Agent ID: 6985aaa37551cb7920ffe9f5
 * Itinerary & Expense Tracker Agent ID: 6985aabc301c62c7ca2c7e48
 * Model: gpt-4o (OpenAI)
 */

import * as React from 'react'
import { callAIAgent } from '@/lib/aiAgent'
import { copyToClipboard } from '@/lib/clipboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Loader2, Send, Copy, Check, ChevronDown, ChevronUp, AlertCircle, MapPin, DollarSign, Calendar, Clock, Navigation, Shield, Phone, Utensils, Hospital, Building, Zap, TrendingDown, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// Agent IDs
const ROUTE_PLANNER_AGENT_ID = '6985aa8af513a931daeaad1c'
const LOCAL_SERVICES_AGENT_ID = '6985aaa37551cb7920ffe9f5'
const ITINERARY_AGENT_ID = '6985aabc301c62c7ca2c7e48'

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

// Tab types
type TabType = 'route' | 'services' | 'itinerary'

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

  // Parse expense values
  const parseExpense = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0
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
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('route')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2",
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
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2",
                activeTab === 'services'
                  ? "text-[#4CAF50] border-[#4CAF50] bg-green-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Shield className="h-5 w-5" />
              Local Services & Safety
            </button>
            <button
              onClick={() => setActiveTab('itinerary')}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2",
                activeTab === 'itinerary'
                  ? "text-[#FF6B35] border-[#FF6B35] bg-orange-50"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Calendar className="h-5 w-5" />
              Itinerary & Expenses
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        AI Travel Companion - Powered by GPT-4o
      </footer>
    </div>
  )
}
