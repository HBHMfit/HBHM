import { useState, useEffect } from 'react';
import { supabase } from './supabase';

// ── SCREENS ────────────────────────────────────────────
const S = {
  LOADING: 'loading',
  AUTH: 'auth',
  WELCOME: 'welcome',
  ONBOARDING_1: 'onboarding_1',
  ONBOARDING_2: 'onboarding_2',
  ONBOARDING_BODY: 'onboarding_body',
  ONBOARDING_3: 'onboarding_3',
  PAYMENT: 'payment',
  APPLE_WATCH: 'apple_watch',
  DASHBOARD: 'dashboard',
  WORKOUT: 'workout',
  EXERCISE_DEMO: 'exercise_demo',
  COACH: 'coach',
  NUTRITION: 'nutrition',
  LEADERBOARD: 'leaderboard',
  PROGRESS: 'progress',
};

// ── COLORS ─────────────────────────────────────────────
const C = {
  navy: '#0D1117', navyMid: '#141B26', navyLight: '#1C2535',
  border: '#2A3447', silver: '#C0C8D8', silverBright: '#E8ECF4',
  silverDim: '#6B7280', blue: '#3B82F6', blueDark: '#1D4ED8',
  white: '#FFFFFF', success: '#22C55E', warning: '#F59E0B', danger: '#EF4444',
};

// ── HBHM LOGO ──────────────────────────────────────────
function HBHMLogo({ size = 80, animate = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none"
      style={animate ? { animation: 'pulse 2s ease-in-out infinite' } : {}}>
      <line x1="8" y1="36" x2="28" y2="36" stroke="#C0C8D8" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1="5" y1="43" x2="25" y2="43" stroke="#C0C8D8" strokeWidth="3" strokeLinecap="round"/>
      <line x1="8" y1="50" x2="26" y2="50" stroke="#C0C8D8" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="70" cy="18" r="9" fill="#C0C8D8"/>
      <line x1="67" y1="27" x2="52" y2="50" stroke="#C0C8D8" strokeWidth="6" strokeLinecap="round"/>
      <line x1="62" y1="33" x2="44" y2="26" stroke="#C0C8D8" strokeWidth="5" strokeLinecap="round"/>
      <line x1="60" y1="40" x2="76" y2="34" stroke="#C0C8D8" strokeWidth="5" strokeLinecap="round"/>
      <line x1="52" y1="50" x2="42" y2="68" stroke="#C0C8D8" strokeWidth="6" strokeLinecap="round"/>
      <line x1="42" y1="68" x2="50" y2="82" stroke="#C0C8D8" strokeWidth="5" strokeLinecap="round"/>
      <line x1="52" y1="50" x2="68" y2="60" stroke="#C0C8D8" strokeWidth="6" strokeLinecap="round"/>
      <line x1="68" y1="60" x2="82" y2="52" stroke="#C0C8D8" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );
}

function SkellyAvatar({ size = 48, animate = false }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #141B26, #1C2535)',
      border: `1.5px solid ${C.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: animate ? 'pulse 2s ease-in-out infinite' : undefined,
    }}>
      <HBHMLogo size={size * 0.68} />
    </div>
  );
}

// ── SHARED ─────────────────────────────────────────────
function PhaseTag({ phase }) {
  const d = {
    1: { label: 'PHASE 1 · RESTORE', color: C.success },
    2: { label: 'PHASE 2 · CONDITION', color: C.warning },
    3: { label: 'PHASE 3 · STRENGTHEN', color: C.danger },
  }[phase];
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5,
      color: d.color, background: d.color + '20',
      padding: '3px 10px', borderRadius: 20, border: `1px solid ${d.color}40`,
    }}>{d.label}</span>
  );
}

function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: S.DASHBOARD, icon: '⚡', label: 'Home' },
    { id: S.WORKOUT, icon: '💪', label: 'Workout' },
    { id: S.COACH, icon: '💀', label: 'Coach' },
    { id: S.NUTRITION, icon: '🥗', label: 'Nutrition' },
    { id: S.LEADERBOARD, icon: '🏆', label: 'Ranks' },
  ];
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430, background: C.navy,
      borderTop: `1px solid ${C.navyLight}`,
      display: 'flex', justifyContent: 'space-around', padding: '10px 0 22px', zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          color: screen === t.id ? C.blue : C.silverDim,
        }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600 }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── LOADING ────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', background: C.navy,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
    }}>
      <HBHMLogo size={80} animate />
      <div style={{ fontSize: 11, color: C.silverDim, letterSpacing: 3 }}>LOADING...</div>
    </div>
  );
}

// ── AUTH ───────────────────────────────────────────────
function AuthScreen({ setScreen, setUser }) {
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 15,
    background: C.navyLight, border: `1.5px solid ${C.border}`,
    color: C.silverBright, outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = async () => {
    setError(''); setLoading(true);
    try {
      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        });
        if (err) throw err;
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id, full_name: name, email,
            phase: 1, streak: 0, points: 0, created_at: new Date().toISOString(),
          });
          setUser(data.user);
          setScreen(S.WELCOME);
        }
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        setUser(data.user);
        setScreen(S.DASHBOARD);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <HBHMLogo size={70} />
        </div>
        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 6, color: C.silverBright }}>HBHM</div>
        <div style={{ fontSize: 11, letterSpacing: 3, color: C.silverDim, marginTop: 4 }}>HEALTHY BODY HEALTHY MIND</div>
      </div>

      <div style={{ display: 'flex', background: C.navyLight, borderRadius: 12, padding: 4, marginBottom: 28 }}>
        {['signup', 'signin'].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: mode === m ? C.blue : 'transparent',
            color: mode === m ? '#fff' : C.silverDim,
            fontSize: 14, fontWeight: 700,
          }}>{m === 'signup' ? 'Sign Up' : 'Sign In'}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {mode === 'signup' && (
          <div>
            <div style={{ fontSize: 11, color: C.silverDim, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>YOUR NAME</div>
            <input style={inputStyle} placeholder="First name" value={name} onChange={e => setName(e.target.value)}/>
          </div>
        )}
        <div>
          <div style={{ fontSize: 11, color: C.silverDim, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>EMAIL</div>
          <input style={inputStyle} placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} type="email"/>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.silverDim, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>PASSWORD</div>
          <input style={inputStyle} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} type="password"/>
        </div>
      </div>

      {error && (
        <div style={{ background: `${C.danger}15`, border: `1px solid ${C.danger}40`, borderRadius: 10, padding: 12, marginTop: 16, fontSize: 13, color: C.danger }}>
          {error}
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading} style={{
        width: '100%', marginTop: 24, padding: '16px 0',
        background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        border: 'none', borderRadius: 14, cursor: 'pointer',
        color: '#fff', fontSize: 15, fontWeight: 800,
        opacity: loading ? 0.7 : 1,
      }}>{loading ? 'Please wait...' : mode === 'signup' ? 'CREATE ACCOUNT' : 'SIGN IN'}</button>

      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: C.silverDim }}>
        {mode === 'signup' ? '$5/week · Cancel anytime · You only get one body' : 'Welcome back. Let\'s get to work.'}
      </div>
    </div>
  );
}

// ── WELCOME ────────────────────────────────────────────
const WELCOME_SLIDES = [
  { icon: null, title: 'Welcome to HBHM.', body: "I'm Coach Skelly. Before you take another step, I need you to understand something — you only get one body. What you do with it every single day is your choice. I'm here to make sure you choose right.", cta: "I'M READY →" },
  { icon: '💀', title: "I don't do easy.", body: "This isn't a workout app where you show up when you feel like it. Every day you will log your non-negotiables. Every day you will log your food. Every day you will show me your body. No exceptions. No excuses.", cta: 'UNDERSTOOD →' },
  { icon: null, title: 'Phase 1 — Restore.', body: "Everyone starts here. I don't care if you played college ball or haven't worked out in years. Your body has damage you don't even know about. We fix that first. Rushing to Phase 3 is how people get hurt and quit.", cta: 'MAKES SENSE →' },
  { icon: '📋', title: 'Your Daily Non-Negotiables.', body: '50 Push-ups · 10 Chin-ups · 10 Pull-ups\n25 Sit-ups · 25 Crunches · 25 V-Sits\n25 Side Planks each side\n50 Calf Raises · 50 Squats\n\nEvery. Single. Day. This is where discipline starts.', cta: "I'LL DO IT →", highlight: true },
  { icon: '🏆', title: 'Earn everything.', body: 'Phase 2 is earned. Phase 3 is earned. Top 5 on the leaderboard each month earn a free HBHM compression shirt. Log your workouts, log your food, show me your body. I\'ll tell you when you\'re ready.', cta: "LET'S BUILD →" },
];

function WelcomeScreen({ setScreen }) {
  const [slide, setSlide] = useState(0);
  const current = WELCOME_SLIDES[slide];
  const isLast = slide === WELCOME_SLIDES.length - 1;
  const next = () => isLast ? setScreen(S.ONBOARDING_1) : setSlide(s => s + 1);

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', flexDirection: 'column', padding: '60px 28px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 40, justifyContent: 'center' }}>
        {WELCOME_SLIDES.map((_, i) => (
          <div key={i} style={{ height: 4, borderRadius: 2, transition: 'all 0.3s', width: i === slide ? 24 : 8, background: i === slide ? C.blue : i < slide ? C.silverDim : C.border }}/>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'linear-gradient(135deg, #141B26, #1C2535)',
          border: `2px solid ${C.blue}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 40px ${C.blue}20`, animation: 'pulse 2s ease-in-out infinite',
        }}>
          {current.icon ? <span style={{ fontSize: 44 }}>{current.icon}</span> : <HBHMLogo size={68} />}
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 12, textAlign: 'center' }}>COACH SKELLY</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.silverBright, lineHeight: 1.2, marginBottom: 20, textAlign: 'center' }}>{current.title}</div>
        <div style={{ background: current.highlight ? `${C.blue}10` : C.navyLight, border: `1px solid ${current.highlight ? C.blue + '40' : C.border}`, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 14, color: C.silver, lineHeight: 1.9, whiteSpace: 'pre-line', textAlign: current.highlight ? 'center' : 'left' }}>{current.body}</div>
        </div>
      </div>
      <button onClick={next} style={{
        width: '100%', marginTop: 28, padding: '17px 0',
        background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        border: 'none', borderRadius: 14, cursor: 'pointer',
        color: '#fff', fontSize: 15, fontWeight: 800,
      }}>{current.cta}</button>
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: C.silverDim }}>{slide + 1} of {WELCOME_SLIDES.length}</div>
    </div>
  );
}

// ── ONBOARDING ─────────────────────────────────────────
function Onboarding1({ setScreen }) {
  const [sel, setSel] = useState(null);
  const opts = [
    { id: 'beginner', label: 'Just starting out', sub: 'Little to no exercise routine' },
    { id: 'some', label: 'Some experience', sub: 'I work out occasionally' },
    { id: 'active', label: 'Regularly active', sub: '3–5x per week' },
    { id: 'athlete', label: 'Athlete / Advanced', sub: 'High performance training' },
  ];
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i === 1 ? C.blue : C.border }}/>)}
      </div>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>ASSESSMENT · 1 OF 4</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <SkellyAvatar size={50} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.silverBright }}>Where are you right now?</div>
          <div style={{ fontSize: 13, color: C.silverDim, marginTop: 4 }}>Be honest — Coach Skelly will know.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {opts.map(o => (
          <button key={o.id} onClick={() => setSel(o.id)} style={{
            padding: '16px 20px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
            background: sel === o.id ? `${C.blue}20` : C.navyLight,
            border: `1.5px solid ${sel === o.id ? C.blue : C.border}`,
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.silverBright }}>{o.label}</div>
            <div style={{ fontSize: 12, color: C.silverDim, marginTop: 2 }}>{o.sub}</div>
          </button>
        ))}
      </div>
      <button onClick={() => sel && setScreen(S.ONBOARDING_2)} style={{
        width: '100%', marginTop: 32, padding: '16px 0',
        background: sel ? 'linear-gradient(135deg, #1D4ED8, #3B82F6)' : C.border,
        border: 'none', borderRadius: 14, cursor: sel ? 'pointer' : 'default',
        color: sel ? '#fff' : C.silverDim, fontSize: 15, fontWeight: 800,
      }}>NEXT →</button>
    </div>
  );
}

function Onboarding2({ setScreen }) {
  const [sel, setSel] = useState([]);
  const goals = ['Lose weight', 'Build muscle', 'More energy', 'Fix injuries', 'Better flexibility', 'Mental clarity', 'Run farther', 'Get stronger'];
  const toggle = g => setSel(s => s.includes(g) ? s.filter(x => x !== g) : [...s, g]);
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= 2 ? C.blue : C.border }}/>)}
      </div>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>ASSESSMENT · 2 OF 4</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <SkellyAvatar size={50} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.silverBright }}>What are your goals?</div>
          <div style={{ fontSize: 13, color: C.silverDim, marginTop: 4 }}>Pick all that apply.</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        {goals.map(g => (
          <button key={g} onClick={() => toggle(g)} style={{
            padding: '10px 16px', borderRadius: 24, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            background: sel.includes(g) ? `${C.blue}25` : C.navyLight,
            border: `1.5px solid ${sel.includes(g) ? C.blue : C.border}`,
            color: sel.includes(g) ? C.silverBright : C.silverDim,
          }}>{g}</button>
        ))}
      </div>
      <button onClick={() => sel.length && setScreen(S.ONBOARDING_BODY)} style={{
        width: '100%', marginTop: 36, padding: '16px 0',
        background: sel.length ? 'linear-gradient(135deg, #1D4ED8, #3B82F6)' : C.border,
        border: 'none', borderRadius: 14, cursor: sel.length ? 'pointer' : 'default',
        color: sel.length ? '#fff' : C.silverDim, fontSize: 15, fontWeight: 800,
      }}>NEXT →</button>
    </div>
  );
}

function OnboardingBodyMap({ setScreen }) {
  const parts = [
    { id: 'neck', label: 'Neck' }, { id: 'shoulders', label: 'Shoulders' },
    { id: 'chest', label: 'Chest' }, { id: 'upper_back', label: 'Upper Back' },
    { id: 'lower_back', label: 'Lower Back' }, { id: 'core', label: 'Core / Abs' },
    { id: 'hips', label: 'Hips / Glutes' }, { id: 'quads', label: 'Quads' },
    { id: 'hamstrings', label: 'Hamstrings' }, { id: 'knees', label: 'Knees' },
    { id: 'calves', label: 'Calves' }, { id: 'ankles', label: 'Ankles / Feet' },
  ];
  const [sel, setSel] = useState([]);
  const toggle = id => setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= 3 ? C.blue : C.border }}/>)}
      </div>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>ASSESSMENT · 3 OF 4</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <SkellyAvatar size={50} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.silverBright }}>Where do you feel pain or tightness?</div>
          <div style={{ fontSize: 12, color: C.silverDim, marginTop: 4 }}>Coach Skelly targets these in Phase 1.</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.warning, marginBottom: 14 }}>⚠ Tap all that apply</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {parts.map(p => {
          const on = sel.includes(p.id);
          return (
            <button key={p.id} onClick={() => toggle(p.id)} style={{
              padding: '12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              background: on ? '#EF444415' : C.navyLight,
              border: `1.5px solid ${on ? C.danger : C.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: on ? C.danger : C.border, boxShadow: on ? `0 0 8px ${C.danger}80` : 'none' }}/>
              <span style={{ fontSize: 13, fontWeight: 700, color: on ? C.silverBright : C.silver }}>{p.label}</span>
            </button>
          );
        })}
      </div>
      {sel.length > 0 && (
        <div style={{ background: '#EF444410', border: '1px solid #EF444430', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', gap: 10 }}>
          <SkellyAvatar size={32} />
          <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.6 }}>
            "Got it. I'll prioritize <strong style={{ color: C.silverBright }}>{sel.map(id => parts.find(b => b.id === id)?.label).join(', ')}</strong> in your Phase 1 program."
          </div>
        </div>
      )}
      <button onClick={() => setScreen(S.ONBOARDING_3)} style={{
        width: '100%', padding: '16px 0',
        background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        border: 'none', borderRadius: 14, cursor: 'pointer',
        color: '#fff', fontSize: 15, fontWeight: 800,
      }}>{sel.length > 0 ? 'BUILD MY PROGRAM →' : 'SKIP →'}</button>
    </div>
  );
}

function Onboarding3({ setScreen }) {
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 3, flex: 1, borderRadius: 2, background: C.blue }}/>)}
      </div>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>ASSESSMENT · 4 OF 4</div>
      <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
        <SkellyAvatar size={90} animate />
        <div style={{ fontSize: 24, fontWeight: 800, color: C.silverBright, marginTop: 16, lineHeight: 1.3 }}>Coach Skelly has<br/>assessed your body.</div>
        <div style={{ fontSize: 14, color: C.silverDim, marginTop: 10, lineHeight: 1.7 }}>
          Doesn't matter where you think you are.<br/>
          Everyone starts at <span style={{ color: C.success, fontWeight: 700 }}>Phase 1 — Restore.</span><br/>
          <span style={{ fontSize: 12, fontStyle: 'italic' }}>Earn Phase 3. No shortcuts.</span>
        </div>
      </div>
      <div style={{ background: C.navyLight, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>YOUR PHASE 1 FOCUS</div>
        {['Full-body stretching & mobility', 'Low-impact conditioning', 'Bodyweight fundamentals', 'Daily accountability check-ins', 'Nutrition coaching & logging'].map(item => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success, flexShrink: 0 }}/>
            <span style={{ fontSize: 13, color: C.silver }}>{item}</span>
          </div>
        ))}
      </div>
      <button onClick={() => setScreen(S.PAYMENT)} style={{
        width: '100%', padding: '16px 0',
        background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        border: 'none', borderRadius: 14, cursor: 'pointer',
        color: '#fff', fontSize: 15, fontWeight: 800,
      }}>LET'S GO — $5/WEEK →</button>
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: C.silverDim }}>Cancel anytime · You only get one body</div>
    </div>
  );
}

// ── PAYMENT ────────────────────────────────────────────
function PaymentScreen({ setScreen }) {
  const [cardNum, setCardNum] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const inp = { width: '100%', padding: '14px 16px', borderRadius: 12, fontSize: 15, background: C.navyLight, border: `1.5px solid ${C.border}`, color: C.silverBright, outline: 'none', boxSizing: 'border-box' };
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>UNLOCK HBHM</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: C.silverBright, marginBottom: 6 }}>Start your journey</div>
      <div style={{ fontSize: 13, color: C.silverDim, marginBottom: 28 }}>$5/week. Cancel anytime. You only get one body.</div>
      <div style={{ background: 'linear-gradient(135deg, #1C3A6B, #0D2040)', borderRadius: 16, padding: 20, marginBottom: 28, border: '1px solid #1D4ED840', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: C.silverDim, letterSpacing: 1 }}>WEEKLY PLAN</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: C.white }}>$5<span style={{ fontSize: 14, fontWeight: 400, color: C.silverDim }}>/week</span></div>
          <div style={{ fontSize: 12, color: C.silver, marginTop: 2 }}>Low risk. High reward.</div>
        </div>
        <SkellyAvatar size={60} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, color: C.silverDim, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>CARD NUMBER</div>
          <input style={inp} placeholder="1234 5678 9012 3456" value={cardNum} onChange={e => setCardNum(e.target.value)} maxLength={19}/>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.silverDim, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>EXPIRY</div>
            <input style={inp} placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} maxLength={5}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: C.silverDim, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>CVV</div>
            <input style={inp} placeholder="•••" value={cvv} onChange={e => setCvv(e.target.value)} maxLength={3}/>
          </div>
        </div>
      </div>
      <button onClick={() => setScreen(S.APPLE_WATCH)} style={{
        width: '100%', marginTop: 28, padding: '16px 0',
        background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        border: 'none', borderRadius: 14, cursor: 'pointer',
        color: '#fff', fontSize: 15, fontWeight: 800,
      }}>START FOR $5/WEEK</button>
      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: C.silverDim }}>🔒 Secured · Charged weekly · Cancel anytime</div>
    </div>
  );
}

// ── APPLE WATCH ────────────────────────────────────────
function AppleWatchScreen({ setScreen }) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const connect = () => { setConnecting(true); setTimeout(() => { setConnecting(false); setConnected(true); }, 2000); };
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '60px 24px 40px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⌚</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: C.silverBright, marginBottom: 8 }}>Connect Apple Watch</div>
        <div style={{ fontSize: 14, color: C.silverDim, lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
          Sync workouts, heart rate, and activity directly with HBHM.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {[
          { icon: '❤️', label: 'Heart Rate Monitoring', sub: 'Real-time during workouts' },
          { icon: '🏃', label: 'Workout Auto-Detection', sub: 'Logs activity automatically' },
          { icon: '🔥', label: 'Calories Burned', sub: 'Syncs with your nutrition log' },
          { icon: '💤', label: 'Recovery Tracking', sub: 'Sleep & HRV data for Coach Skelly' },
        ].map(item => (
          <div key={item.label} style={{ background: C.navyLight, borderRadius: 14, padding: '14px 16px', border: `1px solid ${connected ? C.success + '40' : C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 24 }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.silverBright }}>{item.label}</div>
              <div style={{ fontSize: 12, color: C.silverDim }}>{item.sub}</div>
            </div>
            {connected && <div style={{ color: C.success, fontSize: 18 }}>✓</div>}
          </div>
        ))}
      </div>
      {!connected ? (
        <>
          <button onClick={connect} disabled={connecting} style={{ width: '100%', padding: '16px 0', background: connecting ? C.navyLight : 'linear-gradient(135deg, #1D4ED8, #3B82F6)', border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 800 }}>
            {connecting ? 'Connecting...' : 'CONNECT APPLE WATCH'}
          </button>
          <button onClick={() => setScreen(S.DASHBOARD)} style={{ width: '100%', marginTop: 12, padding: '14px 0', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 14, cursor: 'pointer', color: C.silverDim, fontSize: 14, fontWeight: 600 }}>Skip for now</button>
        </>
      ) : (
        <>
          <div style={{ background: `${C.success}15`, border: `1px solid ${C.success}40`, borderRadius: 14, padding: 16, textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.success }}>Apple Watch Connected!</div>
          </div>
          <button onClick={() => setScreen(S.DASHBOARD)} style={{ width: '100%', padding: '16px 0', background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', border: 'none', borderRadius: 14, cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 800 }}>ENTER HBHM →</button>
        </>
      )}
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────
function DashboardScreen({ setScreen, user, profile }) {
  const NONNEG = [
    { id: 'pushups', label: 'Push-ups', target: 50, unit: 'reps' },
    { id: 'chinups', label: 'Chin-ups', target: 10, unit: 'reps' },
    { id: 'pullups', label: 'Pull-ups', target: 10, unit: 'reps' },
    { id: 'situps', label: 'Sit-ups', target: 25, unit: 'reps' },
    { id: 'crunches', label: 'Crunches', target: 25, unit: 'reps' },
    { id: 'vsits', label: 'V-Sits', target: 25, unit: 'reps' },
    { id: 'sideplanks', label: 'Side Planks', target: 25, unit: 'each side' },
    { id: 'calfraises', label: 'Calf Raises', target: 50, unit: 'reps' },
    { id: 'squats', label: 'Squats', target: 50, unit: 'reps' },
  ];
  const [checked, setChecked] = useState({});
  const toggle = id => setChecked(c => ({ ...c, [id]: !c[id] }));
  const doneCount = Object.values(checked).filter(Boolean).length;
  const allDone = doneCount === NONNEG.length;
  const firstName = profile?.full_name?.split(' ')[0]?.toUpperCase() || user?.email?.split('@')[0]?.toUpperCase() || 'ATHLETE';

  return (
    <div style={{ minHeight: '100vh', background: C.navy, paddingBottom: 100 }}>
      <div style={{ padding: '54px 24px 20px', background: `linear-gradient(180deg, ${C.navyMid}, ${C.navy})` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: C.silverDim, fontWeight: 600 }}>Good morning,</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: C.silverBright, letterSpacing: 1 }}>{firstName}</div>
            <div style={{ marginTop: 6 }}><PhaseTag phase={profile?.phase || 1} /></div>
          </div>
          <div style={{ position: 'relative' }}>
            <SkellyAvatar size={64} />
            <div style={{ position: 'absolute', bottom: -4, right: -4, background: allDone ? C.success : C.warning, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800, border: `2px solid ${C.navy}` }}>
              {allDone ? '✓' : doneCount}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ fontSize: 32 }}>🔥</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.white }}>{profile?.streak || 0}</div>
            <div style={{ fontSize: 11, color: C.silverDim }}>day streak</div>
          </div>
          <div style={{ flex: 1, background: `${C.success}10`, border: `1px solid ${C.success}30`, borderRadius: 16, padding: '14px 16px', cursor: 'pointer' }} onClick={() => setScreen(S.APPLE_WATCH)}>
            <div style={{ fontSize: 32 }}>⌚</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.success }}>Connect</div>
            <div style={{ fontSize: 11, color: C.silverDim }}>Apple Watch</div>
          </div>
          <div style={{ flex: 1, background: `${C.warning}10`, border: `1px solid ${C.warning}30`, borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ fontSize: 32 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: C.white }}>{profile?.points || 0}</div>
            <div style={{ fontSize: 11, color: C.silverDim }}>points</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: C.silverDim, fontWeight: 700, letterSpacing: 1.5 }}>DAILY NON-NEGOTIABLES</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: allDone ? C.success : C.silver }}>{doneCount}/{NONNEG.length}</div>
        </div>
        <div style={{ height: 4, background: C.border, borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 2, background: allDone ? C.success : C.blue, width: `${(doneCount / NONNEG.length) * 100}%`, transition: 'width 0.3s' }}/>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {NONNEG.map(item => {
            const done = !!checked[item.id];
            return (
              <button key={item.id} onClick={() => toggle(item.id)} style={{
                background: done ? `${C.success}12` : C.navyLight,
                border: `1.5px solid ${done ? C.success + '60' : C.border}`,
                borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: done ? C.success : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 800 }}>{done ? '✓' : ''}</div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: done ? C.silverDim : C.silverBright, textDecoration: done ? 'line-through' : 'none' }}>{item.label}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: done ? C.success : C.silver }}>
                  {item.target} <span style={{ fontSize: 10, color: C.silverDim }}>{item.unit}</span>
                </div>
              </button>
            );
          })}
        </div>

        {allDone && (
          <div style={{ background: `${C.success}15`, border: `1px solid ${C.success}40`, borderRadius: 14, padding: '14px 16px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ fontSize: 28 }}>💪</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.success }}>Non-negotiables done!</div>
              <div style={{ fontSize: 12, color: C.silverDim }}>Coach Skelly approves. Now hit your workout.</div>
            </div>
          </div>
        )}

        <div style={{ background: C.navyLight, borderRadius: 16, padding: 16, border: `1px solid ${C.border}`, display: 'flex', gap: 12 }}>
          <SkellyAvatar size={40} />
          <div>
            <div style={{ fontSize: 12, color: C.blue, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>COACH SKELLY</div>
            <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.6 }}>
              {allDone ? 'Non-negotiables done. Discipline. Now hit your workout.' : `${NONNEG.length - doneCount} non-negotiables left. No excuses.`}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button onClick={() => setScreen(S.WORKOUT)} style={{ background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)', border: 'none', borderRadius: 8, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>TODAY'S WORKOUT</button>
              <button onClick={() => setScreen(S.COACH)} style={{ background: 'none', border: `1px solid ${C.blue}`, borderRadius: 8, padding: '7px 14px', color: C.blue, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>TALK TO COACH</button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav screen={S.DASHBOARD} setScreen={setScreen} />
    </div>
  );
}

// ── WORKOUT ────────────────────────────────────────────
const WORKOUTS = [
  { id: 1, name: 'Hip Flexor Stretch', duration: '3 min', type: 'Stretch', sets: '3 × 30 sec each side', animKey: 'stretch', why: 'Releases tight hip flexors. Critical for knee and lower back health.' },
  { id: 2, name: 'Bodyweight Squat', duration: '8 min', type: 'Conditioning', sets: '4 × 15 reps', animKey: 'squat', why: 'Builds quad and glute strength. Improves knee stability and posture.' },
  { id: 3, name: 'Pull-Up', duration: '10 min', type: 'Strength', sets: '3 × max reps', animKey: 'pullup', why: 'Develops back width and grip strength. Foundation for upper body pulling power.' },
  { id: 4, name: 'Sit-Up', duration: '6 min', type: 'Core', sets: '3 × 25 reps', animKey: 'situp', why: 'Builds core strength and spinal stability. Protects your lower back.' },
  { id: 5, name: 'Push-Up', duration: '8 min', type: 'Strength', sets: '4 × 20 reps', animKey: 'pushup', why: 'Full upper body builder. Master 100 push-ups and your pressing strength transfers to everything.' },
  { id: 6, name: 'Calf Raise', duration: '5 min', type: 'Conditioning', sets: '3 × 20 reps', animKey: 'calfraise', why: 'Strengthens calves and ankles. Prevents knee pain and improves running mechanics.' },
];

const typeColor = { Stretch: '#22C55E', Conditioning: '#F59E0B', Strength: '#3B82F6', Core: '#A855F7' };

function WorkoutScreen({ setScreen, setSelectedExercise }) {
  return (
    <div style={{ minHeight: '100vh', background: C.navy, paddingBottom: 100 }}>
      <div style={{ padding: '54px 24px 20px', background: `linear-gradient(180deg, ${C.navyMid}, ${C.navy})` }}>
        <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>PHASE 1</div>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.silverBright }}>Today's Workout</div>
        <div style={{ fontSize: 13, color: C.silverDim, marginTop: 4 }}>Tap any exercise to learn more</div>
      </div>
      <div style={{ padding: '0 24px' }}>
        <div style={{ background: `${C.success}10`, border: `1px solid ${C.success}30`, borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>⌚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.success }}>Apple Watch Ready</div>
            <div style={{ fontSize: 11, color: C.silverDim }}>Tracks heart rate & calories automatically</div>
          </div>
          <button style={{ background: C.success, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>START</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {WORKOUTS.map(w => (
            <button key={w.id} onClick={() => { setSelectedExercise(w); setScreen(S.EXERCISE_DEMO); }} style={{
              background: C.navyLight, borderRadius: 14, padding: '14px 16px',
              border: `1px solid ${C.border}`, cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: typeColor[w.type] + '20', border: `1px solid ${typeColor[w.type]}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                {w.type === 'Stretch' ? '🤸' : w.type === 'Conditioning' ? '⚡' : w.type === 'Core' ? '🎯' : '💪'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.silverBright }}>{w.name}</div>
                <div style={{ fontSize: 11, color: C.silverDim, marginTop: 2 }}>{w.sets} · {w.duration}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: typeColor[w.type], background: typeColor[w.type] + '20', padding: '2px 8px', borderRadius: 10 }}>{w.type}</span>
                <span style={{ fontSize: 12, color: C.blue }}>▶ Details</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav screen={S.WORKOUT} setScreen={setScreen} />
    </div>
  );
}

// ── EXERCISE DEMO ──────────────────────────────────────
function ExerciseDemoScreen({ setScreen, exercise }) {
  const [started, setStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [reps, setReps] = useState(0);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  const muscleMap = {
    pushup: { primary: ['Chest', 'Triceps', 'Front Deltoids'], secondary: ['Core', 'Serratus Anterior'], tip: 'Keep your body in a straight line. Elbows at 45°, not flared out.' },
    squat: { primary: ['Quads', 'Glutes', 'Hamstrings'], secondary: ['Core', 'Calves', 'Lower Back'], tip: 'Drive your knees out. Chest up. Weight in your heels.' },
    pullup: { primary: ['Lats', 'Biceps', 'Upper Back'], secondary: ['Rear Deltoids', 'Core', 'Grip'], tip: 'Dead hang start. Pull your elbows to your hips, not your chin to the bar.' },
    situp: { primary: ['Rectus Abdominis', 'Hip Flexors'], secondary: ['Obliques', 'Transverse Abdominis'], tip: 'Hands behind head, don\'t pull your neck. Exhale on the way up.' },
    stretch: { primary: ['Hip Flexors', 'Quads', 'Psoas'], secondary: ['Lower Back', 'Glutes'], tip: 'Posterior tilt your pelvis. Feel the pull in the front of your hip, not your knee.' },
    calfraise: { primary: ['Gastrocnemius', 'Soleus'], secondary: ['Tibialis Anterior', 'Ankle Stabilizers'], tip: 'Full range — all the way down, all the way up. Slow and controlled.' },
  };

  if (!exercise) return null;
  const muscles = muscleMap[exercise.animKey] || muscleMap.stretch;

  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '54px 24px 40px' }}>
      <button onClick={() => setScreen(S.WORKOUT)} style={{ background: 'none', border: 'none', color: C.blue, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Back</button>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>COACH SKELLY</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.silverBright, marginBottom: 4 }}>{exercise.name}</div>
      <div style={{ fontSize: 13, color: C.silverDim, marginBottom: 20 }}>{exercise.sets}</div>

      <div style={{ background: C.navyLight, borderRadius: 16, padding: 18, border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 1.5, marginBottom: 14 }}>MUSCLES WORKED</div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: C.success, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PRIMARY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {muscles.primary.map(m => <span key={m} style={{ background: `${C.success}15`, border: `1px solid ${C.success}40`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: C.success }}>{m}</span>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: C.silverDim, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>SECONDARY</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {muscles.secondary.map(m => <span key={m} style={{ background: C.border, border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: C.silverDim }}>{m}</span>)}
          </div>
        </div>
      </div>

      <div style={{ background: `${C.warning}10`, border: `1px solid ${C.warning}30`, borderRadius: 14, padding: 16, marginBottom: 16, display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <div style={{ fontSize: 11, color: C.warning, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>FORM TIP</div>
          <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.6 }}>{muscles.tip}</div>
        </div>
      </div>

      <div style={{ background: C.navyLight, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${C.blue}20`, border: `1px solid ${C.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💀</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.silverBright }}>Coach Skelly Demo</div>
          <div style={{ fontSize: 11, color: C.blue }}>Animation coming soon</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, background: C.navyLight, borderRadius: 14, padding: 16, textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.white }}>{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</div>
          <div style={{ fontSize: 11, color: C.silverDim, marginTop: 4 }}>TIMER</div>
        </div>
        <div style={{ flex: 1, background: C.navyLight, borderRadius: 14, padding: 16, textAlign: 'center', border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.blue }}>{reps}</div>
          <div style={{ fontSize: 11, color: C.silverDim, marginTop: 4 }}>REPS</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 6 }}>
            <button onClick={() => setReps(r => Math.max(0, r - 1))} style={{ width: 28, height: 28, borderRadius: '50%', background: C.border, border: 'none', color: C.silver, fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>−</button>
            <button onClick={() => setReps(r => r + 1)} style={{ width: 28, height: 28, borderRadius: '50%', background: C.blue, border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>+</button>
          </div>
        </div>
      </div>

      <button onClick={() => setStarted(s => !s)} style={{
        width: '100%', padding: '16px 0',
        background: started ? `${C.warning}30` : 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
        border: `1px solid ${started ? C.warning : 'transparent'}`,
        borderRadius: 14, cursor: 'pointer',
        color: started ? C.warning : '#fff', fontSize: 15, fontWeight: 800,
      }}>{started ? '⏸ PAUSE' : '▶ START SET'}</button>
      <button onClick={() => setScreen(S.WORKOUT)} style={{ width: '100%', marginTop: 10, padding: '14px 0', background: 'transparent', border: `1px solid ${C.success}`, borderRadius: 14, cursor: 'pointer', color: C.success, fontSize: 14, fontWeight: 700 }}>✓ MARK COMPLETE</button>
    </div>
  );
}

// ── COACH CHAT ─────────────────────────────────────────
function CoachScreen({ setScreen, user }) {
  const [messages, setMessages] = useState([
    { role: 'coach', text: "Welcome to Phase 1. Before we do anything else — understand why you're here. Most injuries happen because people skip this step. Your joints, your tendons, your movement patterns need to be fixed FIRST. Every day you owe me 50 push-ups, 10 chin-ups, 10 pull-ups, 25 sit-ups, 25 crunches, 25 V-sits, 25 side planks each side, 50 calf raises, and 50 squats. Non-negotiable. Ask me anything." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6', max_tokens: 1000,
          system: `You are Coach Skelly, the AI fitness coach for HBHM (Healthy Body Healthy Mind). Direct, science-backed, zero tolerance for excuses. Phase 1 (Restore), Phase 2 (Condition), Phase 3 (Strengthen). Everyone starts Phase 1. Daily non-negotiables: 50 push-ups, 10 chin-ups, 10 pull-ups, 25 sit-ups, 25 crunches, 25 V-sits, 25 side planks each side, 50 calf raises, 50 squats. $5/week, no free trial. Keep responses 3-5 sentences.`,
          messages: [...messages.map(m => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text })), { role: 'user', content: msg }],
        }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'coach', text: data.content?.[0]?.text || 'Stay focused.' }]);
    } catch {
      setMessages(m => [...m, { role: 'coach', text: 'Connection issue. No excuses on the workout though.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', flexDirection: 'column', paddingBottom: 140 }}>
      <div style={{ padding: '54px 24px 16px', background: C.navyMid, borderBottom: `1px solid ${C.navyLight}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <SkellyAvatar size={48} animate />
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.silverBright }}>Coach Skelly</div>
          <div style={{ fontSize: 11, color: C.success }}>● Online · Phase 1 Coach</div>
        </div>
        <div style={{ marginLeft: 'auto' }}><PhaseTag phase={1} /></div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            {m.role === 'coach' && <SkellyAvatar size={32} />}
            <div style={{ maxWidth: '78%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'linear-gradient(135deg, #1D4ED8, #3B82F6)' : C.navyLight, fontSize: 14, color: C.silverBright, lineHeight: 1.6 }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <SkellyAvatar size={32} />
            <div style={{ background: C.navyLight, borderRadius: '18px 18px 18px 4px', padding: '12px 16px' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.silverDim, animation: `bounce 1s ${i*0.2}s ease-in-out infinite` }}/>)}
              </div>
            </div>
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', bottom: 70, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, padding: '12px 16px', background: C.navy, borderTop: `1px solid ${C.navyLight}`, display: 'flex', gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ask Coach Skelly anything..." style={{ flex: 1, padding: '12px 16px', borderRadius: 24, fontSize: 14, background: C.navyLight, border: `1.5px solid ${C.border}`, color: C.silverBright, outline: 'none' }}/>
        <button onClick={send} style={{ width: 46, height: 46, borderRadius: '50%', background: input.trim() ? 'linear-gradient(135deg, #1D4ED8, #3B82F6)' : C.border, border: 'none', cursor: 'pointer', fontSize: 18, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>→</button>
      </div>
      <BottomNav screen={S.COACH} setScreen={setScreen} />
    </div>
  );
}

// ── NUTRITION ──────────────────────────────────────────
function NutritionScreen({ setScreen }) {
  const meals = [
    { name: 'Breakfast', time: '7:32 AM', cal: 420, items: 'Eggs, oats, banana', logged: true },
    { name: 'Lunch', time: '12:15 PM', cal: 680, items: 'Grilled chicken, rice, veggies', logged: true },
    { name: 'Dinner', time: '—', cal: null, items: null, logged: false },
  ];
  const total = meals.filter(m => m.logged).reduce((s, m) => s + m.cal, 0);
  const target = 2200;
  const pct = Math.round((total / target) * 100);
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '54px 24px 100px' }}>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>NUTRITION LOG</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.silverBright, marginBottom: 20 }}>Today's Fuel</div>
      <div style={{ background: C.navyLight, borderRadius: 20, padding: 20, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke={C.border} strokeWidth="8"/>
            <circle cx="40" cy="40" r="34" fill="none" stroke={C.blue} strokeWidth="8" strokeDasharray={`${2 * Math.PI * 34 * pct / 100} ${2 * Math.PI * 34}`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: C.white }}>{pct}%</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: C.white }}>{total.toLocaleString()}</div>
          <div style={{ fontSize: 13, color: C.silverDim }}>of {target.toLocaleString()} kcal</div>
          <div style={{ fontSize: 11, color: C.success, marginTop: 4 }}>On track today</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.silverDim, fontWeight: 700, letterSpacing: 1.5, marginBottom: 12 }}>MEALS</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {meals.map((m, i) => (
          <div key={i} style={{ background: C.navyLight, borderRadius: 14, padding: '14px 16px', border: `1px solid ${m.logged ? C.border : C.warning + '30'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: m.logged ? 4 : 0 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.silverBright }}>{m.name}</span>
              {m.logged ? <span style={{ fontSize: 14, fontWeight: 800, color: C.white }}>{m.cal} kcal</span>
                : <button style={{ background: `${C.warning}20`, border: `1px solid ${C.warning}50`, borderRadius: 8, padding: '5px 12px', color: C.warning, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>📸 Log Meal</button>}
            </div>
            {m.logged && <div style={{ fontSize: 12, color: C.silverDim }}>{m.time} · {m.items}</div>}
          </div>
        ))}
      </div>
      <div style={{ background: `${C.blue}10`, border: `1px solid ${C.blue}30`, borderRadius: 14, padding: 16, display: 'flex', gap: 12 }}>
        <SkellyAvatar size={36} />
        <div style={{ fontSize: 13, color: C.silver, lineHeight: 1.6 }}>"You're at {pct}% of your calories. Log dinner and stay within 400 more. Protein first, always."</div>
      </div>
      <BottomNav screen={S.NUTRITION} setScreen={setScreen} />
    </div>
  );
}

// ── LEADERBOARD ────────────────────────────────────────
function LeaderboardScreen({ setScreen, profile }) {
  const users = [
    { rank: 1, name: 'JORDANFIT', streak: 42, points: 9840, phase: 2 },
    { rank: 2, name: 'TAYLORM', streak: 38, points: 8910, phase: 2 },
    { rank: 3, name: 'AISHAT', streak: 12, points: 2800, phase: 1 },
    { rank: 4, name: 'LISAKAY', streak: 6, points: 1420, phase: 1 },
    { rank: 5, name: 'DEVONR', streak: 5, points: 1200, phase: 1 },
  ];
  return (
    <div style={{ minHeight: '100vh', background: C.navy, padding: '54px 24px 100px' }}>
      <div style={{ fontSize: 11, color: C.blue, fontWeight: 700, letterSpacing: 2, marginBottom: 4 }}>COMMUNITY</div>
      <div style={{ fontSize: 26, fontWeight: 900, color: C.silverBright, marginBottom: 4 }}>Rankings</div>
      <div style={{ fontSize: 13, color: C.silverDim, marginBottom: 20 }}>Top 5 win a free HBHM compression shirt 👕</div>
      <div style={{ background: 'linear-gradient(135deg, #1C3A6B, #0D2040)', borderRadius: 16, padding: '14px 20px', marginBottom: 24, border: '1px solid #1D4ED850', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, color: C.blue, fontWeight: 700, letterSpacing: 1 }}>MONTHLY PRIZE</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.white, marginTop: 2 }}>HBHM Compression Long Sleeve</div>
          <div style={{ fontSize: 11, color: C.silverDim, marginTop: 2 }}>Top 5 users this month</div>
        </div>
        <div style={{ fontSize: 36 }}>👕</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {users.map((u, i) => (
          <div key={i} style={{ background: C.navyLight, borderRadius: 14, padding: '14px 16px', border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i < 3 ? 20 : 13, fontWeight: 700, color: C.silverDim }}>
              {['🥇','🥈','🥉','4th','5th'][i]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.silverBright }}>{u.name}</div>
              <div style={{ fontSize: 11, color: C.silverDim, marginTop: 2 }}>🔥{u.streak} streak · <PhaseTag phase={u.phase} /></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: C.white }}>{u.points.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: C.silverDim }}>pts</div>
            </div>
          </div>
        ))}
      </div>
      <BottomNav screen={S.LEADERBOARD} setScreen={setScreen} />
    </div>
  );
}

// ── APP ROOT ───────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState(S.LOADING);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        setScreen(S.DASHBOARD);
      } else {
        setScreen(S.AUTH);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      else { setUser(null); setProfile(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setProfile(data);
  };

  const render = () => {
    switch (screen) {
      case S.LOADING: return <LoadingScreen />;
      case S.AUTH: return <AuthScreen setScreen={setScreen} setUser={setUser} />;
      case S.WELCOME: return <WelcomeScreen setScreen={setScreen} />;
      case S.ONBOARDING_1: return <Onboarding1 setScreen={setScreen} />;
      case S.ONBOARDING_2: return <Onboarding2 setScreen={setScreen} />;
      case S.ONBOARDING_BODY: return <OnboardingBodyMap setScreen={setScreen} />;
      case S.ONBOARDING_3: return <Onboarding3 setScreen={setScreen} />;
      case S.PAYMENT: return <PaymentScreen setScreen={setScreen} />;
      case S.APPLE_WATCH: return <AppleWatchScreen setScreen={setScreen} />;
      case S.DASHBOARD: return <DashboardScreen setScreen={setScreen} user={user} profile={profile} />;
      case S.WORKOUT: return <WorkoutScreen setScreen={setScreen} setSelectedExercise={setSelectedExercise} />;
      case S.EXERCISE_DEMO: return <ExerciseDemoScreen setScreen={setScreen} exercise={selectedExercise} />;
      case S.COACH: return <CoachScreen setScreen={setScreen} user={user} />;
      case S.NUTRITION: return <NutritionScreen setScreen={setScreen} />;
      case S.LEADERBOARD: return <LeaderboardScreen setScreen={setScreen} profile={profile} />;
      default: return <LoadingScreen />;
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: C.navy, fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        input,button,textarea { font-family: inherit; }
        ::-webkit-scrollbar { display: none; }
      `}</style>
      {render()}
    </div>
  );
}
