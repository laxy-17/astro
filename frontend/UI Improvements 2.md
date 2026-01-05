# 8Stro Charts Tab - Complete Implementation Plan for Antigravity
**Phase 2: Charts Tab Excellence**  
**Date**: January 4, 2026  
**Theme**: Light Sky Blue, Sky Blue, Violet/Blue (NO ORANGE/RED)  
**Target**: Production-ready Charts Tab with enhanced UX

---

## 🎨 DESIGN SYSTEM - STRICT THEME ADHERENCE

### Color Palette (Approved Colors ONLY)

```css
/* PRIMARY COLORS - Light Sky Blue, Sky Blue, Violet */
--primary-violet: #6366F1;        /* Main actions, active states */
--primary-violet-dark: #4F46E5;   /* Hover states */
--primary-violet-light: #A5B4FC;  /* Light backgrounds */

--skyblue: #38BDF8;               /* Secondary actions, accents */
--skyblue-dark: #0EA5E9;          /* Hover states */
--skyblue-light: #BAE6FD;         /* Light backgrounds */

--light-skyblue: #E0F2FE;         /* Backgrounds, subtle highlights */

/* NEUTRAL COLORS */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-500: #6B7280;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;

/* SEMANTIC COLORS (Sparingly) */
--success-green: #10B981;         /* Save confirmations only */
--error-red: #EF4444;             /* Errors, critical warnings */
--warning-amber: #F59E0B;         /* Retrograde indicators */

/* CHART-SPECIFIC COLORS */
--chart-border: #6366F1;          /* Violet for chart borders */
--chart-lines: #38BDF8;           /* Sky blue for internal lines */
--chart-text: #111827;            /* Dark gray for readability */
```

### Typography System

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'SF Mono', 'Consolas', monospace;

/* Font Sizes */
--text-xs: 11px;
--text-sm: 13px;
--text-base: 15px;
--text-lg: 17px;
--text-xl: 20px;
--text-2xl: 24px;

/* Font Weights */
--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Core Layout & Theme (Priority: CRITICAL)

#### 1.1 Dashboard Header - Sticky & Themed

**File**: `frontend/src/components/Dashboard.tsx`

```typescript
// Add sticky header with shadow on scroll
<header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
  <div className="px-6 py-4">
    <div className="flex items-center justify-between">
      {/* Left: Current Chart Info */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          Birth Chart
        </h1>
        <p className="text-sm text-gray-500">
          {chartData?.birthDate} • {chartData?.birthTime}
        </p>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Export PDF - Violet Primary */}
        <Button 
          className="bg-violet-600 hover:bg-violet-700 text-white"
          onClick={handleExportPDF}
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>

        {/* Save to Library - Sky Blue Outline */}
        <Button 
          variant="outline"
          className="border-skyblue-500 text-skyblue-700 hover:bg-skyblue-50"
          onClick={handleSave}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save
            </>
          )}
        </Button>

        {/* Library - Ghost Style */}
        <Button 
          variant="ghost"
          className="text-gray-600 hover:text-gray-900"
          onClick={handleLibrary}
        >
          <Library className="w-4 h-4 mr-2" />
          Library
        </Button>
      </div>
    </div>
  </div>
</header>
```

**CSS Updates**:
```css
.sticky-header {
  transition: box-shadow 0.2s ease;
}

.sticky-header.scrolled {
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}
```

---

#### 1.2 Birth Information Panel - Enhanced

**File**: `frontend/src/components/BirthParticulars.tsx`

```typescript
interface BirthParticularsProps {
  data: {
    name?: string;
    date: string;
    time: string;
    location: {
      city: string;
      latitude: number;
      longitude: number;
      timezone: string;
    };
    ayanamsa: string;
  };
  onEdit?: () => void;
}

export const BirthParticulars: React.FC<BirthParticularsProps> = ({ 
  data, 
  onEdit 
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateFormat = date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    return `${dayName}, ${dateFormat}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Birth Information
        </h2>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-skyblue-600 hover:text-skyblue-700"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {/* Name */}
        {data.name && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Name
            </label>
            <p className="text-lg font-medium text-gray-900">
              {data.name}
            </p>
          </div>
        )}

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Date of Birth
          </label>
          <p className="text-lg font-medium text-gray-900">
            {formatDate(data.date)}
          </p>
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Time of Birth
          </label>
          <p className="text-lg font-medium text-gray-900">
            {data.time}
            <span className="text-sm text-gray-500 ml-2">
              ({data.location.timezone})
            </span>
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Place of Birth
          </label>
          <p className="text-lg font-medium text-gray-900">
            {data.location.city}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.location.latitude.toFixed(4)}°, {data.location.longitude.toFixed(4)}°
          </p>
        </div>

        {/* Ayanamsa */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Ayanamsa
            <button 
              className="ml-1 text-gray-400 hover:text-gray-600"
              title="Zodiac calculation method used in Vedic astrology"
            >
              <HelpCircle className="w-3 h-3 inline" />
            </button>
          </label>
          <p className="text-lg font-medium text-gray-900">
            {data.ayanamsa}
          </p>
        </div>
      </div>
    </div>
  );
};
```

**CSS**:
```css
/* Add vertical divider between columns (optional) */
.birth-particulars-grid > div:nth-child(2n+1):not(:last-child) {
  border-right: 1px solid #E5E7EB;
  padding-right: 2rem;
}
```

---

#### 1.3 Chart Style Toggle - Violet Theme

**File**: `frontend/src/components/ChartsTab.tsx`

```typescript
export const ChartsTab: React.FC = () => {
  const [chartStyle, setChartStyle] = useState<'south' | 'north'>('south');
  const [showVargas, setShowVargas] = useState(false);

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="flex items-center justify-between">
        {/* Chart Style Toggle */}
        <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
          <button
            onClick={() => setChartStyle('south')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${chartStyle === 'south' 
                ? 'bg-violet-600 text-white shadow-sm' 
                : 'text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <span className="text-lg">◇</span>
            South Indian
          </button>
          <button
            onClick={() => setChartStyle('north')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${chartStyle === 'north' 
                ? 'bg-violet-600 text-white shadow-sm' 
                : 'text-gray-700 hover:text-gray-900'
              }
            `}
          >
            <span className="text-lg">▢</span>
            North Indian
          </button>
        </div>

        {/* Divisional Charts Toggle */}
        <Button
          variant="outline"
          onClick={() => setShowVargas(!showVargas)}
          className={`
            border-skyblue-500 transition-all
            ${showVargas 
              ? 'bg-skyblue-600 text-white border-skyblue-600' 
              : 'text-skyblue-700 hover:bg-skyblue-50'
            }
          `}
        >
          Divisional Charts
          {showVargas ? (
            <ChevronUp className="w-4 h-4 ml-2" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-2" />
          )}
        </Button>
      </div>

      {/* Chart Display */}
      <div className="relative">
        {chartStyle === 'south' ? (
          <SouthIndianChartEnhanced {...chartProps} />
        ) : (
          <NorthIndianChartEnhanced {...chartProps} />
        )}
      </div>

      {/* Divisional Charts Panel */}
      {showVargas && <DivisionalChartsPanel />}

      {/* Planet Positions Table */}
      <PlanetPositionsTableEnhanced {...tableProps} />
    </div>
  );
};
```

---

### Phase 2: Chart Enhancements (Priority: HIGH)

#### 2.1 South Indian Chart - Enhanced Typography & Theme

**File**: `frontend/src/components/charts/SouthIndianChartEnhanced.tsx`

```typescript
import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';

interface Props {
  planets: PlanetPosition[];
  ascendantSign: string;
  birthDetails: {
    name?: string;
    date: string;
    time: string;
    location: string;
  };
}

export const SouthIndianChartEnhanced: React.FC<Props> = ({
  planets,
  ascendantSign,
  birthDetails
}) => {
  // Group planets by sign
  const planetsBySign: Record<string, PlanetPosition[]> = {};
  planets.forEach(planet => {
    if (!planetsBySign[planet.sign]) {
      planetsBySign[planet.sign] = [];
    }
    planetsBySign[planet.sign].push(planet);
  });

  const renderPlanetTooltip = (planet: PlanetPosition) => (
    <div className="text-xs space-y-1">
      <div className="font-semibold">{planet.name}</div>
      <div>Position: {formatDegrees(planet.longitude)}</div>
      <div>Sign: {planet.sign}</div>
      <div>Nakshatra: {planet.nakshatra}</div>
      {planet.retrograde && (
        <div className="text-amber-500">Retrograde</div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg p-6">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md"
          onClick={handleZoomIn}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md"
          onClick={handleZoomOut}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-8 h-8 p-0 bg-white shadow-md"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* Outer Border - Violet */}
        <rect 
          x="10" 
          y="10" 
          width="380" 
          height="380" 
          fill="none" 
          stroke="#6366F1"
          strokeWidth="3"
        />

        {/* Grid Lines - Sky Blue */}
        <line x1="105" y1="10" x2="105" y2="390" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="200" y1="10" x2="200" y2="390" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="295" y1="10" x2="295" y2="390" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="10" y1="105" x2="390" y2="105" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="10" y1="200" x2="390" y2="200" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="10" y1="295" x2="390" y2="295" stroke="#38BDF8" strokeWidth="2.5" />

        {/* Diagonal Lines - Sky Blue */}
        <line x1="10" y1="10" x2="390" y2="390" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="10" y1="390" x2="390" y2="10" stroke="#38BDF8" strokeWidth="2.5" />

        {/* Cancer (top-left) */}
        <g>
          {/* Planets - Larger, Bold */}
          <text 
            x="30" 
            y="75" 
            fontSize="18" 
            fontWeight="600" 
            fill="#111827"
          >
            {planetsBySign['Cancer']?.map(p => getPlanetShortName(p.name)).join(' · ') || ''}
          </text>
          
          {/* Zodiac Sign - Sky Blue, Larger */}
          <text 
            x="30" 
            y="95" 
            fontSize="15" 
            fontWeight="500" 
            fill="#38BDF8"
            opacity="0.9"
          >
            Ca
          </text>
        </g>

        {/* Leo */}
        <g>
          <text 
            x="152" 
            y="60" 
            fontSize="18" 
            fontWeight="600" 
            fill="#111827" 
            textAnchor="middle"
          >
            {planetsBySign['Leo']?.map(p => getPlanetShortName(p.name)).join(' · ') || ''}
          </text>
          <text 
            x="152" 
            y="90" 
            fontSize="15" 
            fontWeight="500" 
            fill="#38BDF8" 
            opacity="0.9"
            textAnchor="middle"
          >
            Le
          </text>
        </g>

        {/* ... Continue for all 12 signs ... */}

        {/* Center - Birth Details */}
        <g>
          {/* Birth Chart Label */}
          <text
            x="200"
            y="170"
            fontSize="20"
            fontWeight="700"
            fill="#6366F1"
            textAnchor="middle"
          >
            Birth Chart
          </text>

          {/* Date & Time */}
          <text
            x="200"
            y="195"
            fontSize="14"
            fontWeight="500"
            fill="#4B5563"
            textAnchor="middle"
          >
            {birthDetails.date}
          </text>
          <text
            x="200"
            y="215"
            fontSize="14"
            fontWeight="500"
            fill="#4B5563"
            textAnchor="middle"
          >
            {birthDetails.time}
          </text>
          
          {/* Location */}
          <text
            x="200"
            y="235"
            fontSize="12"
            fill="#6B7280"
            textAnchor="middle"
          >
            {birthDetails.location}
          </text>
        </g>
      </svg>
    </div>
  );
};
```

**Key Changes**:
- ✅ Border: Violet (#6366F1) instead of orange
- ✅ Lines: Sky Blue (#38BDF8) instead of orange
- ✅ Planet text: 18px, semibold (#111827)
- ✅ Zodiac abbreviations: 15px, sky blue (#38BDF8)
- ✅ Center text: Clean hierarchy, violet heading
- ✅ Zoom controls: Floating buttons (white bg, shadow)

---

#### 2.2 North Indian Chart - Enhanced

**File**: `frontend/src/components/charts/NorthIndianChartEnhanced.tsx`

Same approach as South Indian, but with diamond layout:

```typescript
// Use SAME color scheme:
// - Border: #6366F1 (violet)
// - Lines: #38BDF8 (sky blue)
// - Planet text: 18px, #111827
// - Zodiac text: 15px, #38BDF8

// Add house numbers with violet background
<circle cx="..." cy="..." r="12" fill="#EDE9FE" />
<text ... fill="#5B21B6" fontWeight="700">1</text>

// ASC marker in gold/amber
<text ... fill="#F59E0B" fontWeight="700">ASC</text>
```

---

### Phase 3: Divisional Charts Panel (Priority: HIGH)

#### 3.1 Enhanced Vargas Panel

**File**: `frontend/src/components/DivisionalChartsPanel.tsx`

```typescript
export const DivisionalChartsPanel: React.FC = () => {
  const [selectedChart, setSelectedChart] = useState('D1');

  const chartGroups = {
    primary: [
      { code: 'D1', name: 'Rashi', desc: 'Main birth chart' },
      { code: 'D9', name: 'Navamsa', desc: 'Spouse & fortune' },
      { code: 'D10', name: 'Dasamsa', desc: 'Career & status' },
      { code: 'D12', name: 'Dwadasamsa', desc: 'Parents' }
    ],
    secondary: [
      { code: 'D2', name: 'Hora', desc: 'Wealth' },
      { code: 'D3', name: 'Drekkana', desc: 'Siblings' },
      { code: 'D7', name: 'Saptamsa', desc: 'Children' },
      { code: 'D16', name: 'Shodasamsa', desc: 'Vehicles' },
      { code: 'D20', name: 'Vimsamsa', desc: 'Spiritual' }
    ],
    advanced: [
      { code: 'D24', name: 'Chaturvimsamsa', desc: 'Education' },
      { code: 'D27', name: 'Saptavimsamsa', desc: 'Strengths' },
      { code: 'D30', name: 'Trimsamsa', desc: 'Evils' },
      { code: 'D40', name: 'Khavedamsa', desc: 'Auspicious' },
      { code: 'D45', name: 'Akshavedamsa', desc: 'Character' },
      { code: 'D60', name: 'Shastiamsa', desc: 'Karma' }
    ]
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
      {/* Chart Selector */}
      <div className="space-y-4">
        {/* Primary Charts */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Primary Charts
          </label>
          <div className="flex flex-wrap gap-2">
            {chartGroups.primary.map(chart => (
              <Tooltip key={chart.code} content={`${chart.name} - ${chart.desc}`}>
                <button
                  onClick={() => setSelectedChart(chart.code)}
                  className={`
                    px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${selectedChart === chart.code
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {chart.code}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Secondary Charts */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Secondary Charts
          </label>
          <div className="flex flex-wrap gap-2">
            {chartGroups.secondary.map(chart => (
              <Tooltip key={chart.code} content={`${chart.name} - ${chart.desc}`}>
                <button
                  onClick={() => setSelectedChart(chart.code)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${selectedChart === chart.code
                      ? 'bg-skyblue-600 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {chart.code}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Advanced Charts */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Advanced Charts
          </label>
          <div className="flex flex-wrap gap-2">
            {chartGroups.advanced.map(chart => (
              <Tooltip key={chart.code} content={`${chart.name} - ${chart.desc}`}>
                <button
                  onClick={() => setSelectedChart(chart.code)}
                  className={`
                    px-3 py-2 rounded-lg text-xs font-medium transition-all
                    ${selectedChart === chart.code
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }
                  `}
                >
                  {chart.code}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {chartGroups.primary.find(c => c.code === selectedChart)?.name ||
               chartGroups.secondary.find(c => c.code === selectedChart)?.name ||
               chartGroups.advanced.find(c => c.code === selectedChart)?.name}
            </h3>
            <p className="text-sm text-gray-500">
              {chartGroups.primary.find(c => c.code === selectedChart)?.desc ||
               chartGroups.secondary.find(c => c.code === selectedChart)?.desc ||
               chartGroups.advanced.find(c => c.code === selectedChart)?.desc}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVargas(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Render selected divisional chart */}
        <DivisionalChartRenderer chartCode={selectedChart} />
      </div>
    </div>
  );
};
```

---

### Phase 4: Planet Positions Table (Priority: HIGH)

#### 4.1 Enhanced Table with Theme

**File**: `frontend/src/components/PlanetPositionsTableEnhanced.tsx`

```typescript
export const PlanetPositionsTableEnhanced: React.FC<Props> = ({ 
  planets, 
  ascendant 
}) => {
  const tableData = useMemo(() => {
    return [
      {
        name: 'Ascendant',
        symbol: '⚹',
        longitude: ascendant.degree,
        sign: ascendant.sign,
        nakshatra: '-',
        nakshatraLord: '-',
        retrograde: false,
        isAscendant: true
      },
      ...planets.map(p => ({
        name: p.name,
        symbol: getPlanetSymbol(p.name),
        longitude: p.longitude,
        sign: p.sign,
        nakshatra: p.nakshatra,
        nakshatraLord: p.nakshatra_lord || '-',
        retrograde: p.retrograde
      }))
    ];
  }, [planets, ascendant]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">
        Planet Positions
      </h2>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header - Sticky with Sky Blue accent */}
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Planet
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Degrees
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Rasi
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Rasi Lord
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                Nakshatra
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Nakshatra Lord
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, idx) => {
              const rasiInfo = getRasiSymbol(row.sign);
              const rasiLord = getRasiLord(row.sign);

              return (
                <tr
                  key={row.name}
                  className={`
                    ${row.isAscendant ? 'bg-violet-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    hover:bg-skyblue-50 transition-colors
                  `}
                >
                  {/* Planet */}
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color: row.symbol.color }}>
                        {row.symbol.symbol}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {row.name}
                      </span>
                      {row.retrograde && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          R
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Position */}
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                    <span className="text-sm font-mono text-gray-900">
                      {formatDMS(row.longitude)}
                    </span>
                  </td>

                  {/* Degrees in Sign */}
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                    <span className="text-sm font-mono text-gray-900">
                      {formatDMS(row.longitude % 30)}
                    </span>
                  </td>

                  {/* Rasi */}
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" style={{ color: rasiInfo.color }}>
                        {rasiInfo.symbol}
                      </span>
                      <span className="text-sm text-gray-700">
                        {rasiInfo.name}
                      </span>
                    </div>
                  </td>

                  {/* Rasi Lord */}
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                    <span className="text-sm font-medium text-gray-900">
                      {rasiLord}
                    </span>
                  </td>

                  {/* Nakshatra */}
                  <td className="px-4 py-3 whitespace-nowrap border-r border-gray-200">
                    <span className="text-sm text-gray-900">
                      {row.nakshatra}
                    </span>
                  </td>

                  {/* Nakshatra Lord */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {row.nakshatraLord}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Footer - Sky Blue background */}
        <div className="bg-skyblue-50 px-4 py-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Rasi Lord:</span>{' '}
              <span className="text-gray-900">{getRasiLord(ascendant.sign)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Lagna Lord:</span>{' '}
              <span className="text-gray-900">{getRasiLord(ascendant.sign)}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Nakshatra Lord (Moon):</span>{' '}
              <span className="text-gray-900">
                {planets.find(p => p.name === 'Moon')?.nakshatra_lord || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {tableData.map((row) => (
          <div
            key={row.name}
            className={`
              border rounded-lg p-4 shadow-sm
              ${row.isAscendant ? 'bg-violet-50 border-violet-200' : 'bg-white border-gray-200'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl" style={{ color: row.symbol.color }}>
                  {row.symbol.symbol}
                </span>
                <span className="text-base font-semibold text-gray-900">
                  {row.name}
                </span>
                {row.retrograde && (
                  <span className="text-xs font-bold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
                    R
                  </span>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-gray-500 mb-1">Position</div>
                <div className="font-mono text-gray-900">
                  {formatDMS(row.longitude)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Degrees</div>
                <div className="font-mono text-gray-900">
                  {formatDMS(row.longitude % 30)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Rasi</div>
                <div className="text-gray-900">
                  {getRasiSymbol(row.sign).name}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Rasi Lord</div>
                <div className="font-medium text-gray-900">
                  {getRasiLord(row.sign)}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Nakshatra</div>
                <div className="text-gray-900">{row.nakshatra}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Nakshatra Lord</div>
                <div className="text-gray-900">{row.nakshatraLord}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🎯 IMPLEMENTATION PRIORITY

### Week 1: Critical Changes
- [ ] Update all button colors to violet/skyblue theme
- [ ] Enhance Birth Information panel
- [ ] Fix chart borders and lines (violet/skyblue)
- [ ] Increase chart typography (18px planets, 15px signs)
- [ ] Add sticky header

### Week 2: High Priority
- [ ] Implement zoom controls on charts
- [ ] Reorganize Vargas panel (3 rows)
- [ ] Enhanced planet table with alternating rows
- [ ] Add tooltips to charts
- [ ] Retrograde badge styling

### Week 3: Medium Priority
- [ ] Mobile responsive layouts
- [ ] Keyboard navigation
- [ ] Loading states
- [ ] Save preferences to localStorage
- [ ] Chart comparison mode

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Desktop */
@media (min-width: 1024px) {
  .chart-container { max-width: 900px; }
  .table-view { display: table; }
  .card-view { display: none; }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .chart-container { max-width: 700px; }
}

/* Mobile */
@media (max-width: 767px) {
  .chart-container { max-width: 100%; padding: 16px; }
  .table-view { display: none; }
  .card-view { display: block; }
  .vargas-buttons { overflow-x: auto; }
}
```

---

## ✅ TESTING CHECKLIST

### Visual Testing
- [ ] All buttons use violet/skyblue (NO orange)
- [ ] Chart borders are violet (#6366F1)
- [ ] Chart lines are skyblue (#38BDF8)
- [ ] Planet text is 18px, semibold
- [ ] Zodiac text is 15px, skyblue
- [ ] Table has alternating row colors
- [ ] Retrograde badge is amber (#F59E0B)

### Functional Testing
- [ ] Switch between North/South styles
- [ ] Toggle divisional charts panel
- [ ] Select different D-charts
- [ ] Hover tooltips work on charts
- [ ] Zoom controls work
- [ ] Export PDF maintains quality
- [ ] Save chart to library
- [ ] Edit birth details

### Responsive Testing
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (iPad)
- [ ] Test on mobile (iPhone 14)
- [ ] Card view on mobile works
- [ ] All text readable at all sizes

---

## 🚀 DEPLOYMENT NOTES

1. **No Orange/Red**: Strictly violet and skyblue only
2. **Consistent Theme**: Same colors across ALL tabs
3. **High Contrast**: Ensure WCAG AA compliance
4. **Performance**: Lazy load divisional charts
5. **Accessibility**: Add aria-labels, keyboard nav
6. **Browser Support**: Test on Chrome, Firefox, Safari, Edge

---

**END OF IMPLEMENTATION PLAN**

Ready for Antigravity deployment with 100% theme adherence to light sky blue, sky blue, and violet color scheme!
