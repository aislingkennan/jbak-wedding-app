import type { AttendanceType } from '@/lib/types';

interface TimelineItem {
  time: string;
  event: string;
}

interface Section {
  heading: string;
  items: TimelineItem[];
}

const nightBeforeSection: Section = {
  heading: 'The Night Before (optional) — Humphrey\'s Pub, Ranelagh',
  items: [
    { time: '7:00 PM', event: 'Join us for a toast at Humphrey\'s Pub, Ranelagh' },
  ],
};

const ceremonyDinnerSections: Section[] = [
  {
    heading: 'Ceremony — MoLI, St Stephen’s Green',
    items: [
      { time: '2:00 PM', event: 'Guests arrive' },
      { time: '2:30 PM', event: 'Ceremony begins' },
      { time: '3:10 PM', event: 'Drinks reception' },
    ],
  },
  {
    heading: 'Getting to Ashton’s',
    items: [
      { time: '4:00 PM', event: 'Bus departs MoLI' },
      { time: '4:45 PM', event: 'Arrive at Ashton’s, Rathmines' },
    ],
  },
  {
    heading: 'Dinner & Dancing — Ashton’s Pub, Rathmines',
    items: [
      { time: '5:15 PM', event: 'Welcome reception & speeches' },
      { time: '6:00 PM', event: 'Dinner is served' },
      { time: '8:30 PM', event: 'Dancing begins' },
      { time: '1:00 AM', event: 'Last orders' },
    ],
  },
];

const dinnerOnlySections: Section[] = [
  {
    heading: 'Dinner & Dancing — Ashton’s Pub, Rathmines',
    items: [
      { time: '4:45 PM', event: 'Guests arrive' },
      { time: '5:15 PM', event: 'Welcome reception & speeches' },
      { time: '6:00 PM', event: 'Dinner is served' },
      { time: '8:30 PM', event: 'Dancing begins' },
      { time: '1:00 AM', event: 'Last orders' },
    ],
  },
];

export default function Schedule({ attendanceType }: { attendanceType: AttendanceType }) {
  const sections = [
    nightBeforeSection,
    ...(attendanceType === 'Ceremony + Dinner' ? ceremonyDinnerSections : dinnerOnlySections),
  ];

  return (
    <div className="space-y-8">
      {sections.map((section) => (
        <div key={section.heading}>
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: '#8b7355' }}>
            {section.heading}
          </p>
          <div className="space-y-3">
            {section.items.map((item) => (
              <div key={item.time} className="flex gap-4">
                <span className="text-sm font-medium w-20 shrink-0 tabular-nums" style={{ color: '#c9a84c' }}>
                  {item.time}
                </span>
                <span className="text-sm text-gray-700">{item.event}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
