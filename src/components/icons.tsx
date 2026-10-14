import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 22, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconCalendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="4" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 8.5a6 6 0 1 0-12 0c0 4.2-1.5 5.5-1.5 5.5h15S18 12.7 18 8.5Z" />
    <path d="M10.3 18.5a2 2 0 0 0 3.4 0" />
  </Svg>
);

export const IconBack = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 5.5 16 12l-6.5 6.5" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 9.5 12 16l6.5-6.5" />
  </Svg>
);

export const IconMore = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="5.5" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.2" fill="currentColor" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5.5v13M5.5 12h13" />
  </Svg>
);

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 12h13" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12.8 9.6 17.5 19 7" />
  </Svg>
);

export const IconFlame = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3s4.5 3.6 4.5 8.2A4.5 4.5 0 0 1 12 15.7a4.5 4.5 0 0 1-4.5-4.5C7.5 6.6 12 3 12 3Z" />
    <path d="M12 21c3.9 0 6.5-2.4 6.5-5.6 0-.6-.1-1.2-.3-1.8M12 21c-3.9 0-6.5-2.4-6.5-5.6 0-.6.1-1.2.3-1.8" />
  </Svg>
);

export const IconDroplet = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5c3 3.6 5 6.2 5 9a5 5 0 0 1-10 0c0-2.8 2-5.4 5-9Z" />
    <path d="M9.5 13.4a2.5 2.5 0 0 0 3.2 2.4" />
  </Svg>
);

export const IconFootsteps = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7.6 4.6c1.3 0 2.2 1.1 2.2 2.6 0 1.1.3 1.9.5 2.7.3 1 .1 2-.9 2.4-1.3.5-2.9 0-3.6-1-.5-.8-.6-2-.4-3.4.2-1.9.6-3.3 2.2-3.3Z" />
    <path d="M6 15.6h3.9v1.9c0 .8-.9 1.5-2 1.5s-1.9-.7-1.9-1.5v-1.9ZM16.4 4.6c-1.3 0-2.2 1.1-2.2 2.6 0 1.1-.3 1.9-.5 2.7-.3 1-.1 2 .9 2.4 1.3.5 2.9 0 3.6-1 .5-.8.6-2 .4-3.4-.2-1.9-.6-3.3-2.2-3.3Z" />
    <path d="M18 15.6h-3.9v1.9c0 .8.9 1.5 2 1.5s1.9-.7 1.9-1.5v-1.9Z" />
  </Svg>
);

export const IconHeart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7.5-4.4-7.5-9.5A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.9c0 5.1-7.5 9.5-7.5 9.5Z" />
  </Svg>
);

export const IconPulse = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 12.5h4l2-5 3 10 2.5-6 1.7 3.5h5.8" />
  </Svg>
);

export const IconScale = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="4" />
    <path d="M8.5 12.6a3.5 3.5 0 0 1 7 0" />
    <path d="M12 12.6 14 9.1" />
  </Svg>
);

export const IconDumbbell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9v6M7 7.5v9M17 7.5v9M20 9v6M7 12h10" />
  </Svg>
);

export const IconYoga = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 8.5v4M12 12.5 7.5 20M12 12.5 16.5 20M6 10.5 12 9l6 1.5" />
  </Svg>
);

export const IconHome = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 10.6 12 4.5l8 6.1V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.4Z" />
    <path d="M9.7 20.5v-6h4.6v6" />
  </Svg>
);

export const IconGrid = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2.4" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2.4" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2.4" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2.4" />
  </Svg>
);

export const IconScan = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 8.5V6.5A2.5 2.5 0 0 1 6.5 4h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2A2.5 2.5 0 0 1 17.5 20h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2" />
    <path d="M7.5 12h9" />
  </Svg>
);

export const IconBag = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 8.5h14l-1 10.2a2 2 0 0 1-2 1.8H8a2 2 0 0 1-2-1.8L5 8.5Z" />
    <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
  </Svg>
);

export const IconCart = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 4.5h2.2l1.9 10.3a1.6 1.6 0 0 0 1.6 1.3h8.2a1.6 1.6 0 0 0 1.6-1.3l1.3-6.6H6.3" />
    <circle cx="9.5" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.8 20c.6-3.5 3.6-5.6 7.2-5.6s6.6 2.1 7.2 5.6" />
  </Svg>
);

export const IconChat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12.4c0 4-3.6 7-8 7-1 0-2-.2-2.9-.5L5 20.5l1.3-3.4A6.8 6.8 0 0 1 4 12.4c0-4 3.6-7 8-7s8 3 8 7Z" />
  </Svg>
);

export const IconVideo = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6.5" width="12.5" height="11" rx="3.5" />
    <path d="M15.5 11.6l4.2-2.7a.7.7 0 0 1 1.1.6v5a.7.7 0 0 1-1.1.6l-4.2-2.7v-.8Z" />
  </Svg>
);

export const IconStar = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 4.4 2.3 4.9 5.2.7-3.8 3.6.9 5.2-4.6-2.6-4.6 2.6.9-5.2L4.5 10l5.2-.7L12 4.4Z" />
  </Svg>
);

export const IconPin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s6.5-5.6 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.4" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <path d="M12 7.8V12l2.8 1.8" />
  </Svg>
);

export const IconShield = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.6 5.2 6.2v5.4c0 4.1 2.9 7.6 6.8 8.8 3.9-1.2 6.8-4.7 6.8-8.8V6.2L12 3.6Z" />
    <path d="m9.3 12 2 2 3.4-3.7" />
  </Svg>
);

export const IconVerified = (p: IconProps) => (
  <Svg {...p}>
    <path d="m12 3.6 2.3 1.6 2.8-.2.9 2.6 2.3 1.6-1 2.6 1 2.6-2.3 1.6-.9 2.6-2.8-.2L12 20.4l-2.3-1.6-2.8.2-.9-2.6-2.3-1.6 1-2.6-1-2.6 2.3-1.6.9-2.6 2.8.2L12 3.6Z" />
    <path d="m9.4 11.9 1.8 1.8 3.4-3.6" />
  </Svg>
);

export const IconNote = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 3.5h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2Z" />
    <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
  </Svg>
);

export const IconClipboard = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8.5 5H7a2 2 0 0 0-2 2v11.5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.5" />
    <rect x="8.5" y="3.5" width="7" height="3.4" rx="1.4" />
    <path d="M9.5 12h5M9.5 15.5h3" />
  </Svg>
);

export const IconUsers = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9.5" cy="8.5" r="3.3" />
    <path d="M3.8 19.5c.5-3 2.9-4.8 5.7-4.8s5.2 1.8 5.7 4.8" />
    <path d="M16 5.6a3.3 3.3 0 0 1 0 6.3M17.2 15.2c1.8.6 3 2.1 3.3 4.3" />
  </Svg>
);

export const IconTrend = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 16.5l4.5-5 3.4 2.8L20 6.5" />
    <path d="M15.6 6.5H20v4.3" />
  </Svg>
);

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.3" />
    <path d="m15.7 15.7 3.8 3.8" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6.5h16M7 12h10M10 17.5h4" />
  </Svg>
);

export const IconCardPay = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="3.5" />
    <path d="M3 10h18M6.5 14.5h3" />
  </Svg>
);

export const IconTruck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3.5 7.5h9v9h-9z" />
    <path d="M12.5 10.5h3.6l3 3v3h-6.6z" />
    <circle cx="7" cy="18.5" r="1.6" />
    <circle cx="16.5" cy="18.5" r="1.6" />
  </Svg>
);

export const IconLeaf = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 19c0-7.5 4.6-12.4 14-13-1 9.6-5.3 13.6-11.8 13.6H5Z" />
    <path d="M8 20c1.2-4.3 3.6-7.6 7.2-10" />
  </Svg>
);

export const IconSparkle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4.5l1.7 4.3 4.3 1.7-4.3 1.7L12 16.5l-1.7-4.3L6 10.5l4.3-1.7L12 4.5Z" />
    <path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z" />
  </Svg>
);

export const IconLock = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="3" />
    <path d="M8.5 10.5V8.2a3.5 3.5 0 0 1 7 0v2.3" />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 5.5H7.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7" />
    <path d="M13 12h7.5M17.8 8.8 21 12l-3.2 3.2" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4.5 12h14M13.5 7l5 5-5 5" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5.5 7.5h13M9 7.5V6a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 6v1.5" />
    <path d="M7 7.5l.8 11a2 2 0 0 0 2 1.9h4.4a2 2 0 0 0 2-1.9l.8-11" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.4a7.6 7.6 0 0 0 .1-4.8l-1.9-.5-.9-2.2 1-1.7a7.7 7.7 0 0 0-4.1-2.4l-1 1.7h-2.4L9.2 2.8A7.7 7.7 0 0 0 5 5.2l1 1.7-.9 2.2-1.9.5a7.6 7.6 0 0 0 .1 4.8l1.9.5.9 2.2-1 1.7a7.7 7.7 0 0 0 4.2 2.4l1-1.7h2.4l1 1.7a7.7 7.7 0 0 0 4.1-2.4l-1-1.7.9-2.2 1.9-.5Z" />
  </Svg>
);

export const IconSun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.8v2M12 19.2v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.8 12h2M19.2 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Svg>
);

export const IconWallet = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="6" width="18" height="13" rx="3.5" />
    <path d="M3 10.5h18M16.5 14.5h1.5" />
  </Svg>
);

export const IconListCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6.5h11M9 12h11M9 17.5h7" />
    <path d="m3.5 6.3 1.2 1.2 2-2.2M3.5 11.8l1.2 1.2 2-2.2M3.5 17.3l1.2 1.2 2-2.2" />
  </Svg>
);
