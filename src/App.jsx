import React, { useRef, useEffect, useState, useCallback } from 'react'
import { SceneManager } from './utils/SceneManager.js'
import { loadIFCFile } from './utils/ifcLoader.js'
import Toolbar from './components/Toolbar.jsx'
import ObjectPanel from './components/ObjectPanel.jsx'
import LoadingOverlay from './components/LoadingOverlay.jsx'
import DropZone from './components/DropZone.jsx'
import { useToast, ToastContainer } from './components/Toast.jsx'


export default function App() {
  const canvasRef = useRef(null)
  const sceneRef = useRef(null)
  const ifcInputRef = useRef(null)
  const glbInputRef = useRef(null)
  const projectInputRef = useRef(null)

  const [objects, setObjects] = useState(new Map())  //new Map() =  dict()  for append and delete
  const [selectedId, setSelectedId] = useState(null)
  const [transformMode, setTransformMode] = useState('translate')
  const [loading, setLoading] = useState(null) // { message, progress }
  const { toasts, toast } = useToast()

  // Sync objects state from scene
  const syncObjects = useCallback(() => {
    if (!sceneRef.current) return
    setObjects(new Map(sceneRef.current.objects))
  }, [])

  // Init scene
  useEffect(() => {
    if (!canvasRef.current || sceneRef.current) return
    const sm = new SceneManager(canvasRef.current)
    sm.onSelect = (id) => setSelectedId(id)
    sm.onDeselect = () => setSelectedId(null)
    sceneRef.current = sm
    return () => { sm.destroy(); sceneRef.current = null }
  }, [])

  // Ctrl+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // === IFC ===
  const handleOpenIFC = () => ifcInputRef.current?.click()

  const handleIFCFile = async (file) => {
    setLoading({ message: `載入 ${file.name}…`, progress: 0 })
    try {
      const model = await loadIFCFile(file, (p) => {
        setLoading(prev => prev ? { ...prev, progress: p } : null)
      })
      sceneRef.current.addIFCModel(model, file.name)
      sceneRef.current.fitToScene()
      syncObjects()
      toast(`✅ ${file.name} 載入完成`, 'success')
    } catch (err) {
      console.error(err)
      toast(`載入 IFC 失敗：${err.message}`, 'error')
    } finally {
      setLoading(null)
    }
  }

  // === GLB ===
  const handleOpenGLB = () => glbInputRef.current?.click()

  const handleGLBFile = async (file) => {
    setLoading({ message: `載入 ${file.name}…`, progress: null })
    try {
      await sceneRef.current.loadGLB(file)
      sceneRef.current.fitToScene()
      syncObjects()
      toast(`✅ ${file.name} 加入場景`, 'success')
    } catch (err) {
      console.error(err)
      toast(`載入 GLB 失敗：${err.message}`, 'error')
    } finally {
      setLoading(null)
    }
  }

  // === Transform mode ===
  const handleTransformMode = (mode) => {
    setTransformMode(mode)
    sceneRef.current?.setTransformMode(mode)
  }

  // === Select from panel ===
  const handlePanelSelect = (id) => {
    sceneRef.current?.selectById(id)
    setSelectedId(id)
  }

  // === Delete ===
  const handleDelete = () => {
    if (!selectedId || !sceneRef.current) return
    const obj = sceneRef.current.objects.get(selectedId)
    if (obj?.type === 'ifc') {
      toast('IFC 模型暫不支援刪除（需重新載入）', 'warn'); return
    }
    sceneRef.current.removeObject(selectedId)
    setSelectedId(null)
    syncObjects()
    toast('物件已刪除', 'info')
  }

  // === Save ===
  const handleSave = () => {
    if (!sceneRef.current) return
    const data = sceneRef.current.exportProjectFull()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bim-project-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('專案已儲存', 'success')
  }

  // === Load project ===
  const handleLoadProject = () => projectInputRef.current?.click()

  const handleProjectFile = async (file) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      sceneRef.current?.applyProjectTransforms(data)
      syncObjects()
      toast('專案還原完成', 'success')
    } catch (err) {
      toast(`專案開啟失敗：${err.message}`, 'error')
    }
  }

  // === Drag & drop ===
  const handleFileDrop = (files) => {
    for (const file of files) {
      const ext = file.name.split('.').pop().toLowerCase()
      if (ext === 'ifc') handleIFCFile(file)
      else if (ext === 'glb' || ext === 'gltf') handleGLBFile(file)
      else if (ext === 'json') handleProjectFile(file)
      else toast(`不支援的格式：.${ext}`, 'warn')
    }
  }

  // === Fit view ===
  const handleFitView = () => sceneRef.current?.fitToScene()

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      />

      {/* Toolbar */}
      <Toolbar
        transformMode={transformMode}
        onTransformMode={handleTransformMode}
        onOpenIFC={handleOpenIFC}
        onOpenGLB={handleOpenGLB}
        onSave={handleSave}
        onLoad={handleLoadProject}
        onFitView={handleFitView}
        onDeleteSelected={handleDelete}
        hasSelection={!!selectedId}
      />

      {/* Right panel */}
      <ObjectPanel
        objects={objects}
        selectedId={selectedId}
        onSelect={handlePanelSelect}
      />

      {/* Drop zone */}
      <DropZone onFileDrop={handleFileDrop} />

      {/* Loading */}
      {loading && <LoadingOverlay message={loading.message} progress={loading.progress} />}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />

      {/* Status bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 220,
        background: 'var(--bg-panel)',
        borderTop: '1px solid var(--border)',
        padding: '5px 16px',
        display: 'flex', alignItems: 'center', gap: 16,
        fontSize: 11, color: 'var(--text-muted)',
        zIndex: 5
      }}>
        <span style={{ color: 'var(--text-secondary)' }}>
          {selectedId
            ? `✦ 已選取：${objects.get(selectedId)?.name ?? selectedId}`
            : '點擊場景中的物件以選取'}
        </span>
        <span>|</span>
        <span>物件數：{objects.size}</span>
        <span>|</span>
        <span style={{ color: 'var(--accent)' }}>
          模式：{transformMode === 'translate' ? '位移' : transformMode === 'rotate' ? '旋轉' : '縮放'}
        </span>
      </div>

      {/* Hidden file inputs */}
      <input ref={ifcInputRef} type="file" accept=".ifc" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) handleIFCFile(e.target.files[0]); e.target.value = '' }} />
      <input ref={glbInputRef} type="file" accept=".glb,.gltf" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) handleGLBFile(e.target.files[0]); e.target.value = '' }} />
      <input ref={projectInputRef} type="file" accept=".json" style={{ display: 'none' }}
        onChange={e => { if (e.target.files[0]) handleProjectFile(e.target.files[0]); e.target.value = '' }} />
    </div>
  )
}
