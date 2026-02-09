/** Mini progress pie chart for parent tasks (pure SVG for SSR compatibility) */
export function ProgressPie({ completed, total, size = 20 }: { completed: number; total: number; size?: number }) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const radius = (size / 2) - 3;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="shrink-0" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block">
                {/* Background circle (remaining) */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    className="stroke-muted-foreground/30"
                    strokeWidth="3"
                />
                {/* Progress circle (completed) */}
                {percentage > 0 && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        className="stroke-green-600"
                        strokeWidth="3"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                )}
            </svg>
        </div>
    );
}
