import { create } from 'zustand'
import type { LocationData, SymptomScores } from '@/types'

export type WizardStep =
  | 'location'
  | 'symptoms'
  | 'breath'
  | 'cough'
  | 'pef'
  | 'submit'

interface ScreeningWizardState {
  step: WizardStep
  location: LocationData | null
  symptoms: SymptomScores
  breathBlob: Blob | null
  coughBlob: Blob | null
  breathDuration: number
  coughDuration: number
  pefValue: number | undefined
  exposureDoseWeekly: number | null
  audioQualityOk: boolean
  setStep: (step: WizardStep) => void
  setLocation: (loc: LocationData) => void
  setSymptoms: (symptoms: SymptomScores) => void
  setBreathRecording: (blob: Blob, duration: number, qualityOk: boolean) => void
  setCoughRecording: (blob: Blob, duration: number, qualityOk: boolean) => void
  setPefValue: (value: number | undefined) => void
  setExposureDose: (dose: number) => void
  reset: () => void
}

const defaultSymptoms: SymptomScores = {
  cough: 0,
  chestPain: 0,
  shortnessOfBreath: 0,
  wheeze: 0,
  fatigue: 0,
}

export const useScreeningStore = create<ScreeningWizardState>((set) => ({
  step: 'location',
  location: null,
  symptoms: { ...defaultSymptoms },
  breathBlob: null,
  coughBlob: null,
  breathDuration: 0,
  coughDuration: 0,
  pefValue: undefined,
  exposureDoseWeekly: null,
  audioQualityOk: true,
  setStep: (step) => set({ step }),
  setLocation: (location) => set({ location }),
  setSymptoms: (symptoms) => set({ symptoms }),
  setBreathRecording: (blob, duration, qualityOk) =>
    set({ breathBlob: blob, breathDuration: duration, audioQualityOk: qualityOk }),
  setCoughRecording: (blob, duration, qualityOk) =>
    set({ coughBlob: blob, coughDuration: duration, audioQualityOk: qualityOk }),
  setPefValue: (pefValue) => set({ pefValue }),
  setExposureDose: (exposureDoseWeekly) => set({ exposureDoseWeekly }),
  reset: () =>
    set({
      step: 'location',
      location: null,
      symptoms: { ...defaultSymptoms },
      breathBlob: null,
      coughBlob: null,
      breathDuration: 0,
      coughDuration: 0,
      pefValue: undefined,
      exposureDoseWeekly: null,
      audioQualityOk: true,
    }),
}))

export const WIZARD_STEPS: WizardStep[] = ['location', 'symptoms', 'breath', 'cough', 'pef', 'submit']

export function getStepIndex(step: WizardStep): number {
  return WIZARD_STEPS.indexOf(step)
}
