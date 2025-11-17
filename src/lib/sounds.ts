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

export const playSpinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(200, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1)
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.1)
}

export const playReelStopSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(300, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.05)
}

export const playSmallWinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(400, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3)
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.3)
}

export const playBigWinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const notes = [523.25, 659.25, 783.99, 1046.50]
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1)
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime + index * 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.4)
    
    oscillator.start(ctx.currentTime + index * 0.1)
    oscillator.stop(ctx.currentTime + index * 0.1 + 0.4)
  })
}

export const playMegaWinSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.08)
    
    gainNode.gain.setValueAtTime(0.18, ctx.currentTime + index * 0.08)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.5)
    
    oscillator.start(ctx.currentTime + index * 0.08)
    oscillator.stop(ctx.currentTime + index * 0.08 + 0.5)
  })
}

export const playUpgradeSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(600, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.2)
  
  gainNode.gain.setValueAtTime(0.12, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.2)
}

export const playPrestigeSound = () => {
  const ctx = getAudioContext()
  if (!ctx) return
  
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
  
  notes.forEach((freq, index) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12)
    
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime + index * 0.12)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.12 + 0.6)
    
    oscillator.start(ctx.currentTime + index * 0.12)
    oscillator.stop(ctx.currentTime + index * 0.12 + 0.6)
  })
}
