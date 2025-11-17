import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface ConfettiProps {
  active: boolean
  intensity?: 'low' | 'medium' | 'high' | 'mega' | 'jackpot'
}

export function Confetti({ active, intensity = 'medium' }: ConfettiProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active || !containerRef.current) return

    const container = containerRef.current
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9']
    const shapes = ['circle', 'square', 'triangle']
    
    const particleCount = 
      intensity === 'low' ? 20 :
      intensity === 'medium' ? 40 :
      intensity === 'high' ? 60 :
      intensity === 'jackpot' ? 150 :
      100

    const particles: HTMLDivElement[] = []

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      const color = colors[Math.floor(Math.random() * colors.length)]
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      const size = Math.random() * 10 + 5
      const startX = Math.random() * 100
      const endX = startX + (Math.random() - 0.5) * 50
      const rotation = Math.random() * 720 - 360
      const duration = Math.random() * 1 + 1.5

      particle.style.position = 'absolute'
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.backgroundColor = color
      particle.style.left = `${startX}%`
      particle.style.top = '0%'
      particle.style.pointerEvents = 'none'
      particle.style.zIndex = '50'
      
      if (shape === 'circle') {
        particle.style.borderRadius = '50%'
      } else if (shape === 'triangle') {
        particle.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'
      }

      particle.animate([
        {
          transform: 'translateY(0) translateX(0) rotate(0deg)',
          opacity: 1
        },
        {
          transform: `translateY(100vh) translateX(${endX - startX}vw) rotate(${rotation}deg)`,
          opacity: 0
        }
      ], {
        duration: duration * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      })

      container.appendChild(particle)
      particles.push(particle)

      setTimeout(() => {
        particle.remove()
      }, duration * 1000)
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [active, intensity])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ overflow: 'hidden' }}
    />
  )
}

interface WinBannerProps {
  show: boolean
  amount: number
  type: 'small' | 'big' | 'mega' | 'jackpot'
}

export function WinBanner({ show, amount, type }: WinBannerProps) {
  if (!show) return null

  const getBannerConfig = () => {
    switch (type) {
      case 'small':
        return {
          text: 'WIN!',
          bgColor: 'from-accent/90 to-accent/70',
          textColor: 'text-accent-foreground',
          scale: 1,
          emoji: '🎰'
        }
      case 'big':
        return {
          text: 'BIG WIN!',
          bgColor: 'from-primary/90 to-primary/70',
          textColor: 'text-primary-foreground',
          scale: 1.2,
          emoji: '💎'
        }
      case 'mega':
        return {
          text: 'MEGA WIN!',
          bgColor: 'from-yellow-500/90 to-orange-500/90',
          textColor: 'text-white',
          scale: 1.4,
          emoji: '👑'
        }
      case 'jackpot':
        return {
          text: 'JACKPOT!!!',
          bgColor: 'from-pink-500/90 via-purple-500/90 to-yellow-500/90',
          textColor: 'text-white',
          scale: 1.6,
          emoji: '💰'
        }
    }
  }

  const config = getBannerConfig()

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: [0, config.scale * 1.1, config.scale],
        opacity: [0, 1, 1, 0]
      }}
      transition={{ 
        duration: 2,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeOut'
      }}
      className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
    >
      <div className={`bg-gradient-to-br ${config.bgColor} backdrop-blur-sm rounded-3xl p-8 md:p-12 border-4 border-white/30 shadow-2xl`}>
        <motion.div
          animate={{ 
            rotate: [0, -5, 5, -5, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 0.5,
            repeat: 3,
            ease: 'easeInOut'
          }}
          className="text-center"
        >
          <div className="text-6xl md:text-8xl mb-4">{config.emoji}</div>
          <div className={`text-4xl md:text-6xl font-bold orbitron ${config.textColor} mb-4`}>
            {config.text}
          </div>
          <div className={`text-5xl md:text-7xl font-black orbitron ${config.textColor} tabular-nums`}>
            +{amount.toLocaleString()}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
