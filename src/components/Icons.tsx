import React from 'react';
import Svg, { Path, Circle, Rect, Line, Polyline, Ellipse, Polygon } from 'react-native-svg';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

const D = (p: IconProps) => ({
  width: p.size ?? 24,
  height: p.size ?? 24,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: p.color ?? '#7C6FCD',
  strokeWidth: p.strokeWidth ?? 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const HomeIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Polyline points="9 22 9 12 15 12 15 22" /></Svg>
);
export const InfoIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="12" cy="12" r="10" /><Line x1="12" y1="16" x2="12" y2="12" /><Line x1="12" y1="8" x2="12.01" y2="8" /></Svg>
);
export const UsersIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><Circle cx="9" cy="7" r="4" /><Path d="M23 21v-2a4 4 0 0 0-3-3.87" /><Path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg>
);
export const MailIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><Polyline points="22,6 12,13 2,6" /></Svg>
);
export const PawIcon = (p: IconProps) => (
  <Svg {...D(p)}>
    <Ellipse cx="9" cy="5" rx="1.8" ry="2.2" />
    <Ellipse cx="15" cy="5" rx="1.8" ry="2.2" />
    <Ellipse cx="5.5" cy="10" rx="1.4" ry="1.8" />
    <Ellipse cx="18.5" cy="10" rx="1.4" ry="1.8" />
    <Path d="M8 14c.5-2 1.8-3 4-3s3.5 1 4 3l.8 3c.3.9-.3 1.8-1.2 2a1.8 1.8 0 0 1-2-1l-.4-.8a1.3 1.3 0 0 0-2.4 0l-.4.8a1.8 1.8 0 0 1-2 1c-1-.2-1.5-1.1-1.2-2L8 14z" />
  </Svg>
);
export const ShieldCheckIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><Polyline points="9 12 11 14 15 10" /></Svg>
);
export const HeartIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" /></Svg>
);
export const StarIcon = (p: IconProps) => (
  <Svg {...D(p)}><Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Svg>
);
export const MapPinIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><Circle cx="12" cy="10" r="3" /></Svg>
);
export const CalendarIcon = (p: IconProps) => (
  <Svg {...D(p)}><Rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><Line x1="16" y1="2" x2="16" y2="6" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" /></Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...D(p)}><Polyline points="20 6 9 17 4 12" /></Svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...D(p)}><Polyline points="9 18 15 12 9 6" /></Svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...D(p)}><Polyline points="15 18 9 12 15 6" /></Svg>
);
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...D(p)}><Line x1="5" y1="12" x2="19" y2="12" /><Polyline points="12 5 19 12 12 19" /></Svg>
);
export const WalkIcon = (p: IconProps) => (
  <Svg {...D(p)}>
    <Ellipse cx="9" cy="5" rx="1.8" ry="2.2" />
    <Ellipse cx="15" cy="5" rx="1.8" ry="2.2" />
    <Ellipse cx="5.5" cy="10" rx="1.4" ry="1.8" />
    <Ellipse cx="18.5" cy="10" rx="1.4" ry="1.8" />
    <Path d="M8 14c.5-2 1.8-3 4-3s3.5 1 4 3l.8 3c.3.9-.3 1.8-1.2 2a1.8 1.8 0 0 1-2-1l-.4-.8a1.3 1.3 0 0 0-2.4 0l-.4.8a1.8 1.8 0 0 1-2 1c-1-.2-1.5-1.1-1.2-2L8 14z" />
  </Svg>
);
export const HomeHeartIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Path d="M9 22V13h6v9" /></Svg>
);
export const AwardIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="12" cy="8" r="5.5" /><Path d="M15.5 13.2L17 22l-5-3-5 3 1.5-8.8" /></Svg>
);
export const ScissorsIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="6" cy="6" r="2.5" /><Circle cx="6" cy="18" r="2.5" /><Path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" /></Svg>
);
export const TruckIcon = (p: IconProps) => (
  <Svg {...D(p)}><Rect x="1" y="3" width="15" height="13" rx="1" /><Path d="M16 8h4l3 3v5h-7V8z" /><Circle cx="5.5" cy="18.5" r="2.5" /><Circle cx="18.5" cy="18.5" r="2.5" /></Svg>
);
export const PlusCircleIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="12" cy="12" r="10" /><Line x1="12" y1="8" x2="12" y2="16" /><Line x1="8" y1="12" x2="16" y2="12" /></Svg>
);
export const CameraIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><Circle cx="12" cy="13" r="4" /></Svg>
);
export const ShareIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" /><Line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><Line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></Svg>
);
export const TrendingUpIcon = (p: IconProps) => (
  <Svg {...D(p)}><Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><Polyline points="17 6 23 6 23 12" /></Svg>
);
export const ZapIcon = (p: IconProps) => (
  <Svg {...D(p)}><Polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Svg>
);
export const GlobeIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="12" cy="12" r="10" /><Line x1="2" y1="12" x2="22" y2="12" /><Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></Svg>
);
export const LockIcon = (p: IconProps) => (
  <Svg {...D(p)}><Rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><Path d="M7 11V7a5 5 0 0 1 10 0v4" /></Svg>
);
export const StoreIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M3 9l1-6h16l1 6" /><Path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" /><Path d="M5 21V9M19 9v12H9V9" /><Rect x="9" y="15" width="4" height="6" rx="0.5" /></Svg>
);
export const SunIcon = (p: IconProps) => (
  <Svg {...D(p)}><Circle cx="12" cy="12" r="5" /><Line x1="12" y1="1" x2="12" y2="3" /><Line x1="12" y1="21" x2="12" y2="23" /><Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><Line x1="1" y1="12" x2="3" y2="12" /><Line x1="21" y1="12" x2="23" y2="12" /><Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></Svg>
);
export const EyeIcon = (p: IconProps) => (
  <Svg {...D(p)}><Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><Circle cx="12" cy="12" r="3" /></Svg>
);
