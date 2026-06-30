import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  GraduationCap, Clock, Bell, BarChart2, ChevronRight,
  Ticket, Users, Shield, Zap, ArrowRight,
  CheckCircle2, LayoutDashboard, User, BookOpen,
  HeartPulse, Library, DollarSign,
} from 'lucide-react'

const VIDEO_SRC = '/videos/The_Queue_Management_System_al.mp4'

/* ─── Hero browser-frame app mockup ─────────────────────────────────────── */
const SERVICES = [
  { name: 'Registrar',     count: 5, bg: 'bg-blue-50',   icon: BookOpen,    dot: 'bg-blue-500',   text: 'text-blue-600'   },
  { name: 'Finance',       count: 8, bg: 'bg-green-50',  icon: DollarSign,  dot: 'bg-green-500',  text: 'text-green-600'  },
  { name: 'Health Clinic', count: 2, bg: 'bg-rose-50',   icon: HeartPulse,  dot: 'bg-rose-500',   text: 'text-rose-600'   },
  { name: 'Library',       count: 1, bg: 'bg-purple-50', icon: Library,     dot: 'bg-purple-500', text: 'text-purple-600' },
]

function HeroAppMockup() {
  return (
    <div className="w-full h-full bg-gray-50 flex overflow-hidden select-none" style={{ minHeight: 340 }}>

      {/* Sidebar */}
      <div className="w-11 bg-gray-900 flex flex-col items-center py-3 gap-3 shrink-0">
        <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center mb-1 shadow-lg shadow-primary-500/40">
          <GraduationCap size={13} className="text-white" />
        </div>
        {[LayoutDashboard, Ticket, Bell, User].map((Icon, i) => (
          <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${i === 0 ? 'bg-primary-500/25' : ''}`}>
            <Icon size={13} className={i === 0 ? 'text-primary-400' : 'text-gray-600'} />
          </div>
        ))}
        <div className="mt-auto w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
          <span className="text-gray-300 text-[9px] font-bold">JD</span>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-100 px-3 py-2 flex items-center justify-between shrink-0">
          <span className="font-extrabold text-gray-800 text-[11px]">Dashboard</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-400 text-[9px]">All services live</span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden p-2.5 space-y-2.5">

          {/* Welcome banner */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl px-3 py-2.5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-white/70 text-[9px]">Good morning 👋</p>
              <p className="text-white font-extrabold text-[11px]">John Doe · STU/2024/001</p>
            </div>
            <div className="bg-white/20 rounded-lg px-2 py-1 text-white text-[9px] font-semibold">
              0 active tickets
            </div>
          </div>

          {/* Services label */}
          <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest px-0.5">Available Services</p>

          {/* 2×2 service grid */}
          <div className="grid grid-cols-2 gap-2">
            {SERVICES.map(({ name, count, bg, icon: Icon, dot, text }) => (
              <div key={name} className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`w-6 h-6 ${bg} rounded-lg flex items-center justify-center mb-1.5`}>
                  <Icon size={11} className={text} />
                </div>
                <p className={`font-bold text-[10px] text-gray-800 leading-tight`}>{name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`w-1 h-1 ${dot} rounded-full`} />
                  <span className="text-gray-400 text-[9px]">{count} waiting</span>
                </div>
              </div>
            ))}
          </div>

          {/* Active ticket highlight */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl px-3 py-2 flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shrink-0 shadow shadow-primary-500/30">
              <span className="text-white font-black text-sm">#3</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-primary-700 text-[10px]">You're #3 in Registrar</p>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5,6].map(n => (
                  <div key={n} className={`h-1 flex-1 rounded-full ${n <= 3 ? 'bg-primary-500' : 'bg-primary-100'}`} />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

/* ─── Full-height live visuals for the sticky card flow ─────────────────── */

// Card 1 — student queue: large position number counts down, progress shrinks
function StudentQueueVisual() {
  const [pos, setPos] = useState(5)
  useEffect(() => {
    const id = setInterval(() => setPos(p => p > 1 ? p - 1 : 5), 3000)
    return () => clearInterval(id)
  }, [])
  const wait = pos * 3

  return (
    <div className="w-full h-full min-h-[480px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex flex-col items-center justify-center gap-8 relative overflow-hidden px-10 py-14">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '32px 32px' }} />

      {/* Live badge */}
      <div className="relative z-10 flex items-center gap-2 bg-white/15 border border-white/25 px-4 py-1.5 rounded-full">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-white/90 text-xs font-semibold">Registrar Office · Live</span>
      </div>

      {/* Huge position */}
      <div className="relative z-10 text-center">
        <p className="text-white/60 text-sm uppercase tracking-widest mb-2">Your position</p>
        <p className="text-white font-black tabular-nums transition-all duration-700 leading-none" style={{ fontSize: 'clamp(80px,12vw,140px)' }}>
          #{pos}
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 flex gap-1.5 w-full max-w-xs">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-700 ${i < pos ? 'bg-white' : 'bg-white/20'}`} />
        ))}
      </div>

      {/* Stats row */}
      <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-xs">
        {[['Ahead of you', pos - 1], ['Serving now', `#${6 - pos}`]].map(([label, val]) => (
          <div key={label} className="bg-white/15 border border-white/25 rounded-2xl p-4 text-center">
            <p className="text-white/60 text-xs mb-1">{label}</p>
            <p className="text-white font-extrabold text-3xl tabular-nums">{val}</p>
          </div>
        ))}
      </div>

      {/* Alert */}
      <div className="relative z-10 w-full max-w-xs bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-3">
        <Bell size={16} className={`shrink-0 ${pos === 2 ? 'text-amber-300 animate-bounce' : 'text-white/60'}`} />
        <p className="text-white/80 text-sm font-medium">
          {pos === 2 ? "You're next! Get ready." : 'Alert 1 ticket before your turn'}
        </p>
      </div>
    </div>
  )
}

// Card 2 — staff dashboard: timer counts up, name rotates each cycle
const STUDENT_NAMES = ['Alice M.', 'Brian K.', 'Carol N.', 'Diana O.', 'Eric M.']

function StaffDashVisual() {
  const [elapsed, setElapsed] = useState(14)
  const [nameIdx, setNameIdx] = useState(0)
  const [served,  setServed]  = useState(4)

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(s => {
        if (s >= 59) { setNameIdx(i => (i + 1) % STUDENT_NAMES.length); setServed(n => n + 1); return 0 }
        return s + 1
      })
    }, 500)
    return () => clearInterval(id)
  }, [])

  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  const tickets = [
    { num: `#${String(served + 1).padStart(3,'0')}`, name: STUDENT_NAMES[nameIdx],                        status: 'Serving', cls: 'bg-green-100 text-green-700' },
    { num: `#${String(served + 2).padStart(3,'0')}`, name: STUDENT_NAMES[(nameIdx + 1) % STUDENT_NAMES.length], status: 'Waiting', cls: 'bg-amber-100 text-amber-700' },
    { num: `#${String(served + 3).padStart(3,'0')}`, name: STUDENT_NAMES[(nameIdx + 2) % STUDENT_NAMES.length], status: 'Waiting', cls: 'bg-amber-100 text-amber-700' },
  ]

  return (
    <div className="w-full h-full min-h-[480px] bg-gradient-to-br from-violet-600 via-purple-700 to-blue-800 flex items-center justify-center px-8 py-14 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-primary-600 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-bold">Registrar — Counter 1</p>
            <p className="text-white/70 text-xs mt-0.5">8 waiting · {served} served today</p>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 font-mono text-white font-bold tabular-nums text-lg">
            {mm}:{ss}
          </div>
        </div>
        <div className="p-4 space-y-2.5">
          {tickets.map(t => (
            <div key={t.num} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 transition-all">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-gray-700 tabular-nums">{t.num}</span>
                <span className="text-gray-600 text-sm">{t.name}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.cls}`}>{t.status}</span>
            </div>
          ))}
          <button className="w-full bg-primary-500 text-white font-bold py-3 rounded-xl mt-1 flex items-center justify-center gap-2 text-sm">
            Call Next <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

// Card 3 — admin: auto-approves staff one by one then resets
const STAFF_LIST = [
  { id: 1, name: 'Jane Wanjiru', dept: 'Registrar',     initials: 'JW' },
  { id: 2, name: 'Peter Kamau',  dept: 'Finance Office', initials: 'PK' },
  { id: 3, name: 'Amara Osei',   dept: 'Health Clinic',  initials: 'AO' },
]

function AdminVisual() {
  const [approved, setApproved] = useState([])
  const [flash,    setFlash]    = useState(null)

  useEffect(() => {
    const id = setInterval(() => {
      setApproved(prev => {
        const next = STAFF_LIST.find(s => !prev.includes(s.id))
        if (!next) return []
        setFlash(next.id); setTimeout(() => setFlash(null), 800)
        return [...prev, next.id]
      })
    }, 2500)
    return () => clearInterval(id)
  }, [])

  const pendingCount = STAFF_LIST.filter(s => !approved.includes(s.id)).length

  return (
    <div className="w-full h-full min-h-[480px] bg-gradient-to-br from-teal-500 via-emerald-600 to-green-700 flex items-center justify-center px-8 py-14 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gray-900 px-5 py-4 flex items-center gap-3">
          <Shield size={16} className="text-primary-400" />
          <p className="text-white font-bold">Staff Approval</p>
          <span className={`ml-auto text-white text-xs font-bold px-2.5 py-1 rounded-full transition-colors duration-500 ${pendingCount > 0 ? 'bg-amber-500' : 'bg-green-500'}`}>
            {pendingCount} pending
          </span>
        </div>
        <div className="p-4 space-y-2.5">
          {STAFF_LIST.map(s => {
            const isApproved = approved.includes(s.id)
            const isFlashing = flash === s.id
            return (
              <div key={s.id} className={`flex items-center justify-between rounded-xl px-4 py-3 transition-all duration-500 ${isFlashing ? 'bg-green-50 border border-green-200 scale-[1.02]' : isApproved ? 'bg-green-50/60' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isApproved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.initials}
                  </div>
                  <div>
                    <p className="text-gray-800 text-sm font-semibold">{s.name}</p>
                    <p className="text-gray-400 text-xs">{s.dept}</p>
                  </div>
                </div>
                {isApproved
                  ? <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full"><CheckCircle2 size={11} /> Verified</span>
                  : <div className="flex gap-1.5"><button className="text-xs font-bold bg-red-100 text-red-600 px-2.5 py-1 rounded-lg">Reject</button><button className="text-xs font-bold bg-green-500 text-white px-2.5 py-1 rounded-lg">Approve</button></div>
                }
              </div>
            )
          })}
          {approved.length > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
              <CheckCircle2 size={14} className="text-green-500 shrink-0" />
              <p className="text-green-700 text-xs font-medium">{approved.length} staff approved this session</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Card flow data ─────────────────────────────────────────────────────── */
const flowCards = [
  {
    badge: 'QueueFlow Student · Available Now',
    heading: 'Join any queue,\nfrom anywhere.',
    desc: "Browse active services, join with one tap, and track your position live. No more standing in line wondering how much longer it'll be.",
    visual: <StudentQueueVisual />,
    bg: 'from-blue-600 to-primary-700',
  },
  {
    badge: 'Staff Dashboard · Available Now',
    heading: 'Manage your\ncounter with ease.',
    desc: 'Call the next student, close tickets, and monitor queue analytics in real time — a dashboard built for speed and clarity.',
    visual: <StaffDashVisual />,
    bg: 'from-violet-600 to-blue-700',
  },
  {
    badge: 'Admin Control · Available Now',
    heading: 'Stay in control\nof staff access.',
    desc: 'Review pending staff registrations, approve or reject accounts, and ensure only verified personnel access the system.',
    visual: <AdminVisual />,
    bg: 'from-teal-600 to-green-700',
  },
]

/* ─── Features grid data ─────────────────────────────────────────────────── */
const features = [
  { icon: Clock,      title: 'Live position tracking',   desc: 'See exactly where you are in any queue — no guessing, no wasted trips.' },
  { icon: Bell,       title: 'Instant turn alerts',      desc: 'Get notified one ticket before your turn so you never miss your slot.' },
  { icon: BarChart2,  title: 'Staff analytics',          desc: 'Real-time queue stats, peak-hour charts, and performance reports.' },
  { icon: Shield,     title: 'Admin verification',       desc: 'Staff accounts are reviewed by admins before access is granted.' },
  { icon: Users,      title: 'Multi-service support',    desc: 'Registrar, Finance, Health Clinic, Course Advisor and more.' },
  { icon: Zap,        title: 'Instant queue join',       desc: 'Students join queues remotely from their phone in seconds.' },
]

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user } = useAuth()

  const dashboardLink = user?.role === 'admin' ? '/admin'
    : user?.role === 'staff' ? '/staff'
    : user ? '/student'
    : null

  return (
    <div className="text-white overflow-x-hidden">

      {/* ── Sticky glass pill navbar ─────────────────────────────────────── */}
      <div className="sticky top-4 z-50 px-4 md:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3 rounded-full
          bg-[#020817]/80 backdrop-blur-2xl
          border border-white/[0.12]
          shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)]">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/40">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight">QueueFlow</span>
          </div>

          {/* Centre links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-300">
            <a href="#features"  className="hover:text-white transition-colors">All Features</a>
            <a href="#how"       className="hover:text-white transition-colors">How It Works</a>
            <a href="#about"     className="hover:text-white transition-colors">About</a>
            <Link to="/signin?role=staff" className="hover:text-white transition-colors">For Staff</Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {dashboardLink ? (
              <Link
                to={dashboardLink}
                className="text-sm font-bold bg-primary-500 hover:bg-primary-400 text-white px-5 py-2 rounded-full shadow-lg shadow-primary-500/30 transition-all flex items-center gap-1.5 active:scale-95"
              >
                Go to Dashboard <ChevronRight size={14} />
              </Link>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="hidden sm:block text-sm font-semibold text-gray-200 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/25 transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-bold bg-primary-500 hover:bg-primary-400 text-white px-5 py-2 rounded-full shadow-lg shadow-primary-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  Get started <ChevronRight size={14} />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">

        {/* ── Dark fallback so text is always readable if video fails ── */}
        <div className="absolute inset-0 bg-[#020817]" />

        {/* ── Background video ── */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/The_Queue_Management_System_al.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />

        {/* Dark overlay so text stays legible over the video */}
        <div className="absolute inset-0 bg-[#020817]/70" />

        {/* All hero content sits above the video */}
        <div className="relative z-10 px-6 md:px-12 pt-14 pb-24 flex flex-col lg:flex-row items-center gap-14 max-w-7xl mx-auto">

        {/* Left */}
        <div className="lg:w-1/2 flex-shrink-0">
          <div className="inline-flex items-center gap-2 bg-primary-500/15 border border-primary-500/30 text-primary-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
            For USIU-Africa &nbsp;·&nbsp; QueueFlow
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] mb-6 tracking-tight">
            Smart queue<br />management<br />
            <span className="text-primary-400">for everyone.</span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-lg">
            Students join queues remotely, track their position live, and get notified
            when their turn arrives. Staff manage counters and analytics — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-10">
            {dashboardLink ? (
              <Link to={dashboardLink}
                className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-7 py-3.5 rounded-full shadow-xl shadow-primary-500/25 transition-all active:scale-95 text-sm">
                Go to Dashboard <ChevronRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/signup"
                  className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-7 py-3.5 rounded-full shadow-xl shadow-primary-500/25 transition-all active:scale-95 text-sm">
                  Create student account <ChevronRight size={16} />
                </Link>
                <Link to="/signin"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-7 py-3.5 rounded-full border border-white/10 transition-all text-sm">
                  Sign in
                </Link>
              </>
            )}
          </div>

          <div className="flex gap-8">
            {[['2,400+', 'Students served'], ['9', 'Services'], ['100%', 'Digital']].map(([v, l]) => (
              <div key={l}>
                <p className="text-2xl font-extrabold">{v}</p>
                <p className="text-xs text-gray-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: app mockup in browser frame */}
        <div className="lg:w-1/2 w-full">
          <div className="relative rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.5)] border border-white/10 bg-gray-900">
            {/* Browser chrome */}
            <div className="bg-gray-800/90 px-4 py-3 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 mx-3 bg-gray-700/60 rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                queueflow.usiu.ac.ke/student
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] text-gray-400">live</span>
              </div>
            </div>

            {/* UI Mockup — student dashboard preview */}
            <HeroAppMockup />
          </div>

          <div className="flex justify-center mt-4 gap-3 flex-wrap">
            {[
              ['bg-green-500', 'Live queues'],
              ['bg-blue-500',  'Real-time alerts'],
              ['bg-primary-500', 'Staff dashboard'],
            ].map(([c, l]) => (
              <span key={l} className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                <span className={`w-1.5 h-1.5 ${c} rounded-full`} />
                {l}
              </span>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* ── Card flow section — sticky stack ────────────────────────────── */}
      <section id="how" className="relative z-10 bg-white text-gray-900">

        {/* Header — scrolls away normally */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-12 text-center">
          <p className="text-primary-500 text-sm font-bold uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Built for every role<br />on campus.
          </h2>
        </div>

        {/* Sticky card stack — each wrapper gives scroll room, card itself sticks */}
        <div className="max-w-7xl mx-auto px-4 md:px-10 pb-32">
          {flowCards.map((card, i) => (
            <div
              key={card.badge}
              /*
               * Each wrapper is taller than the viewport so the card has room
               * to stay sticky while the next card scrolls up from below.
               * Last card: auto height — it just sits at its final position.
               */
              style={{ minHeight: i < flowCards.length - 1 ? '120vh' : 'auto' }}
            >
              <div
                className="sticky"
                style={{
                  /*
                   * position: sticky — freezes when it hits `top`.
                   * Each card's top is 28 px lower than the previous, so
                   * you can see the previous card's header peeking above.
                   * z-index increases so each new card slides OVER the previous.
                   */
                  top: `${72 + i * 20}px`,
                  zIndex: 10 + i,
                }}
              >
                <div className="rounded-3xl border border-gray-100 shadow-xl overflow-hidden bg-white">
                  <div className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>

                    {/* Text side */}
                    <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                      <span className="inline-flex items-center gap-2 text-xs font-semibold bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full mb-6 w-fit">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        {card.badge}
                      </span>
                      <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4 whitespace-pre-line">
                        {card.heading}
                      </h3>
                      <p className="text-gray-500 text-base leading-relaxed mb-7">{card.desc}</p>
                      <Link
                        to="/signin"
                        className="inline-flex items-center gap-2 text-primary-600 font-bold text-sm group w-fit"
                      >
                        Get started
                        <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>

                    {/* Visual side — full-height, no padding, fills edge-to-edge */}
                    <div className="lg:w-1/2 overflow-hidden min-h-[380px] lg:min-h-0">
                      {card.visual}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section id="features" className="relative z-10 overflow-hidden py-24 px-6 md:px-12">
        {/* Same aesthetic gradient as hero */}
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-[#020817] to-blue-950/60" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-primary-400 text-sm font-bold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
              Everything you need,<br />nothing you don't.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.12] hover:border-primary-500/50 rounded-2xl p-6 transition-all group backdrop-blur-sm">
                <div className="w-11 h-11 bg-primary-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500/30 transition-colors">
                  <Icon size={20} className="text-primary-300" />
                </div>
                <p className="font-bold text-white mb-2 text-base">{title}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────────── */}
      <section id="about" className="relative z-10 overflow-hidden py-20 px-6 md:px-12">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/40 to-[#020817]" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center bg-white/[0.06] border border-white/[0.12] rounded-3xl p-10 backdrop-blur-sm">
          <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Ticket size={28} className="text-primary-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Ready to skip the line?</h2>
          <p className="text-gray-400 mb-8">
            Join thousands of USIU students already using QueueFlow to manage their time better.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-400 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-primary-500/25 transition-all text-sm">
              Create free account <ChevronRight size={16} />
            </Link>
            <Link to="/signup/staff"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-3.5 rounded-full border border-white/10 transition-all text-sm">
              Register as staff
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary-400 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="relative z-10 bg-[#020817] border-t border-white/[0.08] px-6 md:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-primary-400" />
          <span className="text-sm text-gray-400 font-semibold">QueueFlow &mdash; USIU-Africa</span>
        </div>
        <p className="text-xs text-gray-500">
          &copy; {new Date().getFullYear()} United States International University Africa. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
