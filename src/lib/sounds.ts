const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

export const playSpinSound = () => {
  if (!audioContext) return
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
  
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

export const playReelStopSound = () => {
  if (!audioContext) return
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
  
  gainNode.gain.setValueAtTime(0.08, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.05)
}

export const playSmallWinSound = () => {
  if (!audioContext) return
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3)
  
  gainNode.gain.setValueAtTime(0.15, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.3)
}

export const playBigWinSound = () => {
  if (!audioContext) return
  
  const notes = [523.25, 659.25, 783.99, 1046.50]
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.1)
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.1)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.1 + 0.4)
    
    oscillator.start(audioContext.currentTime + index * 0.1)
    oscillator.stop(audioContext.currentTime + index * 0.1 + 0.4)
  })
}

export const playMegaWinSound = () => {
  if (!audioContext) return
  
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.08)
    
    gainNode.gain.setValueAtTime(0.18, audioContext.currentTime + index * 0.08)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.08 + 0.5)
    
    oscillator.start(audioContext.currentTime + index * 0.08)
    oscillator.stop(audioContext.currentTime + index * 0.08 + 0.5)
  })
}

export const playUpgradeSound = () => {
  if (!audioContext) return
  
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)
  
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.2)
  
  gainNode.gain.setValueAtTime(0.12, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
  
  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.2)
}

export const playPrestigeSound = () => {
  if (!audioContext) return
  
  const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.12)
    
    gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + index * 0.12)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.12 + 0.6)
    
    oscillator.start(audioContext.currentTime + index * 0.12)
    oscillator.stop(audioContext.currentTime + index * 0.12 + 0.6)
  })
}
