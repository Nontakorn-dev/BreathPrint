import { useState, useRef, useCallback, useEffect } from 'react'

export interface AudioRecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
  audioUrl: string | null
  waveform: number[]
  qualityOk: boolean
  qualityMessage: string | null
  error: string | null
}

interface UseAudioRecorderOptions {
  maxDuration?: number
  minDuration?: number
  minSnrThreshold?: number
}

export function useAudioRecorder(options: UseAudioRecorderOptions = {}) {
  const { maxDuration = 30, minDuration = 3, minSnrThreshold = 0.02 } = options

  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    waveform: [],
    qualityOk: true,
    qualityMessage: null,
    error: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    audioContextRef.current?.close()
    mediaRecorderRef.current = null
    analyserRef.current = null
    audioContextRef.current = null
    streamRef.current = null
  }, [])

  useEffect(() => () => cleanup(), [cleanup])

  const analyzeQuality = useCallback(
    (blob: Blob, avgLevel: number): { ok: boolean; message: string | null } => {
      if (avgLevel < minSnrThreshold) {
        return {
          ok: false,
          message: 'เสียงเบาเกินไป — ลองถือมือถือใกล้ปาก/จมูกมากขึ้น',
        }
      }
      if (blob.size < 1000) {
        return { ok: false, message: 'ไฟล์เสียงสั้นเกินไป — กรุณาบันทึกใหม่' }
      }
      return { ok: true, message: null }
    },
    [minSnrThreshold],
  )

  const startRecording = useCallback(async () => {
    try {
      cleanup()
      chunksRef.current = []

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      streamRef.current = stream

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      let levelSum = 0
      let levelCount = 0
      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const updateWaveform = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length / 255
        levelSum += avg
        levelCount++
        const bars = Array.from({ length: 32 }, (_, i) => {
          const idx = Math.floor((i / 32) * dataArray.length)
          return dataArray[idx]! / 255
        })
        setState((s) => ({ ...s, waveform: bars }))
        animFrameRef.current = requestAnimationFrame(updateWaveform)
      }

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        const url = URL.createObjectURL(blob)
        const avgLevel = levelCount > 0 ? levelSum / levelCount : 0
        const quality = analyzeQuality(blob, avgLevel)

        setState((s) => ({
          ...s,
          isRecording: false,
          audioBlob: blob,
          audioUrl: url,
          qualityOk: quality.ok,
          qualityMessage: quality.message,
        }))
        cleanup()
      }

      recorder.start(100)
      updateWaveform()

      let elapsed = 0
      timerRef.current = window.setInterval(() => {
        elapsed += 0.1
        setState((s) => ({ ...s, duration: elapsed }))
        if (elapsed >= maxDuration) {
          recorder.stop()
          if (timerRef.current) clearInterval(timerRef.current)
        }
      }, 100)

      setState((s) => ({
        ...s,
        isRecording: true,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
        waveform: [],
        qualityOk: true,
        qualityMessage: null,
        error: null,
      }))
    } catch {
      setState((s) => ({
        ...s,
        error: 'ไม่สามารถเข้าถึงไมโครโฟนได้ — กรุณาอนุญาตการใช้งาน',
        isRecording: false,
      }))
    }
  }, [cleanup, maxDuration, analyzeQuality])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      if (state.duration < minDuration) {
        setState((s) => ({
          ...s,
          error: `กรุณาบันทึกอย่างน้อย ${minDuration} วินาที`,
        }))
        return
      }
      mediaRecorderRef.current.stop()
      if (timerRef.current) clearInterval(timerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [minDuration, state.duration])

  const reset = useCallback(() => {
    cleanup()
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      waveform: [],
      qualityOk: true,
      qualityMessage: null,
      error: null,
    })
  }, [cleanup])

  return { ...state, startRecording, stopRecording, reset }
}
