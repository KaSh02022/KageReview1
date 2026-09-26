export type SortKey = 'az' | 'za' | 'newest' | 'oldest'

export interface FacetOption {
  value: string
  label: string
  count: number
  disabled: boolean
}

export interface FacetGroup {
  key: 'category' | 'status'
  legend: string
  options: FacetOption[]
}
