import React, { useState, useCallback, useRef } from 'react'


//use for message 
export function useToast() {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  // only build at first time;
  const toast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++counter.current  // unique id
    setToasts(t => [...t, { id, message, type }]) // add new toast, t.append({ id, message, type }) in python
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration) // remove after 3000ms
  }, [])

  return { toasts, toast }
}


//typeColors and typeIcons just a table, not add or remove
const typeColors = {
  info: 'var(--accent)',   //blue
  success: 'var(--success)',  // green
  error: 'var(--danger)',  //red
  warn: 'var(--highlight)' //yellow
}

const typeIcons = {
  info: 'ℹ️',
  success: '✅',
  error: '❌',
  warn: '⚠️'
}


export function ToastContainer({ toasts }) {
  // toasts.map(t => ...)  => for t in toasts: in python
  return (
    <div style={{   //style={{ }}
      position: 'absolute', bottom: 24, left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex', flexDirection: 'column', gap: 8,
      zIndex: 200, pointerEvents: 'none', alignItems: 'center'
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--bg-panel)',
          border: `1px solid ${typeColors[t.type] || typeColors.info}`,  // ||= deafault value
          borderRadius: 'var(--radius)',
          padding: '10px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: 'var(--shadow)',
          animation: 'fadeIn 0.2s ease',
          maxWidth: 400
        }}>
          <span>{typeIcons[t.type]}</span>
          <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{t.message}</span>
        </div>
      ))}
      // Add keyframes for fadeIn animation
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
