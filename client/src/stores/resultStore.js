import { create } from 'zustand'

// Default values matching the PDF template
const defaultPatientInfo = {
    name: '',
    code: '',
    birthYear: null,
    gender: ''
}

const defaultHealthScore = {
    score: 50,
    rating: 'Trung bình',
    comment: ''
}

const defaultBioAge = {
    realAge: 0,
    bioAge: 0,
    warning: ''
}

const defaultOrganSummary = {
    cardiovascular: { position: 50, rating: 'Trung bình' },
    liver: { position: 50, rating: 'Trung bình' },
    kidney: { position: 50, rating: 'Trung bình' },
    blood: { position: 50, rating: 'Trung bình' }
}

const defaultCardiovascularRisk = {
    castelli1: { value: '', position: 3, valueColor: '' },
    castelli2: { value: '', position: 3, valueColor: '' },
    tygIndex: { value: '', position: 3, valueColor: '' },
    aip: { value: '', position: 3, valueColor: '' },
    comment: ''
}

const defaultLiverFibrosis = {
    fib4: { value: '', position: 3, valueColor: '' },
    apri: { value: '', position: 3, valueColor: '' },
    deRitis: { value: '', position: 3, valueColor: '' },
    comment: ''
}

const defaultInflammation = {
    sii: { value: '', position: 3, valueColor: '' },
    glr: { value: '', position: 3, valueColor: '' },
    plr: { value: '', position: 3, valueColor: '' },
    lmr: { value: '', position: 3, valueColor: '' },
    comment: ''
}

// Raw inputs (from sheet / external AI output). Stored as strings to preserve formatting.
const defaultRawMetrics = {
    heightCm: '',
    weightKg: '',
    gender: '',
    age: '',
    bmi: '',
    bsa: '',
    glucose: '',
    wbc: '',
    lymAbs: '',
    midAbs: '',
    granAbs: '',
    lymPct: '',
    midPct: '',
    granPct: '',
    rbc: '',
    hgb: '',
    hct: '',
    mcv: '',
    mch: '',
    mchc: '',
    rdwCv: '',
    plt: '',
    mpv: '',
    pdw: '',
    pct: '',
    glr: '',
    plr: '',
    sii: '',
    lmr: '',
    emr: '',
    mentzer: '',
    greenKing: '',
    rdwi: '',
    srivastava: '',
    cholesterol: '',
    triglyceride: '',
    nonHdl: '',
    hdl: '',
    ldl: '',
    vldl: '',
    castelli1: '',
    castelli2: '',
    aip: '',
    tygIndex: '',
    ast: '',
    alt: '',
    deRitis: '',
    fib4: '',
    apri: '',
    urea: '',
    creatinine: '',
    bun: '',
    ratioUreaCre: '',
    egfr: '',
    ecrcl: '',
    healthScore: '',
    bioAge: ''
}

const defaultBiochemistry = []

const defaultUrinalysis = []

const defaultThalassemia = {
    mentzer: { value: null, color: 'normal' },
    greenKing: { value: null, color: 'normal' },
    rdwi: { value: null, color: 'normal' },
    srivastava: { value: null, color: 'normal' },
    comment: ''
}

const defaultEvaluation = {
    negatives: '',
    positives: '',
    general: ''
}

const defaultSignature = {
    location: 'TP. Hồ Chí Minh',
    day: new Date().getDate(),
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    name: ''
}

export const useResultStore = create((set, get) => ({
    // State
    patientInfo: { ...defaultPatientInfo },
    healthScore: { ...defaultHealthScore },
    bioAge: { ...defaultBioAge },
    organSummary: { ...defaultOrganSummary },
    cardiovascularRisk: { ...defaultCardiovascularRisk },
    liverFibrosis: { ...defaultLiverFibrosis },
    inflammation: { ...defaultInflammation },
    biochemistry: [...defaultBiochemistry],
    urinalysis: [...defaultUrinalysis],
    thalassemia: { ...defaultThalassemia },
    evaluation: { ...defaultEvaluation },
    signature: { ...defaultSignature },
    rawMetrics: { ...defaultRawMetrics },

    // Simple setters
    setPatientInfo: (data) => set({ patientInfo: data }),
    patchPatientInfo: (patch) => set((state) => ({ patientInfo: { ...state.patientInfo, ...(patch || {}) } })),
    setHealthScore: (data) => set({ healthScore: data }),
    patchHealthScore: (patch) => set((state) => ({ healthScore: { ...state.healthScore, ...(patch || {}) } })),
    setBioAge: (data) => set({ bioAge: data }),
    patchBioAge: (patch) => set((state) => ({ bioAge: { ...state.bioAge, ...(patch || {}) } })),
    setOrganSummary: (data) => set({ organSummary: data }),
    setCardiovascularRisk: (data) => set({ cardiovascularRisk: data }),
    setLiverFibrosis: (data) => set({ liverFibrosis: data }),
    setInflammation: (data) => set({ inflammation: data }),
    setBiochemistry: (data) => set({ biochemistry: data }),
    setUrinalysis: (data) => set({ urinalysis: data }),
    setThalassemia: (data) => set({ thalassemia: data }),
    setEvaluation: (data) => set({ evaluation: data }),
    setSignature: (data) => set({ signature: data }),
    setRawMetrics: (data) => set({ rawMetrics: data }),
    patchRawMetrics: (patch) => set((state) => ({ rawMetrics: { ...state.rawMetrics, ...(patch || {}) } })),

    // Set all data at once (for loading from API)
    setAllData: (data) => set({
        patientInfo: data.patientInfo || { ...defaultPatientInfo },
        healthScore: data.healthScore || { ...defaultHealthScore },
        bioAge: data.bioAge || { ...defaultBioAge },
        organSummary: data.organSummary || { ...defaultOrganSummary },
        cardiovascularRisk: data.cardiovascularRisk || { ...defaultCardiovascularRisk },
        liverFibrosis: data.liverFibrosis || { ...defaultLiverFibrosis },
        inflammation: data.inflammation || { ...defaultInflammation },
        biochemistry: data.biochemistry || [...defaultBiochemistry],
        urinalysis: data.urinalysis || [...defaultUrinalysis],
        thalassemia: data.thalassemia || { ...defaultThalassemia },
        evaluation: data.evaluation || { ...defaultEvaluation },
        signature: data.signature || { ...defaultSignature },
        rawMetrics: data.rawMetrics || { ...defaultRawMetrics }
    }),

    // Get all data (for saving to API)
    getAllData: () => {
        const state = get()
        return {
            patientInfo: state.patientInfo,
            healthScore: state.healthScore,
            bioAge: state.bioAge,
            organSummary: state.organSummary,
            cardiovascularRisk: state.cardiovascularRisk,
            liverFibrosis: state.liverFibrosis,
            inflammation: state.inflammation,
            biochemistry: state.biochemistry,
            urinalysis: state.urinalysis,
            thalassemia: state.thalassemia,
            evaluation: state.evaluation,
            signature: state.signature,
            rawMetrics: state.rawMetrics
        }
    },

    // Reset to defaults
    reset: () => set({
        patientInfo: { ...defaultPatientInfo },
        healthScore: { ...defaultHealthScore },
        bioAge: { ...defaultBioAge },
        organSummary: { ...defaultOrganSummary },
        cardiovascularRisk: { ...defaultCardiovascularRisk },
        liverFibrosis: { ...defaultLiverFibrosis },
        inflammation: { ...defaultInflammation },
        biochemistry: [...defaultBiochemistry],
        urinalysis: [...defaultUrinalysis],
        thalassemia: { ...defaultThalassemia },
        evaluation: { ...defaultEvaluation },
        signature: { ...defaultSignature },
        rawMetrics: { ...defaultRawMetrics }
    })
}))
