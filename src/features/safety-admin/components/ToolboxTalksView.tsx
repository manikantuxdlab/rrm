import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  MOCK_TOOLBOX_TOPICS,
  MOCK_SUBMISSIONS,
} from "@/data/safetyMockData"
import type { SubmissionRecord, ToolboxTopic } from "@/types"
import {
  MessageSquareCheck,
  CheckCircle2,
  BookOpen,
  Clock,
  Shield,
  FileCheck,
  Eye,
  Users,
  Search,
} from "lucide-react"

export function ToolboxTalksView({
  onSelectSubmission,
}: {
  onSelectSubmission: (submission: SubmissionRecord) => void
}) {
  const [selectedTopic, setSelectedTopic] = React.useState<ToolboxTopic | null>(
    MOCK_TOOLBOX_TOPICS[0] || null
  )
  const [lang, setLang] = React.useState<"en" | "es">("en")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"library" | "rosters">("library")

  const toolboxSubmissions = MOCK_SUBMISSIONS.filter(
    (s) => s.moduleType === "toolbox_talk"
  )

  const filteredTopics = React.useMemo(() => {
    return MOCK_TOOLBOX_TOPICS.filter((t) =>
      t.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.titleEs.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.oshaStandard.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquareCheck className="size-6 text-primary" />
            Toolbox Safety Talks (26 Trade Topics)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Bilingual weekly safety meeting curricula with mandatory foreman digital signatures & crew attendance logs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              onClick={() => setActiveTab("library")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "library"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Curriculum Library ({MOCK_TOOLBOX_TOPICS.length})
            </button>
            <button
              onClick={() => setActiveTab("rosters")}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === "rosters"
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Signed Field Rosters ({toolboxSubmissions.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === "library" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Topics List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topic or OSHA standard..."
                  className="pl-8 text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredTopics.map((topic) => {
                const isSelected = selectedTopic?.id === topic.id
                return (
                  <div
                    key={topic.id}
                    onClick={() => setSelectedTopic(topic)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-muted/40 hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        Topic #{topic.number}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {topic.durationMinutes} mins
                      </span>
                    </div>

                    <div className="font-semibold text-foreground text-sm">
                      {topic.titleEn}
                    </div>

                    <div className="text-[11px] text-muted-foreground italic line-clamp-1">
                      {topic.titleEs}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                      <span className="font-medium text-primary">{topic.trade}</span>
                      <span>OSHA {topic.oshaStandard.split("(")[0]}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Topic Detail & Preview (Right Column) */}
          <div className="lg:col-span-7">
            {selectedTopic ? (
              <Card className="h-full flex flex-col justify-between">
                <CardHeader className="space-y-3 border-b border-border/60 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary text-primary-foreground font-bold">
                        Topic #{selectedTopic.number}
                      </Badge>
                      <Badge variant="outline">{selectedTopic.trade}</Badge>
                    </div>

                    {/* Bilingual Language Switch */}
                    <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-xs">
                      <button
                        onClick={() => setLang("en")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                          lang === "en"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        🇺🇸 English
                      </button>
                      <button
                        onClick={() => setLang("es")}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                          lang === "es"
                            ? "bg-card text-foreground shadow-xs"
                            : "text-muted-foreground"
                        }`}
                      >
                        🇲🇽 Español
                      </button>
                    </div>
                  </div>

                  <div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {lang === "en" ? selectedTopic.titleEn : selectedTopic.titleEs}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2 mt-1">
                      <Shield className="size-3.5 text-emerald-600" />
                      <span>Standard: {selectedTopic.oshaStandard}</span>
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-4 text-xs">
                  {/* Key Hazards */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-destructive/5 border border-destructive/20">
                    <div className="font-semibold text-destructive flex items-center gap-1.5">
                      <Shield className="size-3.5" />
                      Critical Site Hazards & Risks:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {selectedTopic.keyHazards.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Discussion Guide */}
                  <div className="space-y-2">
                    <div className="font-semibold text-foreground flex items-center gap-1.5">
                      <BookOpen className="size-3.5 text-primary" />
                      Field Leader Discussion Points (5-Minute Talk):
                    </div>
                    <div className="space-y-2">
                      {selectedTopic.discussionPoints.map((point, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/60"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                            {i + 1}
                          </span>
                          <span className="text-foreground leading-relaxed">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Items */}
                  <div className="space-y-1.5 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      Mandatory Foreman Action Items for Today's Shift:
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
                      {selectedTopic.recommendedActionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Users className="size-3.5" />
                    Last covered on jobsites: {selectedTopic.lastCovered || "Active this week"}
                  </div>
                  <Button size="sm" className="text-xs font-semibold gap-1 bg-primary text-primary-foreground">
                    <FileCheck className="size-3.5" />
                    Export Printable Handout
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        /* Signed Rosters View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {toolboxSubmissions.map((sub) => (
              <Card
                key={sub.id}
                className="hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => onSelectSubmission(sub)}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {sub.id}
                        </Badge>
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/10 text-[10px]">
                          <CheckCircle2 className="size-3 mr-1" />
                          Signed & Logged
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground">
                        {sub.title}
                      </CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-foreground">{sub.timestamp}</div>
                      <div className="text-[11px] text-muted-foreground">Foreman: {sub.foremanName}</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-muted/40">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Jobsite Location:</span>
                      <span className="font-semibold text-foreground">{sub.jobSiteName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Meeting Duration:</span>
                      <span className="font-semibold text-foreground">{sub.data.duration} Minutes</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Verified Crew Attendees:</span>
                      <span className="font-semibold text-emerald-600">
                        {sub.data.attendees?.length || 0} Tradesmen Signed
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-muted-foreground">Attendee Roster:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {sub.data.attendees?.map((att: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] text-foreground"
                        >
                          {att}
                        </span>
                      ))}
                    </div>
                  </div>

                  {sub.data.keyNotes && (
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                      <span className="font-semibold text-primary">Foreman Field Notes: </span>
                      <span className="text-foreground">{sub.data.keyNotes}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t border-border/60 pt-3">
                  <div className="text-xs text-muted-foreground">
                    Auto-dispatched to GC Safety Director & Underwriters
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                    <Eye className="size-3" />
                    View Signed PDF Roster
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
