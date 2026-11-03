import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Hospital,
  Search,
  Check,
  Navigation,
  Loader2,
  X,
  Compass,
} from "lucide-react"

export interface HospitalInfo {
  name: string
  address: string
  phone: string
  distanceMiles: number
  lat?: number
  lng?: number
}

export interface LocationSelectionResult {
  name?: string
  address: string
  cityStateZip?: string
  phone?: string
  distanceMiles?: number
  lat: number
  lng: number
  nearestHospital?: HospitalInfo
}

interface MapLocationPickerModalProps {
  isOpen: boolean
  mode: "site" | "hospital"
  currentAddress?: string
  onClose: () => void
  onSelect: (result: LocationSelectionResult) => void
}

// Fallback high-capacity trauma centers across primary operating hubs
const METRO_FALLBACK_TRAUMA_CENTERS = [
  {
    name: "Good Samaritan Hospital - Level 1 Trauma Center",
    address: "1225 Wilshire Blvd, Los Angeles, CA 90017",
    phone: "(213) 977-2121",
    lat: 34.0543,
    lng: -118.2678,
  },
  {
    name: "Cedars-Sinai Medical Center - Level 1 Trauma",
    address: "8700 Beverly Blvd, Los Angeles, CA 90048",
    phone: "(310) 423-3277",
    lat: 34.0754,
    lng: -118.3802,
  },
  {
    name: "LAC+USC Medical Center - Level 1 Trauma",
    address: "1200 N State St, Los Angeles, CA 90033",
    phone: "(323) 409-1000",
    lat: 34.0583,
    lng: -118.2078,
  },
  {
    name: "Banner - University Medical Center Phoenix (Level 1)",
    address: "1111 E McDowell Rd, Phoenix, AZ 85006",
    phone: "(602) 839-2000",
    lat: 33.4661,
    lng: -112.0544,
  },
  {
    name: "Memorial Hermann-Texas Medical Center - Level 1",
    address: "6411 Fannin St, Houston, TX 77030",
    phone: "(713) 704-4000",
    lat: 29.7138,
    lng: -95.3972,
  },
  {
    name: "Bellevue Hospital Center - Level 1 Trauma",
    address: "462 1st Ave, New York, NY 10016",
    phone: "(212) 562-4141",
    lat: 40.7397,
    lng: -73.9754,
  },
]

function calculateDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export function MapLocationPickerModal({
  isOpen,
  mode,
  currentAddress,
  onClose,
  onSelect,
}: MapLocationPickerModalProps) {
  const isSite = mode === "site"

  const [searchQuery, setSearchQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)

  // Start with null for brand new jobsite so no old dummy data leaks
  const [selectedLocation, setSelectedLocation] = React.useState<LocationSelectionResult | null>(null)

  // Nearest auto-detected trauma center
  const [nearestHospital, setNearestHospital] = React.useState<HospitalInfo | null>(null)
  const [isLoadingHospital, setIsLoadingHospital] = React.useState(false)

  const searchContainerRef = React.useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Helper to fetch nearest hospital via Nominatim or fallback
  const fetchNearestHospital = React.useCallback(async (lat: number, lng: number) => {
    setIsLoadingHospital(true)
    try {
      const delta = 0.25 // ~15 miles bounding box
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${
        lng - delta
      },${lat + delta},${lng + delta},${lat - delta}&bounded=1&limit=8&addressdetails=1`

      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      })
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        const candidates: HospitalInfo[] = data.map((item: any) => {
          const hLat = parseFloat(item.lat)
          const hLng = parseFloat(item.lon)
          const dist = calculateDistanceMiles(lat, lng, hLat, hLng)
          const addr = item.address || {}
          const street =
            [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(" ") ||
            item.display_name.split(",")[0]
          const city = addr.city || addr.town || addr.municipality || addr.county || ""
          const state = addr.state || ""
          const postcode = addr.postcode || ""
          const fullAddr = [street, city, state, postcode].filter(Boolean).join(", ")
          const rawName = item.name || item.display_name.split(",")[0]
          const cleanedName =
            rawName.toLowerCase().includes("hospital") || rawName.toLowerCase().includes("medical")
              ? rawName
              : `${rawName} Hospital`

          return {
            name: cleanedName,
            address: fullAddr || item.display_name,
            phone: "(213) 977-2121",
            distanceMiles: dist,
            lat: hLat,
            lng: hLng,
          }
        })

        candidates.sort((a, b) => a.distanceMiles - b.distanceMiles)
        if (candidates.length > 0) {
          setNearestHospital(candidates[0])
          return
        }
      }
    } catch (err) {
      console.warn("Failed to query nearby hospital from OSM, checking regional fallback:", err)
    }

    // Fallback: Pick closest regional hospital
    let best = METRO_FALLBACK_TRAUMA_CENTERS[0]
    let bestDist = calculateDistanceMiles(lat, lng, best.lat, best.lng)
    for (let i = 1; i < METRO_FALLBACK_TRAUMA_CENTERS.length; i++) {
      const h = METRO_FALLBACK_TRAUMA_CENTERS[i]
      const d = calculateDistanceMiles(lat, lng, h.lat, h.lng)
      if (d < bestDist) {
        best = h
        bestDist = d
      }
    }

    setNearestHospital({
      name: best.name,
      address: best.address,
      phone: best.phone,
      distanceMiles: bestDist,
      lat: best.lat,
      lng: best.lng,
    })
  }, [])

  // Auto-detect nearest hospital when selected location coordinates change in site mode
  React.useEffect(() => {
    if (isSite && selectedLocation?.lat && selectedLocation?.lng) {
      fetchNearestHospital(selectedLocation.lat, selectedLocation.lng).finally(() => {
        setIsLoadingHospital(false)
      })
    }
  }, [isSite, selectedLocation?.lat, selectedLocation?.lng, fetchNearestHospital])

  // Initialize or reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSuggestions([])
      setShowSuggestions(false)
      if (currentAddress && currentAddress.trim()) {
        const trimmed = currentAddress.trim()
        setSearchQuery(trimmed)
        executeSearch(trimmed, true)
      } else {
        setSearchQuery("")
        setSelectedLocation(null)
        setNearestHospital(null)
      }
    }
  }, [isOpen, currentAddress])

  // Real-time Auto-Suggest as user types (300ms debounce)
  React.useEffect(() => {
    if (!isOpen) return
    const trimmed = searchQuery.trim()
    if (trimmed.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const q = isSite ? trimmed : `${trimmed} hospital`
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&addressdetails=1&limit=6`
        const res = await fetch(url, { headers: { "Accept-Language": "en" } })
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setSuggestions(data)
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch (err) {
        console.warn("Autocomplete suggestion error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, isOpen, isSite])

  const executeSearch = async (query: string, selectFirst = false) => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const q = isSite ? query.trim() : `${query.trim()} hospital`
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        q
      )}&addressdetails=1&limit=6`
      const res = await fetch(url, { headers: { "Accept-Language": "en" } })
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        setSuggestions(data)
        if (selectFirst) {
          selectSearchResult(data[0])
          setShowSuggestions(false)
        } else {
          setShowSuggestions(true)
        }
      }
    } catch (err) {
      console.warn("Geocoding search error:", err)
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (item: any) => {
    const addr = item.address || {}
    const street =
      [addr.house_number, addr.road || addr.pedestrian || addr.suburb].filter(Boolean).join(" ") ||
      item.display_name.split(",")[0]
    const city = addr.city || addr.town || addr.village || addr.municipality || ""
    const state = addr.state || ""
    const postcode = addr.postcode || ""
    const cityStateZip = [city, state, postcode].filter(Boolean).join(", ")

    const newLat = parseFloat(item.lat)
    const newLng = parseFloat(item.lon)

    const loc: LocationSelectionResult = {
      name: item.name || street,
      address: street,
      cityStateZip,
      lat: newLat,
      lng: newLng,
      phone: isSite ? undefined : "(213) 977-2121",
      distanceMiles: isSite ? undefined : 1.5,
    }

    setSelectedLocation(loc)
    setSearchQuery(item.display_name.split(",").slice(0, 3).join(","))
    setShowSuggestions(false)
  }

  // OpenStreetMap embed URL
  const mapEmbedUrl = React.useMemo(() => {
    if (selectedLocation) {
      const lat = selectedLocation.lat
      const lng = selectedLocation.lng
      const delta = 0.009
      const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
      return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=-124.7,24.5,-66.9,49.3&layer=mapnik`
  }, [selectedLocation])

  const handleApply = () => {
    if (!selectedLocation) return
    onSelect({
      ...selectedLocation,
      nearestHospital: isSite && nearestHospital ? nearestHospital : undefined,
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="w-full max-w-2xl p-0 overflow-hidden flex flex-col max-h-[88vh] bg-card border-border shadow-2xl">
        <DialogHeader className="p-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0">
              {isSite ? <MapPin className="size-4" /> : <Hospital className="size-4 text-destructive" />}
            </div>
            <div>
              <DialogTitle className="text-sm font-bold text-foreground">
                {isSite ? "Choose Jobsite Address on Map" : "Select Designated Hospital"}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                {isSite
                  ? "Type to search address. The nearest hospital will be automatically linked."
                  : "Search hospital name or city."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Search bar with floating Auto-Suggest Dropdown */}
          <div ref={searchContainerRef} className="relative">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                executeSearch(searchQuery, true)
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true)
                  }}
                  placeholder={
                    isSite
                      ? "Search address (e.g. 100 Main St, Grand Ave)..."
                      : "Search hospital (e.g. Good Samaritan)..."
                  }
                  className="pl-8.5 pr-8 text-xs h-8.5 bg-background shadow-xs focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("")
                      setSuggestions([])
                      setShowSuggestions(false)
                      setSelectedLocation(null)
                      setNearestHospital(null)
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="h-8.5 px-3 text-xs font-semibold gap-1.5 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSearching ? <Loader2 className="size-3 animate-spin" /> : <Search className="size-3" />}
                <span>Search</span>
              </Button>
            </form>

            {/* FLOATING AUTO-SUGGEST DROPDOWN */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover border border-border rounded-lg shadow-xl overflow-hidden divide-y divide-border/50 animate-in fade-in-0 duration-100">
                <div className="px-2.5 py-1 bg-muted/40 text-[9.5px] font-semibold text-muted-foreground flex items-center justify-between">
                  <span>Suggestions ({suggestions.length})</span>
                  <span>Click to select</span>
                </div>
                <div className="max-h-52 overflow-y-auto [scrollbar-width:none]">
                  {suggestions.map((item, idx) => {
                    const addr = item.address || {}
                    const primaryName =
                      item.name ||
                      [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(" ") ||
                      item.display_name.split(",")[0]
                    const secondaryText = item.display_name.split(",").slice(1).join(",").trim()

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSearchResult(item)}
                        className="w-full text-left px-3 py-2 hover:bg-primary/10 transition-colors flex items-center justify-between gap-2 group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-foreground group-hover:text-primary truncate">
                            {primaryName}
                          </div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {secondaryText || item.display_name}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1.5 py-0 h-4 font-mono shrink-0 opacity-0 group-hover:opacity-100 transition-opacity border-primary/30 text-primary"
                        >
                          Select
                        </Badge>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Map View */}
          <div className="relative rounded-xl overflow-hidden border border-border/80 h-64 sm:h-72 bg-muted/30">
            <iframe
              title="Interactive Location Map"
              src={mapEmbedUrl}
              className="w-full h-full border-0 pointer-events-auto"
              loading="lazy"
            />

            {/* Selected Location Overlay Badge - Minimized */}
            {selectedLocation ? (
              <div className="absolute top-2 left-2 right-2 bg-background/90 backdrop-blur-md border border-border/70 rounded-lg px-2.5 py-1.5 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Navigation className="size-3 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-foreground truncate">
                    {selectedLocation.name || selectedLocation.address}
                  </span>
                  {selectedLocation.cityStateZip && (
                    <span className="text-[10px] text-muted-foreground truncate hidden sm:inline">
                      • {selectedLocation.cityStateZip}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-mono text-muted-foreground font-medium shrink-0">
                  {selectedLocation.lat.toFixed(4)}°, {selectedLocation.lng.toFixed(4)}°
                </span>
              </div>
            ) : (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center pointer-events-none p-4">
                <div className="bg-card/95 border border-border px-3.5 py-2.5 rounded-lg shadow-sm text-center flex items-center gap-2">
                  <Compass className="size-4 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    Type an address above to pin location
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* MINIMIZED 1-LINE NEAREST HOSPITAL STRIP */}
          {isSite && selectedLocation && (
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/60 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Hospital className="size-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-muted-foreground shrink-0 font-medium">Nearest Hospital:</span>
                {isLoadingHospital ? (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="size-2.5 animate-spin" /> Locating...
                  </span>
                ) : nearestHospital ? (
                  <>
                    <span className="text-[11px] font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                      {nearestHospital.name}
                    </span>
                    <Badge variant="secondary" className="text-[9.5px] px-1.5 py-0 h-4 font-mono shrink-0">
                      {nearestHospital.distanceMiles} mi
                    </Badge>
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Searching...</span>
                )}
              </div>
              {nearestHospital && (
                <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:inline">
                  Auto-linked
                </span>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="p-3 px-4 border-t border-border/70 bg-muted/20 flex items-center justify-between gap-2 sm:justify-between">
          <div className="text-[11px] text-muted-foreground truncate hidden sm:block">
            {selectedLocation ? (
              <span>
                Location pinned: <strong className="text-foreground">{selectedLocation.address}</strong>
              </span>
            ) : (
              <span className="italic">No address selected</span>
            )}
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedLocation}
              onClick={handleApply}
              className="h-8 text-xs font-semibold gap-1.5 bg-primary text-primary-foreground shadow-xs disabled:opacity-50"
            >
              <Check className="size-3.5" />
              <span>{isSite ? "Apply Site & Hospital" : "Apply Hospital"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
