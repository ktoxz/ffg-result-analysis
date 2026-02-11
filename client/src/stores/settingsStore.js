import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Default biochemistry thresholds
const defaultBiochemistrySettings = {
    AST: {
        low: 15,
        high: 39.9,
        unit: 'U/L',
        unitOptions: ['U/L'],
        referenceText: '15-39,9'
    },
    ALT: {
        low: 15,
        high: 40.8,
        unit: 'U/L',
        unitOptions: ['U/L'],
        referenceText: '15-40,8'
    },
    Glucose: {
        low: 4.07,
        high: 5.5,
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL'],
        referenceText: '4,07-5,5'
    },
    Triglyceride: {
        low: 0.02,
        high: 1.7,
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL'],
        referenceText: '0,02-1,7'
    },
    Cholesterol: {
        low: 3.9,
        high: 5.2,
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL'],
        referenceText: '3,9-5,2'
    },
    LDL: {
        low: 0.2,
        high: 3.39,
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL'],
        referenceText: '0,2-3,39'
    },
    HDL: {
        low: 1.0,
        high: 999,
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL'],
        referenceText: '≥ 1,0'
    },
    Creatinine: {
        low: 53.04,
        high: 106.08,
        unit: 'μmol/L',
        unitOptions: ['μmol/L', 'mg/dL'],
        referenceText: '53,04-106,08'
    },
    Urea: {
        low: 2.8,
        high: 7.2,
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL'],
        referenceText: '2,8-7,2'
    },
    'Uric Acid': {
        low: 180,
        high: 420,
        unit: 'μmol/L',
        unitOptions: ['μmol/L', 'mg/dL'],
        referenceText: '180-420'
    },
    HbA1c: {
        low: 4.0,
        high: 5.6,
        unit: '%',
        unitOptions: ['%'],
        referenceText: '4,0-5,6'
    },
    CRP: {
        low: 0,
        high: 5,
        unit: 'mg/L',
        unitOptions: ['mg/L'],
        referenceText: '0-5'
    }
}

// Default urinalysis reference + units (match the provided template screenshot)
const defaultUrinalysisSettings = {
    LEU: {
        referenceText: '',
        unit: 'Cell/uL',
        unitOptions: ['Cell/uL']
    },
    KET: {
        referenceText: '',
        unit: 'mmol/L',
        unitOptions: ['mmol/L']
    },
    NIT: {
        referenceText: '',
        unit: '',
        unitOptions: []
    },
    URO: {
        referenceText: '',
        unit: '',
        unitOptions: []
    },
    BIL: {
        referenceText: '',
        unit: 'umol/L',
        unitOptions: ['umol/L', 'μmol/L']
    },
    PRO: {
        referenceText: '',
        unit: 'g/L',
        unitOptions: ['g/L', 'mg/dL']
    },
    GLU: {
        referenceText: '',
        unit: 'mmol/L',
        unitOptions: ['mmol/L', 'mg/dL']
    },
    SG: {
        referenceText: '1,005-1,030',
        unit: '',
        unitOptions: []
    },
    BLD: {
        referenceText: '',
        unit: 'Cell/uL',
        unitOptions: ['Cell/uL']
    },
    pH: {
        referenceText: '4,6-8,0',
        unit: '',
        unitOptions: []
    }
}

// Default 5-level thresholds (thresholds for levels 1-4, anything above is level 5)
const defaultCardiovascularSettings = {
    strokeRisk: { thresholds: [20, 40, 60, 80] },
    heartAttackRisk: { thresholds: [20, 40, 60, 80] },
    atherosclerosis: { thresholds: [20, 40, 60, 80] },
    metabolicSyndrome: { thresholds: [20, 40, 60, 80] }
}

const defaultLiverFibrosisSettings = {
    fibrosisRisk: { thresholds: [20, 40, 60, 80] },
    fattyLiver: { thresholds: [20, 40, 60, 80] },
    cirrhosis: { thresholds: [20, 40, 60, 80] }
}

const defaultInflammationSettings = {
    immunity: { thresholds: [20, 40, 60, 80] },
    inflammation: { thresholds: [20, 40, 60, 80] },
    oxidativeStress: { thresholds: [20, 40, 60, 80] },
    chronicDisease: { thresholds: [20, 40, 60, 80] }
}

const defaultPdfAssets = {
    bannerGradient: 'linear-gradient(90deg, #0b4fb3 0%, #b54ad5 100%)',
    logoUrl: '',
    thalassemiaImageUrl: '',
    deepDiveIcons: {
        cardiovascular: '',
        liver: '',
        inflammation: ''
    },
    fiveLevelBar: {
        colors: ['#ef4444', '#f97316', '#22c55e', '#f97316', '#ef4444'],
        markerColor: '#1d4ed8',
        markerStrokeColor: '#0b2a6f',
        markerStrokeWidth: 1.5,
        markerSize: 20,
        markerImageUrl: ''
    },
    healthGauge: {
        mode: 'segments',
        segmentColors: ['#ef4444', '#f97316', '#fb923c', '#facc15', '#a3e635', '#84cc16', '#22c55e', '#10b981'],
        arcThickness: 26,
        needleColor: '#111827',
        startAngle: 150,
        arcDegrees: 240,
        sweepFlag: 1
    },
    evaluationIcons: {
        negatives: '',
        positives: '',
        general: ''
    },
    organIcons: {
        cardiovascular: '',
        blood: '',
        liver: '',
        kidney: ''
    }
}

export const useSettingsStore = create(
    persist(
        (set, get) => ({
            biochemistrySettings: { ...defaultBiochemistrySettings },
            urinalysisSettings: { ...defaultUrinalysisSettings },
            cardiovascularSettings: { ...defaultCardiovascularSettings },
            liverFibrosisSettings: { ...defaultLiverFibrosisSettings },
            inflammationSettings: { ...defaultInflammationSettings },
            pdfAssets: { ...defaultPdfAssets, organIcons: { ...defaultPdfAssets.organIcons } },

            updatePdfAssets: (updates) => set((state) => ({
                pdfAssets: {
                    ...state.pdfAssets,
                    ...updates,
                    organIcons: {
                        ...state.pdfAssets.organIcons,
                        ...(updates.organIcons || {})
                    },
                    deepDiveIcons: {
                        ...state.pdfAssets.deepDiveIcons,
                        ...(updates.deepDiveIcons || {})
                    },
                    evaluationIcons: {
                        ...state.pdfAssets.evaluationIcons,
                        ...(updates.evaluationIcons || {})
                    }
                }
            })),

            resetPdfAssets: () => set({
                pdfAssets: { ...defaultPdfAssets, organIcons: { ...defaultPdfAssets.organIcons } }
            }),

            // Update biochemistry settings
            updateBiochemistrySettings: (name, updates) => set((state) => ({
                biochemistrySettings: {
                    ...state.biochemistrySettings,
                    [name]: { ...state.biochemistrySettings[name], ...updates }
                }
            })),

            // Update urinalysis settings
            updateUrinalysisSettings: (name, updates) => set((state) => ({
                urinalysisSettings: {
                    ...state.urinalysisSettings,
                    [name]: { ...state.urinalysisSettings[name], ...updates }
                }
            })),

            // Update cardiovascular settings
            updateCardiovascularSettings: (key, updates) => set((state) => ({
                cardiovascularSettings: {
                    ...state.cardiovascularSettings,
                    [key]: { ...state.cardiovascularSettings[key], ...updates }
                }
            })),

            // Update liver fibrosis settings
            updateLiverFibrosisSettings: (key, updates) => set((state) => ({
                liverFibrosisSettings: {
                    ...state.liverFibrosisSettings,
                    [key]: { ...state.liverFibrosisSettings[key], ...updates }
                }
            })),

            // Update inflammation settings
            updateInflammationSettings: (key, updates) => set((state) => ({
                inflammationSettings: {
                    ...state.inflammationSettings,
                    [key]: { ...state.inflammationSettings[key], ...updates }
                }
            })),

            // Calculate biochemistry status based on value
            calculateBiochemistryStatus: (name, value) => {
                const settings = get().biochemistrySettings[name]
                if (!settings || value === null || value === undefined || value === '') {
                    return 'Bình Thường'
                }

                const numValue = parseFloat(String(value).replace(',', '.'))
                if (isNaN(numValue)) return 'Bình Thường'

                if (numValue < settings.low) return 'Thấp'
                if (numValue > settings.high) return 'Cao'
                return 'Bình Thường'
            },

            // Calculate 5-level position from value and thresholds
            calculatePosition: (category, key, value) => {
                let settings
                switch (category) {
                    case 'cardiovascular':
                        settings = get().cardiovascularSettings[key]
                        break
                    case 'liverFibrosis':
                        settings = get().liverFibrosisSettings[key]
                        break
                    case 'inflammation':
                        settings = get().inflammationSettings[key]
                        break
                    default:
                        return 3
                }

                if (!settings?.thresholds || value === null || value === undefined) return 3

                const numValue = parseFloat(String(value).replace(',', '.'))
                if (isNaN(numValue)) return 3

                const thresholds = settings.thresholds
                if (numValue < thresholds[0]) return 1
                if (numValue < thresholds[1]) return 2
                if (numValue < thresholds[2]) return 3
                if (numValue < thresholds[3]) return 4
                return 5
            },

            // Reset to defaults
            resetToDefaults: () => set({
                biochemistrySettings: { ...defaultBiochemistrySettings },
                urinalysisSettings: { ...defaultUrinalysisSettings },
                cardiovascularSettings: { ...defaultCardiovascularSettings },
                liverFibrosisSettings: { ...defaultLiverFibrosisSettings },
                inflammationSettings: { ...defaultInflammationSettings },
                pdfAssets: { ...defaultPdfAssets, organIcons: { ...defaultPdfAssets.organIcons } }
            })
        }),
        {
            name: 'ffg-settings-storage'
        }
    )
)
