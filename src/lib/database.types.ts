export type EnquiryStage =
  | 'new'
  | 'contacted'
  | 'conference_call'
  | 'clinic_visit'
  | 'converted'
  | 'dropped'

export interface Enquiry {
  id: string
  full_name: string
  phone: string
  city: string
  stage: EnquiryStage
  notes: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      enquiries: {
        Row: Enquiry
        Insert: Omit<Enquiry, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: Partial<Omit<Enquiry, 'id' | 'created_at'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      enquiry_stage: EnquiryStage
    }
  }
}

export const STAGE_LABELS: Record<EnquiryStage, string> = {
  new: 'New',
  contacted: 'Contacted',
  conference_call: 'Conference Call',
  clinic_visit: 'Clinic Visit',
  converted: 'Converted',
  dropped: 'Dropped',
}

export const STAGE_ORDER: EnquiryStage[] = [
  'new',
  'contacted',
  'conference_call',
  'clinic_visit',
  'converted',
  'dropped',
]

export const STAGE_COLORS: Record<EnquiryStage, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  contacted: { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  conference_call: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  clinic_visit: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  converted: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  dropped: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
}
