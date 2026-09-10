import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { type Enquiry, type EnquiryStage, STAGE_LABELS, STAGE_ORDER } from '../lib/database.types'
import { EnquiryCard } from '../components/EnquiryCard'
import { EnquiryDetail } from '../components/EnquiryDetail'

type FilterStage = 'all' | EnquiryStage

function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="h-4 bg-slate-800 rounded w-36 mb-2" />
          <div className="h-3 bg-slate-800 rounded w-48" />
        </div>
        <div className="h-5 bg-slate-800 rounded-full w-16" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-slate-800 rounded w-12" />
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-slate-800 rounded-lg" />
          <div className="w-8 h-8 bg-slate-800 rounded-lg" />
          <div className="w-20 h-8 bg-slate-800 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStage>('all')
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Fetch on mount
  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) {
      setError('Failed to load enquiries. Please try again.')
    } else {
      setEnquiries(data as Enquiry[])
    }
    setLoading(false)
  }

  const handleStageChange = async (id: string, stage: EnquiryStage) => {
    setUpdatingId(id)
    // Optimistic update
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, stage, updated_at: new Date().toISOString() } : e))
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, stage } : null)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('enquiries') as any)
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      // Revert on failure
      await fetchEnquiries()
    }
    setUpdatingId(null)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enquiries.length }
    STAGE_ORDER.forEach(s => {
      counts[s] = enquiries.filter(e => e.stage === s).length
    })
    return counts
  }, [enquiries])

  // Filtered + searched list
  const displayed = useMemo(() => {
    let list = enquiries
    if (filter !== 'all') list = list.filter(e => e.stage === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(e =>
        e.full_name.toLowerCase().includes(q) ||
        e.phone.includes(q) ||
        e.city.toLowerCase().includes(q)
      )
    }
    return list
  }, [enquiries, filter, search])

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/60 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Clinicals</p>
              <p className="text-slate-500 text-xs leading-none mt-0.5">Team Dashboard</p>
            </div>
          </div>
          <button
            id="sign-out-btn"
            onClick={handleSignOut}
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {/* Stats bar */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-white font-bold text-lg">
            Enquiries
            {!loading && <span className="text-slate-500 font-normal text-base ml-2">({stageCounts.all})</span>}
          </h1>
          <button
            onClick={fetchEnquiries}
            aria-label="Refresh"
            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="dashboard-search"
            type="search"
            placeholder="Search by name, phone, or city…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border border-slate-800 text-white placeholder-slate-500
              outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Stage Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          <FilterChip label="All" count={stageCounts.all} active={filter === 'all'} onClick={() => setFilter('all')} />
          {STAGE_ORDER.map(s => (
            <FilterChip
              key={s}
              label={STAGE_LABELS[s]}
              count={stageCounts[s] ?? 0}
              active={filter === s}
              onClick={() => setFilter(s)}
            />
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold mb-1">{error}</p>
              <button onClick={fetchEnquiries} className="text-indigo-400 text-sm underline">Try again</button>
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold">No enquiries found</p>
              <p className="text-slate-500 text-sm mt-1">
                {search ? 'Try a different search term.' : 'New enquiries will appear here.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-8">
            {displayed.map(e => (
              <EnquiryCard
                key={e.id}
                enquiry={e}
                onSelect={setSelected}
                onStageChange={handleStageChange}
                updating={updatingId === e.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Detail Sheet */}
      {selected && (
        <EnquiryDetail
          enquiry={selected}
          onClose={() => setSelected(null)}
          onStageChange={handleStageChange}
          updating={updatingId === selected.id}
        />
      )}
    </div>
  )
}

interface FilterChipProps {
  label: string
  count: number
  active: boolean
  onClick: () => void
}

function FilterChip({ label, count, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap border transition-all duration-200
        ${active
          ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
        }`}
    >
      {label}
      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold
        ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
        {count}
      </span>
    </button>
  )
}
