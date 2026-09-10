import { type Enquiry, type EnquiryStage, STAGE_COLORS, STAGE_LABELS } from '../lib/database.types'

interface StageBadgeProps {
  stage: EnquiryStage
  size?: 'sm' | 'md'
}

export function StageBadge({ stage, size = 'sm' }: StageBadgeProps) {
  const colors = STAGE_COLORS[stage]
  const label = STAGE_LABELS[stage]
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${colors.bg} ${colors.text} ${colors.border}
      ${size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      {label}
    </span>
  )
}

interface EnquiryCardProps {
  enquiry: Enquiry
  onSelect: (e: Enquiry) => void
  onStageChange: (id: string, stage: EnquiryStage) => void
  updating: boolean
}

const NEXT_STAGE: Partial<Record<EnquiryStage, EnquiryStage>> = {
  new: 'contacted',
  contacted: 'conference_call',
  conference_call: 'clinic_visit',
  clinic_visit: 'converted',
}

export function EnquiryCard({ enquiry, onSelect, onStageChange, updating }: EnquiryCardProps) {
  const nextStage = NEXT_STAGE[enquiry.stage]
  const timeAgo = formatTimeAgo(enquiry.created_at)

  return (
    <div
      onClick={() => onSelect(enquiry)}
      className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-4 cursor-pointer
        hover:border-slate-700 hover:bg-slate-900/80 transition-all duration-200 active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-base truncate">{enquiry.full_name}</p>
          <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-sm">
            <span>{enquiry.phone}</span>
            <span className="text-slate-700">·</span>
            <span className="truncate">{enquiry.city}</span>
          </div>
        </div>
        <StageBadge stage={enquiry.stage} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-600 text-xs">{timeAgo}</span>
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {/* Quick contact buttons */}
          <a
            href={`tel:${enquiry.phone}`}
            aria-label={`Call ${enquiry.full_name}`}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/40
              flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          <a
            href={`https://wa.me/91${enquiry.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`WhatsApp ${enquiry.full_name}`}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-green-500/20 border border-slate-700 hover:border-green-500/40
              flex items-center justify-center text-slate-400 hover:text-green-400 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
          {/* Advance stage button */}
          {nextStage && (
            <button
              onClick={() => onStageChange(enquiry.id, nextStage)}
              disabled={updating}
              aria-label={`Move to ${STAGE_LABELS[nextStage]}`}
              title={`Move to ${STAGE_LABELS[nextStage]}`}
              className="h-8 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30
                text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-all duration-200
                disabled:opacity-50 flex items-center gap-1"
            >
              {updating ? (
                <span className="w-3 h-3 border border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
              ) : (
                <>
                  → {STAGE_LABELS[nextStage]}
                </>
              )}
            </button>
          )}
          {enquiry.stage !== 'dropped' && enquiry.stage !== 'converted' && !nextStage && null}
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
