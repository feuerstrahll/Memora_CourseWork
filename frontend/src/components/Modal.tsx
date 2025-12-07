import React, { useEffect, useRef } from 'react'
import './Modal.css'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

// Счетчик открытых модальных окон
let openModalsCount = 0

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const prevOpenRef = useRef(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Управляем счетчиком только при реальном изменении состояния
    if (isOpen && !prevOpenRef.current) {
      openModalsCount++
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else if (!isOpen && prevOpenRef.current) {
      openModalsCount--
      document.removeEventListener('keydown', handleEscape)
      // Сбрасываем overflow только если нет других открытых модальных окон
      if (openModalsCount === 0) {
        document.body.style.overflow = 'unset'
      }
    }

    prevOpenRef.current = isOpen

    return () => {
      // Cleanup при размонтировании
      if (prevOpenRef.current) {
        openModalsCount--
        document.removeEventListener('keydown', handleEscape)
        if (openModalsCount === 0) {
          document.body.style.overflow = 'unset'
        }
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

