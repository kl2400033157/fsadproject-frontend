import { useMemo, useState } from 'react';
import './ActivityHeatmap.css';

/**
 * Enhanced ActivityHeatmap — Completely rewritten from scratch using SVG.
 * Follows exact user specification for pixel-perfect contribution graph.
 */
export default function ActivityHeatmap({ registrations = [] }) {
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });

  // CONSTANTS
  const CELL_SIZE = 13;
  const CELL_GAP = 3;
  const CELL_TOTAL = CELL_SIZE + CELL_GAP;
  const COLS = 53;
  const ROWS = 7;
  const LEFT_PADDING = 40;
  const TOP_PADDING = 25;
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const SVG_WIDTH = LEFT_PADDING + (COLS * CELL_TOTAL) + 20;
  const SVG_HEIGHT = TOP_PADDING + (ROWS * CELL_TOTAL) + 30;

  const COLORS = {
    0: '#1a1033',
    1: '#2d1b69',
    2: '#4c1d95',
    3: '#7c3aed',
    4: '#a78bfa'
  };

  // 1. Process registrations
  const activityMap = useMemo(() => {
    const map = {};
    registrations.forEach(reg => {
      if (reg.dateTime) {
        const dateKey = new Date(reg.dateTime).toISOString().split('T')[0];
        map[dateKey] = (map[dateKey] || 0) + 1;
      }
    });
    return map;
  }, [registrations]);

  // 2. Generate Grid and Month Metadata
  const { grid, months, totalActive, currentStreak } = useMemo(() => {
    const today = new Date();
    const resultGrid = [];
    let activeCount = 0;
    
    // Start date: 52 weeks ago, aligned to Sunday
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday

    const cursor = new Date(startDate);
    
    for (let w = 0; w < COLS; w++) {
      const week = [];
      for (let d = 0; d < ROWS; d++) {
        const dateKey = cursor.toISOString().split('T')[0];
        const count = activityMap[dateKey] || 0;
        if (count > 0) activeCount++;

        week.push({
            date: new Date(cursor),
            dateKey,
            count,
            level: count >= 4 ? 4 : count
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      resultGrid.push(week);
    }

    // Find the first week index where each month starts
    const monthPositions = [];
    let currentMonth = -1;
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    resultGrid.forEach((week, weekIndex) => {
      const firstDayOfWeek = week.find(d => d !== null);
      if (firstDayOfWeek) {
        const month = firstDayOfWeek.date.getMonth();
        if (month !== currentMonth) {
          currentMonth = month;
          monthPositions.push({ name: MONTH_NAMES[month], weekIndex });
        }
      }
    });

    // Streak logic
    let streak = 0;
    const sCursor = new Date();
    while (true) {
        const key = sCursor.toISOString().split('T')[0];
        if (activityMap[key]) {
            streak++;
            sCursor.setDate(sCursor.getDate() - 1);
        } else {
            if (streak === 0) {
                const yest = new Date();
                yest.setDate(yest.getDate() - 1);
                if (!activityMap[yest.toISOString().split('T')[0]]) break;
                sCursor.setDate(sCursor.getDate() - 1);
                continue;
            }
            break;
        }
    }

    return { grid: resultGrid, months: monthPositions, totalActive: activeCount, currentStreak: streak };
  }, [activityMap]);

  const handleMouseEnter = (e, day) => {
    const rect = e.target.getBoundingClientRect();
    const tooltipText = `${day.date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })} - ${day.count} webinars`;
    setTooltip({
      show: true,
      x: rect.left + window.scrollX + (CELL_SIZE / 2),
      y: rect.top + window.scrollY - 10,
      text: tooltipText
    });
  };

  return (
    <div className="activity-heatmap-wrapper card glass shadow-sm animate-fade-in" style={{ position: 'relative' }}>
      <div className="heatmap-header mb-4">
        <div className="heatmap-titles">
          <h3>Your Learning Activity</h3>
          <p className="text-muted">
            {totalActive} days active this year • <span className="streak-badge">🔥 {currentStreak} day streak</span>
          </p>
        </div>
      </div>

      <div className="heatmap-svg-scroll">
        <svg width={SVG_WIDTH} height={SVG_HEIGHT} className="heatmap-svg">
          {/* Month Labels */}
          {months.map((m, i) => (
            <text 
              key={i} 
              x={LEFT_PADDING + (m.weekIndex * CELL_TOTAL)} 
              y={TOP_PADDING - 10} 
              className="heatmap-label month-label"
              fontSize="10"
              fill="var(--text-muted)"
            >
              {m.name}
            </text>
          ))}

          {/* Day Labels */}
          {DAY_LABELS.map((label, i) => (
            <text 
              key={i} 
              x={LEFT_PADDING - 8} 
              y={TOP_PADDING + (i * CELL_TOTAL) + 10} 
              textAnchor="end"
              fontSize="10"
              fill="var(--text-muted)"
            >
              {label}
            </text>
          ))}

          {/* Grid Cells */}
          {grid.map((week, wIndex) => (
            <g key={wIndex}>
              {week.map((day, dIndex) => (
                <rect
                  key={dIndex}
                  x={LEFT_PADDING + (wIndex * CELL_TOTAL)}
                  y={TOP_PADDING + (dIndex * CELL_TOTAL)}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx="2"
                  fill={COLORS[day.level]}
                  className="heatmap-rect"
                  onMouseEnter={(e) => handleMouseEnter(e, day)}
                  onMouseLeave={() => setTooltip({ ...tooltip, show: false })}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Floating Tooltip Improvement */}
      {tooltip.show && (
        <div 
          className="heatmap-custom-tooltip"
          style={{ 
            position: 'fixed',
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          {tooltip.text}
        </div>
      )}

      <div className="heatmap-legend mt-4">
        <span className="text-xs">Less</span>
        <div className="legend-items">
            {[0, 1, 2, 3, 4].map(lvl => (
                <div key={lvl} className="heatmap-legend-cell" style={{ backgroundColor: COLORS[lvl] }}></div>
            ))}
        </div>
        <span className="text-xs">More</span>
      </div>
    </div>
  );
}
