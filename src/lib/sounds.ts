let audioContext: AudioContext | null = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  
  if (!audioContext) {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContextClass) {
        audioContext = new AudioContextClass()
      }
    } catch (error) {
      console.warn('Failed to create AudioContext:', error)
      return null
    }
  }
  
  return audioContext
}

const createReverb = (ctx: AudioContext, duration: number = 1.5, decay: number = 2) => {
  const convolver = ctx.createConvolver()
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const impulse = ctx.createBuffer(2, length, sampleRate)
  const impulseL = impulse.getChannelData(0)
  const impulseR = impulse.getChannelData(1)
  
  for (let i = 0; i < length; i++) {
    const n = length - i
    impulseL[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay)
    impulseR[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay)
  }
  
  convolver.buffer = impulse
  return convolver
}

const createRichOscillator = (
  ctx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  gain: number,
  reverb?: ConvolverNode
) => {
  const mainOsc = ctx.createOscillator()
  const harmonic1 = ctx.createOscillator()
  const harmonic2 = ctx.createOscillator()
  
  const mainGain = ctx.createGain()
  const harmonic1Gain = ctx.createGain()
  const harmonic2Gain = ctx.createGain()
  const masterGain = ctx.createGain()
  
  mainOsc.type = 'sine'
  harmonic1.type = 'sine'
  harmonic2.type = 'sine'
  
  mainOsc.frequency.setValueAtTime(frequency, startTime)
  harmonic1.frequency.setValueAtTime(frequency * 2, startTime)
  harmonic2.frequency.setValueAtTime(frequency * 3, startTime)
  
  mainGain.gain.setValueAtTime(gain, startTime)
  harmonic1Gain.gain.setValueAtTime(gain * 0.3, startTime)
  harmonic2Gain.gain.setValueAtTime(gain * 0.15, startTime)
  
  masterGain.gain.setValueAtTime(1, startTime)
  masterGain.gain.exponentialRampToValueAtTime(0.01, startTime + duration)
  
  mainOsc.connect(mainGain)
  harmonic1.connect(harmonic1Gain)
  harmonic2.connect(harmonic2Gain)
  
  mainGain.connect(masterGain)
  harmonic1Gain.connect(masterGain)
  harmonic2Gain.connect(masterGain)
  
  if (reverb) {
    const dryGain = ctx.createGain()
    const wetGain = ctx.createGain()
    
    dryGain.gain.value = 0.7
    wetGain.gain.value = 0.3
    
    masterGain.connect(dryGain)
    masterGain.connect(reverb)
    reverb.connect(wetGain)
    
    dryGain.connect(ctx.destination)
    wetGain.connect(ctx.destination)
  } else {
    masterGain.connect(ctx.destination)
  }
  
  mainOsc.start(startTime)
  harmonic1.start(startTime)
  harmonic2.start(startTime)
  
  mainOsc.stop(startTime + duration)
  harmonic1.stop(startTime + duration)
  harmonic2.stop(startTime + duration)
}

export const playSpinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const osc3 = ctx.createOscillator()
  
  const gain1 = ctx.createGain()
  const gain2 = ctx.createGain()
  const gain3 = ctx.createGain()
  const masterGain = ctx.createGain()
  
  osc1.type = 'sine'
  osc2.type = 'sine'
  osc3.type = 'triangle'
  
  osc1.frequency.setValueAtTime(200, now)
  osc1.frequency.exponentialRampToValueAtTime(600, now + 0.3)
  
  osc2.frequency.setValueAtTime(300, now)
  osc2.frequency.exponentialRampToValueAtTime(900, now + 0.3)
  
  osc3.frequency.setValueAtTime(100, now)
  osc3.frequency.exponentialRampToValueAtTime(300, now + 0.3)
  
  gain1.gain.setValueAtTime(0.15, now)
  gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  gain2.gain.setValueAtTime(0.08, now)
  gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  gain3.gain.setValueAtTime(0.2, now)
  gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  
  osc1.connect(gain1)
  osc2.connect(gain2)
  osc3.connect(gain3)
  
  gain1.connect(masterGain)
  gain2.connect(masterGain)
  gain3.connect(masterGain)
  masterGain.connect(ctx.destination)
  
  osc1.start(now)
  osc2.start(now)
  osc3.start(now)
  
  osc1.stop(now + 0.3)
  osc2.stop(now + 0.3)
  osc3.stop(now + 0.3)
}

export const playReelStopSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  
  const whiteNoise = ctx.createBufferSource()
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < buffer.length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  
  whiteNoise.buffer = buffer
  
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(800, now)
  filter.Q.setValueAtTime(10, now)
  
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0.3, now)
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
  
  const osc = ctx.createOscillator()
  const oscGain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(300, now + 0.08)
  oscGain.gain.setValueAtTime(0.15, now)
  oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
  
  whiteNoise.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  osc.connect(oscGain)
  oscGain.connect(ctx.destination)
  
  whiteNoise.start(now)
  osc.start(now)
  
  whiteNoise.stop(now + 0.08)
  osc.stop(now + 0.08)
}

export const playSmallWinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  const reverb = createReverb(ctx, 1, 2.5)
  
  const chord = [523.25, 659.25, 783.99]
  
  chord.forEach((freq, i) => {
    createRichOscillator(ctx, freq, now + i * 0.05, 0.6, 0.18, reverb)
  })
  
  const sparkle = ctx.createOscillator()
  const sparkleGain = ctx.createGain()
  sparkle.type = 'sine'
  sparkle.frequency.setValueAtTime(2000, now)
  sparkle.frequency.exponentialRampToValueAtTime(4000, now + 0.4)
  sparkleGain.gain.setValueAtTime(0.08, now)
  sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
  sparkle.connect(sparkleGain)
  sparkleGain.connect(ctx.destination)
  sparkle.start(now)
  sparkle.stop(now + 0.4)
}

export const playBigWinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  const reverb = createReverb(ctx, 2, 3)
  
  const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51]
  
  melody.forEach((freq, i) => {
    createRichOscillator(ctx, freq, now + i * 0.12, 0.8, 0.25, reverb)
  })
  
  for (let i = 0; i < 3; i++) {
    const bass = ctx.createOscillator()
    const bassGain = ctx.createGain()
    bass.type = 'sine'
    bass.frequency.setValueAtTime(130.81, now + i * 0.2)
    bassGain.gain.setValueAtTime(0.3, now + i * 0.2)
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.6)
    bass.connect(bassGain)
    bassGain.connect(reverb)
    reverb.connect(ctx.destination)
    bass.start(now + i * 0.2)
    bass.stop(now + i * 0.2 + 0.6)
  }
  
  for (let i = 0; i < 8; i++) {
    const sparkle = ctx.createOscillator()
    const sparkleGain = ctx.createGain()
    sparkle.type = 'sine'
    sparkle.frequency.setValueAtTime(2000 + Math.random() * 2000, now + i * 0.08)
    sparkleGain.gain.setValueAtTime(0.06, now + i * 0.08)
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.3)
    sparkle.connect(sparkleGain)
    sparkleGain.connect(ctx.destination)
    sparkle.start(now + i * 0.08)
    sparkle.stop(now + i * 0.08 + 0.3)
  }
}

export const playMegaWinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  const reverb = createReverb(ctx, 3, 4)
  
  const epicChord = [
    261.63, 329.63, 392.00, 523.25, 
    659.25, 783.99, 1046.50, 1318.51
  ]
  
  epicChord.forEach((freq, i) => {
    createRichOscillator(ctx, freq, now + i * 0.08, 1.5, 0.28, reverb)
    
    setTimeout(() => {
      createRichOscillator(ctx, freq * 2, now + i * 0.08 + 0.05, 1, 0.12, reverb)
    }, 0)
  })
  
  for (let i = 0; i < 5; i++) {
    const bass = ctx.createOscillator()
    const bassGain = ctx.createGain()
    bass.type = 'sine'
    bass.frequency.setValueAtTime(65.41, now + i * 0.15)
    bassGain.gain.setValueAtTime(0.4, now + i * 0.15)
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 1)
    bass.connect(bassGain)
    bassGain.connect(reverb)
    reverb.connect(ctx.destination)
    bass.start(now + i * 0.15)
    bass.stop(now + i * 0.15 + 1)
  }
  
  for (let i = 0; i < 20; i++) {
    const sparkle = ctx.createOscillator()
    const sparkleGain = ctx.createGain()
    sparkle.type = 'sine'
    sparkle.frequency.setValueAtTime(1500 + Math.random() * 3000, now + i * 0.05)
    sparkleGain.gain.setValueAtTime(0.08, now + i * 0.05)
    sparkleGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.4)
    sparkle.connect(sparkleGain)
    sparkleGain.connect(reverb)
    reverb.connect(ctx.destination)
    sparkle.start(now + i * 0.05)
    sparkle.stop(now + i * 0.05 + 0.4)
  }
  
  const sweep = ctx.createOscillator()
  const sweepGain = ctx.createGain()
  sweep.type = 'sawtooth'
  sweep.frequency.setValueAtTime(100, now)
  sweep.frequency.exponentialRampToValueAtTime(2000, now + 1.2)
  sweepGain.gain.setValueAtTime(0.15, now)
  sweepGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2)
  sweep.connect(sweepGain)
  sweepGain.connect(reverb)
  reverb.connect(ctx.destination)
  sweep.start(now)
  sweep.stop(now + 1.2)
}

export const playUpgradeSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  const reverb = createReverb(ctx, 1, 2)
  
  const ascendingNotes = [523.25, 659.25, 783.99, 1046.50]
  
  ascendingNotes.forEach((freq, i) => {
    createRichOscillator(ctx, freq, now + i * 0.08, 0.4, 0.22, reverb)
  })
  
  const shine = ctx.createOscillator()
  const shineGain = ctx.createGain()
  shine.type = 'sine'
  shine.frequency.setValueAtTime(2500, now)
  shine.frequency.exponentialRampToValueAtTime(4000, now + 0.3)
  shineGain.gain.setValueAtTime(0.1, now)
  shineGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3)
  shine.connect(shineGain)
  shineGain.connect(reverb)
  reverb.connect(ctx.destination)
  shine.start(now)
  shine.stop(now + 0.3)
}

export const playPrestigeSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const now = ctx.currentTime
  const reverb = createReverb(ctx, 3, 4)
  
  const prestigeMelody = [
    523.25, 659.25, 783.99, 1046.50, 
    1318.51, 1568.00, 2093.00
  ]
  
  prestigeMelody.forEach((freq, i) => {
    createRichOscillator(ctx, freq, now + i * 0.15, 1.2, 0.3, reverb)
  })
  
  for (let i = 0; i < 30; i++) {
    const particle = ctx.createOscillator()
    const particleGain = ctx.createGain()
    particle.type = 'sine'
    particle.frequency.setValueAtTime(1000 + Math.random() * 3000, now + i * 0.04)
    particleGain.gain.setValueAtTime(0.05, now + i * 0.04)
    particleGain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.04 + 0.5)
    particle.connect(particleGain)
    particleGain.connect(reverb)
    reverb.connect(ctx.destination)
    particle.start(now + i * 0.04)
    particle.stop(now + i * 0.04 + 0.5)
  }
  
  const pad = ctx.createOscillator()
  const padGain = ctx.createGain()
  pad.type = 'sawtooth'
  pad.frequency.setValueAtTime(261.63, now)
  padGain.gain.setValueAtTime(0.2, now)
  padGain.gain.exponentialRampToValueAtTime(0.01, now + 2)
  pad.connect(padGain)
  padGain.connect(reverb)
  reverb.connect(ctx.destination)
  pad.start(now)
  pad.stop(now + 2)
}
