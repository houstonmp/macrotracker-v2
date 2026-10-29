// Outline icons for the stat tiles. They take the stroke colour as a prop rather than
// using currentColor, because the dark theme sets `color: white` on every element.
const StatIcon = ({ color, children }) =>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>

const HeartIcon = ({ color }) => <StatIcon color={color}>
    <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
    <path d="M3.2 12.5h4.3l1.5-3 2 6 1.5-3h8.3" />
</StatIcon>

const BoltIcon = ({ color }) => <StatIcon color={color}>
    <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
</StatIcon>

const TargetIcon = ({ color }) => <StatIcon color={color}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
</StatIcon>

const EggIcon = ({ color }) => <StatIcon color={color}>
    <path d="M12 22c4 0 7-3 7-7.5C19 9 16 2 12 2S5 9 5 14.5C5 19 8 22 12 22Z" />
    <circle cx="12" cy="14.5" r="3" />
</StatIcon>

const WheatIcon = ({ color }) => <StatIcon color={color}>
    <path d="M12 22V9" />
    <path d="M12 13c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Z" />
    <path d="M12 18c-2.5 0-4-1.5-4-4 2.5 0 4 1.5 4 4Zm0 0c2.5 0 4-1.5 4-4-2.5 0-4 1.5-4 4Z" />
    <path d="M12 9c-1.5-1.2-1.5-3.8 0-5 1.5 1.2 1.5 3.8 0 5Z" />
</StatIcon>

const DropIcon = ({ color }) => <StatIcon color={color}>
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5S12.5 5.5 12 3c-.5 2.5-2 4.9-4 6.5S5 13 5 15a7 7 0 0 0 7 7Z" />
</StatIcon>

// Card headers
const ScaleIcon = ({ color }) => <StatIcon color={color}>
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M7.5 9a6.5 6.5 0 0 1 9 0l-2 2.5a3.3 3.3 0 0 0-5 0Z" />
    <path d="M12 9.5v1" />
</StatIcon>

const BookIcon = ({ color }) => <StatIcon color={color}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    <path d="M9 7h6M9 11h4" />
</StatIcon>

const BasketIcon = ({ color }) => <StatIcon color={color}>
    <path d="m5 11 4-7M19 11l-4-7" />
    <path d="M2 11h20M3.5 11l1.6 7.4A2 2 0 0 0 7.1 20h9.8a2 2 0 0 0 2-1.6l1.6-7.4" />
    <path d="M9 15v1M15 15v1M12 15v1" />
</StatIcon>

const CalendarCheckIcon = ({ color }) => <StatIcon color={color}>
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <path d="m9 16 2 2 4-4" />
</StatIcon>

const FlagIcon = ({ color }) => <StatIcon color={color}>
    <path d="M4 22V4s1.5-1 4.5-1 4.5 2 7.5 2S20 4 20 4v11s-1 1-4 1-4.5-2-7.5-2S4 15 4 15" />
</StatIcon>

const TrendIcon = ({ color }) => <StatIcon color={color}>
    <path d="M3 3v16a2 2 0 0 0 2 2h16" />
    <path d="m7 14 4-4 3 3 5-6" />
</StatIcon>

const ChefHatIcon = ({ color }) => <StatIcon color={color}>
    <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.46.32-.84.73-1.04a4 4 0 0 0-2.14-7.59 5 5 0 0 0-9.18 0 4 4 0 0 0-2.14 7.59c.41.2.73.58.73 1.04V20a1 1 0 0 0 1 1Z" />
    <path d="M6 17h12" />
</StatIcon>

const AwardIcon = ({ color }) => <StatIcon color={color}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.5 13.2 17 22l-5-3-5 3 1.5-8.8" />
</StatIcon>

const GlassIcon = ({ color }) => <StatIcon color={color}>
    <path d="M5 3h14l-1.6 16.2A2 2 0 0 1 15.4 21H8.6a2 2 0 0 1-2-1.8Z" />
    <path d="M5.6 9h12.8" />
</StatIcon>

const BikeIcon = ({ color }) => <StatIcon color={color}>
    <circle cx="5.5" cy="17.5" r="3.5" />
    <circle cx="18.5" cy="17.5" r="3.5" />
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 11.5V14l-3-3 4-3 2 3h2" />
</StatIcon>

export { AwardIcon, GlassIcon, ChefHatIcon, TrendIcon, HeartIcon, BoltIcon, TargetIcon, EggIcon, WheatIcon, DropIcon, ScaleIcon, BookIcon, BasketIcon, CalendarCheckIcon, FlagIcon, BikeIcon };
