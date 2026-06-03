import { getScoreColor } from '../../lib/utils';

export default function ScoreCircle({ score, label, size = 110, strokeWidth = 8 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = score !== null && score !== undefined
    ? circumference - (score / 100) * circumference
    : circumference;
  const color = getScoreColor(score);
  const display = score !== null && score !== undefined ? Math.round(score) : '–';
  const fontSize = size * 0.2;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="currentColor" strokeWidth={strokeWidth}
          className="text-gray-100 dark:text-gray-800" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s ease' }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fill={color}
          style={{
            transform: `rotate(90deg)`,
            transformOrigin: `${size/2}px ${size/2}px`,
            fontFamily: 'Sora, sans-serif',
            fontSize: `${fontSize}px`,
            fontWeight: '700',
          }}>
          {display}
        </text>
      </svg>
      {label && (
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 text-center">{label}</span>
      )}
    </div>
  );
}
