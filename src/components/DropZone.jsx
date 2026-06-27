import React, { useState, useEffect } from 'react'

export default function DropZone({ onFileDrop }) {
  const [dragging, setDragging] = useState(false)
  const [dragCount, setDragCount] = useState(0)

  useEffect(() => {
    const onDragEnter = (e) => {
      e.preventDefault()
      setDragCount(c => c + 1)
      setDragging(true)
    }
    const onDragLeave = (e) => {
      e.preventDefault()
      setDragCount(c => {
        const next = c - 1
        if (next <= 0) setDragging(false)
        return next
      })
    }
    const onDragOver = (e) => { e.preventDefault() }
    const onDrop = (e) => {
      e.preventDefault()
      setDragging(false)
      setDragCount(0)
      const files = [...e.dataTransfer.files]
      if (files.length > 0) onFileDrop(files)
    }

    window.addEventListener('dragenter', onDragEnter)
    window.addEventListener('dragleave', onDragLeave)
    window.addEventListener('dragover', onDragOver)
    window.addEventListener('drop', onDrop)
    return () => {
      window.removeEventListener('dragenter', onDragEnter)
      window.removeEventListener('dragleave', onDragLeave)
      window.removeEventListener('dragover', onDragOver)
      window.removeEventListener('drop', onDrop)
    }
  }, [onFileDrop])

  if (!dragging) return null

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      background: 'rgba(79,142,247,0.08)',
      border: '3px dashed var(--accent)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 12, pointerEvents: 'none',
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{ fontSize: 48 }}>📂</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>拖放檔案至此</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
        支援 .ifc、.glb、.gltf、.json（專案檔）
      </div>
    </div>
  )
}
