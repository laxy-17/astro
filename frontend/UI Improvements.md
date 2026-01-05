# 8Stro Charts Tab - UPDATED with ProKerala-Style Parchment Design
**Phase 2: Charts Tab Excellence - Sky Blue Parchment Edition**  
**Date**: January 4, 2026  
**Theme**: Light Sky Blue Parchment with Violet/Blue Accents  
**Reference**: ProKerala.com birth chart style (but sky blue instead of brown)

---

## 🎨 UPDATED DESIGN SYSTEM - PARCHMENT + SKY BLUE THEME

### Color Palette - Parchment Sky Blue

```css
/* PARCHMENT BACKGROUND - SKY BLUE TONES */
--parchment-light: #E0F2FE;       /* Light sky blue cream */
--parchment-medium: #BAE6FD;      /* Medium sky blue */
--parchment-dark: #7DD3FC;        /* Darker sky blue for texture */

/* BORDER & LINES - VIOLET/BLUE COMBO */
--chart-border: #6366F1;          /* Violet outer border (3-4px) */
--chart-lines: #0EA5E9;           /* Sky blue internal lines (2px) */
--chart-accent: #38BDF8;          /* Light sky blue highlights */

/* TEXT COLORS */
--text-primary: #1E3A8A;          /* Dark blue (instead of brown) */
--text-secondary: #1E40AF;        /* Medium blue */
--text-accent: #6366F1;           /* Violet for emphasis */

/* GANESH/SACRED IMAGERY */
--ganesh-opacity: 0.12;           /* Subtle watermark */
--ganesh-color: #38BDF8;          /* Sky blue tint */

/* HOUSE NUMBERS - RED (from ProKerala) */
--house-number: #DC2626;          /* Red house numbers */
--house-bg: #FEE2E2;              /* Light red background */
```

---

## 📋 UPDATED IMPLEMENTATION

### Part 1: Sky Blue Parchment Background

**File**: `frontend/src/styles/parchment-skyblue.css` (NEW)

```css
/* ============================================
   SKY BLUE PARCHMENT TEXTURE
   (Based on ProKerala style but sky blue)
   ============================================ */

.parchment-skyblue {
  position: relative;
  background: linear-gradient(
    135deg,
    #E0F2FE 0%,     /* Light sky blue */
    #BAE6FD 50%,    /* Medium sky blue */
    #E0F2FE 100%
  );
  background-size: 200% 200%;
  
  /* Paper texture overlay */
  background-image:
    radial-gradient(circle at 20% 50%, rgba(125, 211, 252, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(125, 211, 252, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(125, 211, 252, 0.1) 0%, transparent 50%);
  
  /* Subtle texture */
  filter: contrast(1.03) brightness(1.01);
}

/* Aging spots (sky blue tinted) */
.parchment-skyblue::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.08) 0%, transparent 3%),
    radial-gradient(circle at 85% 25%, rgba(56, 189, 248, 0.06) 0%, transparent 4%),
    radial-gradient(circle at 70% 80%, rgba(56, 189, 248, 0.05) 0%, transparent 5%),
    radial-gradient(circle at 30% 90%, rgba(56, 189, 248, 0.04) 0%, transparent 3%);
  pointer-events: none;
  opacity: 0.7;
}

/* Decorative border - Violet with sky blue pattern */
.parchment-border {
  border: 4px solid #6366F1;  /* Violet main border */
  border-image: repeating-linear-gradient(
    45deg,
    #6366F1,      /* Violet */
    #6366F1 10px,
    #38BDF8 10px, /* Sky blue */
    #38BDF8 20px
  ) 4;
  box-shadow:
    inset 0 0 20px rgba(99, 102, 241, 0.08),
    0 4px 12px rgba(14, 165, 233, 0.12);
  border-radius: 8px;
}

/* Corner decorative elements */
.corner-bracket {
  position: absolute;
  width: 2rem;
  height: 2rem;
  border-color: #6366F1;
  opacity: 0.4;
}

.corner-bracket.top-left {
  top: 0.5rem;
  left: 0.5rem;
  border-left: 2px solid;
  border-top: 2px solid;
}

.corner-bracket.top-right {
  top: 0.5rem;
  right: 0.5rem;
  border-right: 2px solid;
  border-top: 2px solid;
}

.corner-bracket.bottom-left {
  bottom: 0.5rem;
  left: 0.5rem;
  border-left: 2px solid;
  border-bottom: 2px solid;
}

.corner-bracket.bottom-right {
  bottom: 0.5rem;
  right: 0.5rem;
  border-right: 2px solid;
  border-bottom: 2px solid;
}
```

---

### Part 2: South Indian Chart - ProKerala Style with Sky Blue

**File**: `frontend/src/components/charts/SouthIndianChartParchment.tsx` (UPDATED)

```typescript
import React, { useState } from 'react';
import type { PlanetPosition } from '../../api/client';
import { getPlanetShortName } from '../../lib/utils';
import '../../styles/parchment-skyblue.css';

interface Props {
  planets: PlanetPosition[];
  ascendantSign: string;
  birthDetails: {
    name?: string;
    date: string;
    time: string;
    location?: string;
  };
}

export const SouthIndianChartParchment: React.FC<Props> = ({
  planets,
  ascendantSign,
  birthDetails
}) => {
  const [zoom, setZoom] = useState(1);

  // Group planets by sign
  const planetsBySign: Record<string, PlanetPosition[]> = {};
  planets.forEach(planet => {
    if (!planetsBySign[planet.sign]) {
      planetsBySign[planet.sign] = [];
    }
    planetsBySign[planet.sign].push(planet);
  });

  return (
    <div className="parchment-skyblue parchment-border p-6 relative overflow-hidden">
      {/* Corner brackets */}
      <div className="corner-bracket top-left"></div>
      <div className="corner-bracket top-right"></div>
      <div className="corner-bracket bottom-left"></div>
      <div className="corner-bracket bottom-right"></div>

      {/* Zoom Controls - Floating */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom(Math.min(zoom + 0.1, 2))}
          className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom In"
        >
          <span className="text-lg font-bold text-gray-700">+</span>
        </button>
        <button
          onClick={() => setZoom(Math.max(zoom - 0.1, 0.5))}
          className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Zoom Out"
        >
          <span className="text-lg font-bold text-gray-700">−</span>
        </button>
        <button
          onClick={() => setZoom(1)}
          className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Reset Zoom"
        >
          <span className="text-xs font-bold text-gray-700">1x</span>
        </button>
      </div>

      {/* Chart SVG */}
      <div className="relative aspect-square max-w-2xl mx-auto">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full transition-transform duration-200"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Outer Border - VIOLET */}
          <rect 
            x="10" 
            y="10" 
            width="380" 
            height="380" 
            fill="none" 
            stroke="#6366F1"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Vertical Grid Lines - SKY BLUE */}
          <line x1="105" y1="10" x2="105" y2="390" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="200" y1="10" x2="200" y2="390" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="295" y1="10" x2="295" y2="390" stroke="#0EA5E9" strokeWidth="2" />

          {/* Horizontal Grid Lines - SKY BLUE */}
          <line x1="10" y1="105" x2="390" y2="105" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="10" y1="200" x2="390" y2="200" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="10" y1="295" x2="390" y2="295" stroke="#0EA5E9" strokeWidth="2" />

          {/* Diagonal Lines - SKY BLUE */}
          <line x1="10" y1="10" x2="390" y2="390" stroke="#0EA5E9" strokeWidth="2" />
          <line x1="10" y1="390" x2="390" y2="10" stroke="#0EA5E9" strokeWidth="2" />

          {/* HOUSE 12 (top-left) */}
          <g>
            {/* House Number - RED like ProKerala */}
            <circle cx="25" cy="25" r="10" fill="#FEE2E2" />
            <text x="25" y="30" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              12
            </text>
            
            {/* Planets - DARK BLUE */}
            <text 
              x="30" 
              y="70" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A"
            >
              {planetsBySign['Cancer']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            {/* Zodiac Sign - SKY BLUE */}
            <text 
              x="85" 
              y="95" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9"
              opacity="0.85"
            >
              Ca
            </text>
          </g>

          {/* HOUSE 1 (top-center) - ASCENDANT */}
          <g>
            <circle cx="152" cy="25" r="10" fill="#FEE2E2" />
            <text x="152" y="30" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              1
            </text>
            
            {/* ASC marker */}
            <text x="152" y="50" fontSize="12" fontWeight="700" fill="#F59E0B" textAnchor="middle">
              ASC
            </text>
            
            <text 
              x="152" 
              y="75" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="middle"
            >
              {planetsBySign['Leo']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="152" 
              y="95" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
              textAnchor="middle"
            >
              Le
            </text>
          </g>

          {/* HOUSE 2 (top-center-right) */}
          <g>
            <circle cx="247" cy="25" r="10" fill="#FEE2E2" />
            <text x="247" y="30" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              2
            </text>
            
            <text 
              x="247" 
              y="75" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="middle"
            >
              {planetsBySign['Virgo']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="247" 
              y="95" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
              textAnchor="middle"
            >
              Vi
            </text>
          </g>

          {/* HOUSE 3 (top-right) */}
          <g>
            <circle cx="375" cy="25" r="10" fill="#FEE2E2" />
            <text x="375" y="30" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              3
            </text>
            
            <text 
              x="370" 
              y="70" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="end"
            >
              {planetsBySign['Libra']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="315" 
              y="95" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
            >
              Li
            </text>
          </g>

          {/* HOUSE 11 (middle-left) */}
          <g>
            <circle cx="25" cy="152" r="10" fill="#FEE2E2" />
            <text x="25" y="157" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              11
            </text>
            
            <text 
              x="50" 
              y="157" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A"
            >
              {planetsBySign['Gemini']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="85" 
              y="185" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
            >
              Ge
            </text>
          </g>

          {/* CENTER - Birth Details with Ganesh symbol */}
          <g>
            {/* Ganesh Om Symbol - Sky Blue */}
            <text
              x="200"
              y="175"
              fontSize="60"
              fontWeight="700"
              fill="#38BDF8"
              opacity="0.12"
              textAnchor="middle"
              fontFamily="'Noto Sans Devanagari', serif"
            >
              ॐ
            </text>

            {/* Date */}
            <text
              x="200"
              y="205"
              fontSize="16"
              fontWeight="600"
              fill="#1E3A8A"
              textAnchor="middle"
            >
              {birthDetails.date}
            </text>

            {/* Time */}
            <text
              x="200"
              y="225"
              fontSize="16"
              fontWeight="600"
              fill="#1E3A8A"
              textAnchor="middle"
            >
              {birthDetails.time}
            </text>

            {/* Rasi label */}
            <text
              x="200"
              y="250"
              fontSize="18"
              fontWeight="700"
              fill="#6366F1"
              textAnchor="middle"
            >
              Rasi
            </text>

            {/* Swati (or ascendant info) */}
            <text
              x="200"
              y="270"
              fontSize="14"
              fontWeight="500"
              fill="#1E40AF"
              textAnchor="middle"
            >
              {ascendantSign}
            </text>
          </g>

          {/* HOUSE 4 (middle-right) */}
          <g>
            <circle cx="375" cy="152" r="10" fill="#FEE2E2" />
            <text x="375" y="157" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              4
            </text>
            
            <text 
              x="350" 
              y="157" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="end"
            >
              {planetsBySign['Scorpio']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="315" 
              y="185" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
            >
              Sc
            </text>
          </g>

          {/* HOUSE 10 (bottom-left) */}
          <g>
            <circle cx="25" cy="375" r="10" fill="#FEE2E2" />
            <text x="25" y="380" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              10
            </text>
            
            <text 
              x="30" 
              y="330" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A"
            >
              {planetsBySign['Taurus']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="85" 
              y="360" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
            >
              Ta
            </text>
          </g>

          {/* HOUSE 9 (bottom-center-left) */}
          <g>
            <circle cx="152" cy="375" r="10" fill="#FEE2E2" />
            <text x="152" y="380" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              9
            </text>
            
            <text 
              x="152" 
              y="330" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="middle"
            >
              {planetsBySign['Aries']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="152" 
              y="360" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
              textAnchor="middle"
            >
              Ar
            </text>
          </g>

          {/* HOUSE 8 (bottom-center-right) */}
          <g>
            <circle cx="247" cy="375" r="10" fill="#FEE2E2" />
            <text x="247" y="380" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              8
            </text>
            
            <text 
              x="247" 
              y="330" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="middle"
            >
              {planetsBySign['Pisces']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="247" 
              y="360" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
              textAnchor="middle"
            >
              Pi
            </text>
          </g>

          {/* HOUSE 7 (bottom-right) */}
          <g>
            <circle cx="375" cy="375" r="10" fill="#FEE2E2" />
            <text x="375" y="380" fontSize="11" fontWeight="700" fill="#DC2626" textAnchor="middle">
              7
            </text>
            
            <text 
              x="370" 
              y="330" 
              fontSize="18" 
              fontWeight="600" 
              fill="#1E3A8A" 
              textAnchor="end"
            >
              {planetsBySign['Aquarius']?.map(p => getPlanetShortName(p.name)).join(' ') || ''}
            </text>
            
            <text 
              x="315" 
              y="360" 
              fontSize="15" 
              fontWeight="500" 
              fill="#0EA5E9" 
              opacity="0.85"
            >
              Aq
            </text>
          </g>

          {/* Continue for remaining houses... */}
          
        </svg>
      </div>

      {/* ProKerala watermark style - bottom right */}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 opacity-60">
        Generated by 8Stro.com
      </div>
    </div>
  );
};
```

---

### Part 3: Chart Style Selector - ProKerala Style

**File**: `frontend/src/components/ChartsTab.tsx` (UPDATED)

```typescript
export const ChartsTab: React.FC = () => {
  const [chartStyle, setChartStyle] = useState<'south' | 'north'>('south');
  const [showVargas, setShowVargas] = useState(false);

  return (
    <div className="space-y-6">
      {/* Chart Style Selector - ProKerala Style Tabs */}
      <div className="flex items-center gap-3">
        {/* Style Tabs */}
        <div className="inline-flex bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <button
            onClick={() => setChartStyle('north')}
            className={`
              px-6 py-3 text-sm font-medium transition-all
              ${chartStyle === 'north'
                ? 'bg-violet-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            North Indian
          </button>
          <button
            onClick={() => setChartStyle('south')}
            className={`
              px-6 py-3 text-sm font-medium transition-all border-l border-r border-gray-300
              ${chartStyle === 'south'
                ? 'bg-skyblue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            South Indian
          </button>
          <button
            onClick={() => setShowVargas(!showVargas)}
            className={`
              px-6 py-3 text-sm font-medium transition-all
              ${showVargas
                ? 'bg-skyblue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            Vargas
          </button>
        </div>
      </div>

      {/* Chart Display */}
      <div className="relative">
        {!showVargas ? (
          chartStyle === 'south' ? (
            <SouthIndianChartParchment {...chartProps} />
          ) : (
            <NorthIndianChartParchment {...chartProps} />
          )
        ) : (
          <DivisionalChartsPanel chartStyle={chartStyle} {...chartProps} />
        )}
      </div>

      {/* Planet Positions Table */}
      <PlanetPositionsTableEnhanced {...tableProps} />
    </div>
  );
};
```

---

### Part 4: Vargas Panel - Same Parchment Style

**File**: `frontend/src/components/DivisionalChartsPanel.tsx` (UPDATED)

```typescript
export const DivisionalChartsPanel: React.FC<Props> = ({ chartStyle }) => {
  const [selectedVarga, setSelectedVarga] = useState('D1');

  const vargaButtons = [
    { code: 'D1', name: 'Rashi' },
    { code: 'D2', name: 'Hora' },
    { code: 'D3', name: 'Drekkana' },
    { code: 'D4', name: 'Chaturthamsa' },
    { code: 'D7', name: 'Saptamsa' },
    { code: 'D9', name: 'Navamsa' },
    { code: 'D10', name: 'Dasamsa' },
    { code: 'D12', name: 'Dwadasamsa' },
    { code: 'D16', name: 'Shodasamsa' },
    { code: 'D20', name: 'Vimsamsa' },
    { code: 'D24', name: 'Siddhamsa' },
    { code: 'D27', name: 'Saptavimsamsa' },
    { code: 'D30', name: 'Trimsamsa' },
    { code: 'D40', name: 'Khavedamsa' },
    { code: 'D45', name: 'Akshavedamsa' },
    { code: 'D60', name: 'Shastiamsa' }
  ];

  return (
    <div className="space-y-4">
      {/* Varga Selector - ProKerala Style Buttons */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {vargaButtons.map(varga => (
            <button
              key={varga.code}
              onClick={() => setSelectedVarga(varga.code)}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all
                ${selectedVarga === varga.code
                  ? 'bg-skyblue-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-300'
                }
              `}
              title={varga.name}
            >
              {varga.code}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Varga Chart - Same Parchment Style */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {vargaButtons.find(v => v.code === selectedVarga)?.name} Chart
        </h3>
        
        {chartStyle === 'south' ? (
          <SouthIndianChartParchment
            {...chartProps}
            divisionalChart={selectedVarga}
          />
        ) : (
          <NorthIndianChartParchment
            {...chartProps}
            divisionalChart={selectedVarga}
          />
        )}
      </div>
    </div>
  );
};
```

---

## 🎨 KEY DESIGN FEATURES (ProKerala Style)

### ✅ What We're Implementing

1. **Sky Blue Parchment Background**
   - Light blue cream texture (#E0F2FE)
   - Subtle aging spots in sky blue tones
   - Gradient from light to medium blue

2. **Violet Outer Border**
   - 4px thick violet border (#6366F1)
   - Alternating violet/sky blue pattern
   - Decorative corner brackets

3. **Sky Blue Grid Lines**
   - 2px sky blue internal lines (#0EA5E9)
   - Diagonal and orthogonal lines
   - Clean intersections

4. **Red House Numbers** (like ProKerala)
   - Small circles with light red background (#FEE2E2)
   - Bold red numbers (#DC2626)
   - Positioned at corners

5. **Dark Blue Planet Text**
   - 18px, semibold (#1E3A8A)
   - High contrast on sky blue background
   - Clear spacing for multiple planets

6. **Sky Blue Zodiac Signs**
   - 15px, medium weight (#0EA5E9)
   - 85% opacity
   - Positioned consistently

7. **Center Details**
   - Large Ganesh Om symbol (12% opacity, sky blue)
   - Date and time in dark blue
   - "Rasi" label in violet
   - Ascendant info

8. **ProKerala Watermark**
   - "Generated by 8Stro.com"
   - Bottom right corner
   - Small, subtle gray text

---

## 📊 VISUAL COMPARISON

### Before (Original Plan)
- ❌ No parchment texture
- ❌ Flat white background
- ❌ No house numbers
- ❌ Plain borders

### After (ProKerala Style with Sky Blue)
- ✅ Sky blue parchment texture
- ✅ Aged paper look
- ✅ Red house numbers in circles
- ✅ Violet/sky blue decorative borders
- ✅ Professional, traditional aesthetic

---

## 🚀 IMPLEMENTATION STEPS

### Step 1: Create Parchment CSS (15 min)
```bash
# Create new file
frontend/src/styles/parchment-skyblue.css

# Copy the CSS from Part 1 above
```

### Step 2: Update Chart Components (30 min)
```bash
# Update South Indian chart
frontend/src/components/charts/SouthIndianChartParchment.tsx

# Update North Indian chart (similar approach)
frontend/src/components/charts/NorthIndianChartParchment.tsx
```

### Step 3: Update Tab Selector (10 min)
```bash
# Update ChartsTab component
frontend/src/components/ChartsTab.tsx

# Change button style to ProKerala tabs
```

### Step 4: Update Vargas Panel (20 min)
```bash
# Update DivisionalChartsPanel
frontend/src/components/DivisionalChartsPanel.tsx

# Use same parchment style for all vargas
```

---

## ✅ TESTING CHECKLIST

### Visual Tests
- [ ] Sky blue parchment background visible
- [ ] Violet outer border (4px)
- [ ] Sky blue grid lines (2px)
- [ ] Red house numbers in circles
- [ ] Dark blue planet text (18px)
- [ ] Sky blue zodiac signs (15px)
- [ ] Ganesh Om symbol visible but subtle
- [ ] ProKerala watermark in corner
- [ ] Corner brackets visible

### Functional Tests
- [ ] Toggle between North/South/Vargas
- [ ] Zoom controls work
- [ ] All vargas display correctly
- [ ] House numbers positioned correctly
- [ ] Planet positions accurate

### Responsive Tests
- [ ] Parchment scales on mobile
- [ ] Text readable at all sizes
- [ ] Zoom doesn't break layout

---

## 📝 SUMMARY OF CHANGES

### Colors Updated
- **Background**: White → Sky Blue Parchment (#E0F2FE)
- **Border**: Plain → Violet with pattern (#6366F1)
- **Lines**: Plain → Sky Blue (#0EA5E9)
- **Text**: Black → Dark Blue (#1E3A8A)
- **House Numbers**: NEW - Red circles (#DC2626)

### Style Updated
- **Tabs**: Individual buttons → ProKerala-style connected tabs
- **Vargas**: Dropdown → Inline button grid
- **Charts**: All use same parchment background

### Features Added
- ✅ Parchment texture with aging spots
- ✅ Red house number circles
- ✅ Decorative corner brackets
- ✅ Ganesh Om watermark
- ✅ ProKerala-style watermark
- ✅ Zoom controls

---

**Ready for Antigravity deployment with ProKerala-inspired design in your sky blue theme!** 🎨
