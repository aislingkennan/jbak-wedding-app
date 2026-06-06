import type { AttendanceType } from '@/lib/types';

const gettingThereAnswers: Record<AttendanceType, string> = {
  'Ceremony + Dinner':
    "MoLI is on Stephen's Green, serviceable by bus or Luas (tram). Alternatively, taxis are easy to come by. We will organise transport from MoLI to Ashton's for guests, following a small reception in MoLI.",
  'Dinner':
    "Ashton's is a 20 min walk from Luas, or accessible by bus. There is a small amount of parking available at Ashton's.",
};

export default function FAQ({ attendanceType }: { attendanceType: AttendanceType }) {
  const faqs = [
    {
      question: 'RSVP deadline',
      answer: 'Please RSVP by June 25th.',
    },
    {
      question: 'Dress code',
      answer: 'Cocktail. No need to overthink it, just wear what makes you feel fancy and ready to dance.',
    },
    {
      question: 'Getting there',
      answer: gettingThereAnswers[attendanceType],
    },
    {
      question: 'Accommodation',
      answer: "For folks travelling outside of Dublin, there's plenty of hotels near Ranelagh or Ballsbridge which are close to both our locations. Alternatively, both locations are very close to Dublin City Centre, so centrally located hotels (near Stephen's Green) are also suitable. Let us know if you would like more specific recommendations.",
    },
    {
      question: 'The night before',
      answer: "We'll be having a toast to our last single night in Humphrey's Pub, Ranelagh, the night before our wedding (Sept 4th), from 7pm. Feel free to join us for one to send us off, but totally optional! Casual dress.",
    },
    {
      question: 'Children',
      answer:
        "Our wedding will be an adults-only affair—with a small exception for the tiniest guests under 3. If you need to bring your little one, please let us know in your RSVP so we can look after you both!",
    },
    {
      question: 'Any more questions?',
      answer: "Try Google, or alternatively Claude says he's been embedded in the wedding planning since early 2026 and has absorbed every detail. Claude says he is, at this point, more prepared for this wedding than the bride and groom. However, Claude cannot confirm whether Jack will cry during the vows, but statistically speaking, someone always does.",
    },
  ];
  return (
    <div className="space-y-2">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group border-b"
          style={{ borderColor: '#e8d9bf' }}
        >
          <summary
            className="flex items-center justify-between py-4 cursor-pointer list-none text-sm font-medium select-none"
            style={{ color: '#3d2c1e' }}
          >
            {faq.question}
            <span
              className="ml-4 shrink-0 text-xs transition-transform duration-200 group-open:rotate-180"
              style={{ color: '#c9a84c' }}
            >
              ▾
            </span>
          </summary>
          <p className="pb-4 text-sm leading-relaxed" style={{ color: '#6b5e4e' }}>
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
