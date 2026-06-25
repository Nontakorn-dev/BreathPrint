/**
 * Convert a recorded audio Blob (webm/opus from MediaRecorder) into a 16-bit PCM
 * WAV Blob, so the Python backend can decode it with `soundfile` WITHOUT ffmpeg.
 *
 * Flow: webm bytes → AudioContext.decodeAudioData → AudioBuffer → mono-interleaved
 * 16-bit PCM WAV. The backend resamples to the model's 16 kHz via librosa, so we
 * keep the buffer's native sample rate here.
 *
 * If decoding fails (rare), we fall back to returning the original blob — the
 * backend then uses the deterministic path, so inference still returns a result.
 */
export async function blobToWav(blob: Blob): Promise<Blob> {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const Ctx =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    try {
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
      return audioBufferToWav(audioBuffer)
    } finally {
      void ctx.close()
    }
  } catch (exc) {
    console.warn('[audio-wav] WAV conversion failed, sending original blob', exc)
    return blob
  }
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = buffer.length * blockAlign
  const bufferLength = 44 + dataSize

  const out = new ArrayBuffer(bufferLength)
  const view = new DataView(out)
  let pos = 0

  const writeStr = (s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i))
    pos += s.length
  }
  const writeU32 = (v: number) => {
    view.setUint32(pos, v, true)
    pos += 4
  }
  const writeU16 = (v: number) => {
    view.setUint16(pos, v, true)
    pos += 2
  }

  writeStr('RIFF')
  writeU32(bufferLength - 8)
  writeStr('WAVE')
  writeStr('fmt ')
  writeU32(16) // PCM chunk size
  writeU16(1) // PCM
  writeU16(numChannels)
  writeU32(buffer.sampleRate)
  writeU32(buffer.sampleRate * blockAlign) // byte rate
  writeU16(blockAlign)
  writeU16(16) // bits per sample
  writeStr('data')
  writeU32(dataSize)

  const channels: Float32Array[] = []
  for (let ch = 0; ch < numChannels; ch++) channels.push(buffer.getChannelData(ch))

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = Math.max(-1, Math.min(1, channels[ch][i]))
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
      view.setInt16(pos, sample, true)
      pos += 2
    }
  }

  return new Blob([out], { type: 'audio/wav' })
}
