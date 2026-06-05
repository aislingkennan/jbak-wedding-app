const faqs = [
  {
    question: 'Dress code',
    answer:
      'Cocktail attire / semi-formal. Think elegant but comfortable — it\'s going to be a long and wonderful day!',
  },
  {
    question: 'Getting there',
    answer: 'Jack & Aisling will share transport details closer to the day.',
  },
  {
    question: 'Accommodation',
    answer: 'Recommendations coming soon.',
  },
  {
    question: 'Children',
    answer:
      'This is an adults-only celebration — but if you do need to bring a little one under 3, please let us know in your RSVP and we\'ll make sure you\'re looked after!',
  },
];

export default function FAQ() {
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
