import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_TOOLBOX_TOPICS,
  MOCK_DAILY_CHECKLIST_ITEMS,
  MOCK_JHA_TEMPLATES,
  TRADES_LIST,
} from "@/data/safetyMockData"
import {
  ClipboardCheck,
  MessageSquareCheck,
  ShieldAlert,
  Search,
  Plus,
  Clock,
  Sparkles,
} from "lucide-react"

export function SafetyConfigView() {
  const [activeTab, setActiveTab] = React.useState<"checklists" | "toolbox" | "jha">("checklists")
  const [selectedTrade, setSelectedTrade] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  const filteredToolbox = React.useMemo(() => {
    return MOCK_TOOLBOX_TOPICS.filter((t) => {
      const matchesTrade = selectedTrade === "all" || t.trade === selectedTrade
      const matchesSearch =
        t.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.titleEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.trade.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTrade && matchesSearch
    })
  }, [selectedTrade, searchQuery])

  const filteredChecklists = React.useMemo(() => {
    return MOCK_DAILY_CHECKLIST_ITEMS.filter((item) => {
      const matchesSearch =
        item.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.labelEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery])

  const filteredJha = React.useMemo(() => {
    return MOCK_JHA_TEMPLATES.filter((j) => {
      const matchesTrade = selectedTrade === "all" || j.trade === selectedTrade
      const matchesSearch =
        j.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.trade.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesTrade && matchesSearch
    })
  }, [selectedTrade, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="size-6 text-primary" />
            Safety Content & Checklists Configurator
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Section 7 Requirement: Maintain Toolbox Talk topics, Daily Safety Checklists and JHA suggestions by trade & customer company.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs font-semibold gap-1.5 shadow-sm">
            <Plus className="size-3.5" />
            {activeTab === "checklists" ? "Add Safety Item" : activeTab === "toolbox" ? "Add Toolbox Topic" : "Add JHA Template"}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("checklists")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "checklists"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardCheck className="size-4" />
          Daily Safety Checklists ({MOCK_DAILY_CHECKLIST_ITEMS.length})
        </button>

        <button
          onClick={() => setActiveTab("toolbox")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "toolbox"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquareCheck className="size-4" />
          Toolbox Topics Library ({MOCK_TOOLBOX_TOPICS.length})
        </button>

        <button
          onClick={() => setActiveTab("jha")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
            activeTab === "jha"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="size-4" />
          JHA Pre-Task Templates ({MOCK_JHA_TEMPLATES.length})
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search checklists, topics, discussion points..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {activeTab !== "checklists" && (
          <select
            value={selectedTrade}
            onChange={(e) => setSelectedTrade(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Construction Trades</option>
            {TRADES_LIST.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === "checklists" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChecklists.map((item) => (
            <Card key={item.id} className="bg-card hover:border-primary/40 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    {item.category.replace("_", " ")}
                  </Badge>
                  {item.severity && (
                    <Badge variant={item.severity === "high" || item.severity === "critical" ? "destructive" : "secondary"} className="text-[10px] uppercase">
                      {item.severity} Risk
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-sm font-semibold text-foreground mt-2">
                  {item.labelEn}
                </CardTitle>
                <CardDescription className="text-xs italic text-muted-foreground">
                  ES: {item.labelEs}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-xs text-muted-foreground">
                <span>Default status in mobile app: <strong>Standard Pass/Fail Checkpoint</strong></span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "toolbox" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredToolbox.map((topic) => (
            <Card key={topic.id} className="bg-card flex flex-col justify-between hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    Topic #{topic.number}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {topic.durationMinutes} min
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold text-foreground mt-2 leading-snug">
                  {topic.titleEn}
                </CardTitle>
                <CardDescription className="text-xs italic">
                  ES: {topic.titleEs}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Trade: </span>
                  {topic.trade}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">OSHA Standard: </span>
                  {topic.oshaStandard}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {topic.keyHazards.map((h, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] bg-muted/60">
                      {h}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "jha" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJha.map((template) => (
            <Card key={template.id} className="bg-card hover:border-primary/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">
                    {template.trade}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-500" /> AI-Assisted Pre-fill
                  </span>
                </div>
                <CardTitle className="text-base font-semibold text-foreground mt-1">
                  {template.activity}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs">
                <div>
                  <span className="font-semibold text-foreground">Identified Hazards:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.hazards.map((h, i) => (
                      <Badge key={i} variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-foreground">Mandatory PPE:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.requiredPPE.map((p, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
