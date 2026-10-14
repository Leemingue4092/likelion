type IconName = 'today' | 'calendar' | 'courses' | 'grades' | 'settings' | 'plus' | 'back' | 'close';

export function Icon({ name }: { name: IconName }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {name === 'today' && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.8 4.8l1.6 1.6M17.6 17.6l1.6 1.6M19.2 4.8l-1.6 1.6M6.4 17.6l-1.6 1.6" />
        </>
      )}
      {name === 'calendar' && (
        <>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
          <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
        </>
      )}
      {name === 'courses' && (
        <>
          <path d="M4 6.5h11.5A3.5 3.5 0 0 1 19 10v9.5H7.5A3.5 3.5 0 0 0 4 16z" />
          <path d="M8 6.5V5.2A2.2 2.2 0 0 1 10.2 3H19v13.2" />
        </>
      )}
      {name === 'grades' && <path d="M5 19V11M12 19V6M19 19v-7" />}
      {name === 'settings' && (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" />
          <circle className="knob" cx="8" cy="7" r="2.3" />
          <circle className="knob" cx="15" cy="12" r="2.3" />
          <circle className="knob" cx="10" cy="17" r="2.3" />
        </>
      )}
      {name === 'plus' && <path d="M12 5v14M5 12h14" />}
      {name === 'back' && <path d="M15 5 8 12l7 7" />}
      {name === 'close' && <path d="M6 6l12 12M18 6 6 18" />}
    </svg>
  );
}
