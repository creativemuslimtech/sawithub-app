export type NutrientKey = 'N' | 'P' | 'K'
export type SoilLevel = 'rendah' | 'sedang' | 'tinggi'

export type NutrientBreakdown = Record<NutrientKey, number>

export type FertilizerOption = {
  value: string
  label: string
  n: number
  p: number
  k: number
  note: string
}

type AgeDoseProfile = {
  label: string
  maxAge: number
  nutrients: NutrientBreakdown
}

export type SoilReference = {
  low: number
  high: number
  label: string
}

export type NutrientStatus = {
  value: number
  level: SoilLevel
  label: string
  multiplier: number
  referenceLabel: string
}

export type FertilizerCalculationInput = {
  ageYears: number
  treeCount: number
  soilN: number
  soilP: number
  soilK: number
  fertilizerN: number
  fertilizerP: number
  fertilizerK: number
  periodsPerYear: number
}

export type FertilizerCalculationResult = {
  ageProfile: string
  baseNeeds: NutrientBreakdown
  adjustedNeeds: NutrientBreakdown
  nutrientStatus: Record<NutrientKey, NutrientStatus>
  fertilizerContent: NutrientBreakdown
  annualDosePerTreeKg: number
  annualDoseTotalKg: number
  dosePerPeriodTotalKg: number
  dosePerPeriodPerTreeKg: number
  limitingNutrient: NutrientKey | null
  missingNutrients: NutrientKey[]
}

export const FERTILIZER_OPTIONS: FertilizerOption[] = [
  { value: 'npk-12-12-17', label: 'NPK 12-12-17', n: 12, p: 12, k: 17, note: 'Cocok untuk pupuk majemuk yang seimbang.' },
  { value: 'npk-12-12-27', label: 'NPK 12-12-27', n: 12, p: 12, k: 27, note: 'Sering dipakai saat kebutuhan kalium lebih besar.' },
  { value: 'npk-13-6-27', label: 'NPK 13-6-27', n: 13, p: 6, k: 27, note: 'Pilihan saat fokus ke pertumbuhan dan kalium.' },
  { value: 'npk-15-15-15', label: 'NPK 15-15-15', n: 15, p: 15, k: 15, note: 'Pupuk majemuk umum untuk kebutuhan seimbang.' },
  { value: 'npk-16-16-16', label: 'NPK 16-16-16', n: 16, p: 16, k: 16, note: 'Pupuk majemuk dengan kadar unsur lebih tinggi.' },
  { value: 'manual', label: 'Manual (isi kadar N, P, K sendiri)', n: 0, p: 0, k: 0, note: 'Gunakan jika pupuk Anda tidak ada di daftar.' },
]

export const PERIOD_OPTIONS = [
  { value: 1, label: '1 kali/tahun' },
  { value: 2, label: '2 kali/tahun' },
  { value: 3, label: '3 kali/tahun' },
  { value: 4, label: '4 kali/tahun' },
  { value: 6, label: '6 kali/tahun' },
]

export const SOIL_REFERENCES: Record<NutrientKey, SoilReference> = {
  N: { low: 0.08, high: 0.15, label: '0,08% - 0,15%' },
  P: { low: 0.03, high: 0.08, label: '0,03% - 0,08%' },
  K: { low: 0.08, high: 0.15, label: '0,08% - 0,15%' },
}

export const AVERAGE_SOIL_VALUES: NutrientBreakdown = {
  N: 0.1,
  P: 0.05,
  K: 0.1,
}

const AGE_DOSE_PROFILES: AgeDoseProfile[] = [
  {
    label: '1 - 2 tahun',
    maxAge: 2,
    nutrients: { N: 0.35, P: 0.2, K: 0.4 },
  },
  {
    label: '3 - 4 tahun',
    maxAge: 4,
    nutrients: { N: 0.55, P: 0.25, K: 0.7 },
  },
  {
    label: '5 - 7 tahun',
    maxAge: 7,
    nutrients: { N: 0.8, P: 0.35, K: 1.1 },
  },
  {
    label: '8 - 12 tahun',
    maxAge: 12,
    nutrients: { N: 0.95, P: 0.4, K: 1.35 },
  },
  {
    label: '13 tahun ke atas',
    maxAge: Number.POSITIVE_INFINITY,
    nutrients: { N: 0.85, P: 0.35, K: 1.15 },
  },
]

const SOIL_LEVEL_META: Record<SoilLevel, { label: string; multiplier: number }> = {
  rendah: { label: 'Rendah', multiplier: 1.15 },
  sedang: { label: 'Sedang', multiplier: 1 },
  tinggi: { label: 'Tinggi', multiplier: 0.85 },
}

export function getAgeDoseProfile(ageYears: number) {
  return AGE_DOSE_PROFILES.find((profile) => ageYears <= profile.maxAge) ?? AGE_DOSE_PROFILES[AGE_DOSE_PROFILES.length - 1]
}

export function getFertilizerOptionByValue(value: string) {
  return FERTILIZER_OPTIONS.find((item) => item.value === value) ?? FERTILIZER_OPTIONS[0]
}

export function getSoilStatus(value: number, nutrient: NutrientKey): NutrientStatus {
  const reference = SOIL_REFERENCES[nutrient]
  const level: SoilLevel = value < reference.low ? 'rendah' : value > reference.high ? 'tinggi' : 'sedang'
  const meta = SOIL_LEVEL_META[level]

  return {
    value,
    level,
    label: meta.label,
    multiplier: meta.multiplier,
    referenceLabel: reference.label,
  }
}

export function calculateFertilizerRecommendation(input: FertilizerCalculationInput): FertilizerCalculationResult {
  const ageProfile = getAgeDoseProfile(input.ageYears)
  const nutrientStatus = {
    N: getSoilStatus(input.soilN, 'N'),
    P: getSoilStatus(input.soilP, 'P'),
    K: getSoilStatus(input.soilK, 'K'),
  }

  const baseNeeds = ageProfile.nutrients
  const adjustedNeeds = {
    N: baseNeeds.N * nutrientStatus.N.multiplier,
    P: baseNeeds.P * nutrientStatus.P.multiplier,
    K: baseNeeds.K * nutrientStatus.K.multiplier,
  }

  const fertilizerContent = {
    N: input.fertilizerN,
    P: input.fertilizerP,
    K: input.fertilizerK,
  }

  const missingNutrients = (Object.keys(adjustedNeeds) as NutrientKey[]).filter((key) => adjustedNeeds[key] > 0 && fertilizerContent[key] <= 0)

  const doseCandidates = (Object.keys(adjustedNeeds) as NutrientKey[])
    .map((key) => {
      const contentFraction = fertilizerContent[key] / 100
      if (contentFraction <= 0) return { key, dose: 0 }
      return {
        key,
        dose: adjustedNeeds[key] / contentFraction,
      }
    })

  const limiting = doseCandidates.reduce<{ key: NutrientKey | null; dose: number }>(
    (current, item) => (item.dose > current.dose ? item : current),
    { key: null, dose: 0 },
  )

  const annualDosePerTreeKg = limiting.dose
  const annualDoseTotalKg = annualDosePerTreeKg * input.treeCount
  const dosePerPeriodTotalKg = annualDoseTotalKg / input.periodsPerYear
  const dosePerPeriodPerTreeKg = annualDosePerTreeKg / input.periodsPerYear

  return {
    ageProfile: ageProfile.label,
    baseNeeds,
    adjustedNeeds,
    nutrientStatus,
    fertilizerContent,
    annualDosePerTreeKg,
    annualDoseTotalKg,
    dosePerPeriodTotalKg,
    dosePerPeriodPerTreeKg,
    limitingNutrient: limiting.key,
    missingNutrients,
  }
}
