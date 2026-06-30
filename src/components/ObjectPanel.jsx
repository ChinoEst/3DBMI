import React from 'react'

const s = {
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 220,
    height: '100%',
    background: 'var(--bg-panel)',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 5,
    overflow: 'hidden'
  },
  header: {
    padding: '14px 16px 10px',
    borderBottom: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '7px 16px',
    cursor: 'pointer',
    transition: 'background 0.1s',
    borderLeft: '3px solid transparent'
  },
  itemActive: {
    background: 'var(--accent-dim)',
    borderLeftColor: 'var(--accent)'
  },
  icon: { fontSize: 14, flexShrink: 0 },
  name: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: 'var(--text-primary)',
    fontSize: 12
  },
  badge: {
    fontSize: 10,
    padding: '2px 5px',
    borderRadius: 3,
    background: 'var(--bg-surface)',
    color: 'var(--text-muted)',
    flexShrink: 0
  },
  empty: {
    padding: '24px 16px',
    color: 'var(--text-muted)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 1.6
  },
  section: {
    padding: '14px 16px 4px',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)'
  },
  infoBox: {
    padding: '12px 16px',
    borderTop: '1px solid var(--border)',
    fontSize: 11,
    color: 'var(--text-secondary)',
    lineHeight: 1.8
  },
  keyHint: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0'
  },
  key: {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 3,
    padding: '1px 5px',
    fontSize: 10,
    color: 'var(--text-secondary)',
    fontFamily: 'monospace'
  }
}


export default function ObjectPanel({ objects, selectedId, onSelect, onToggleVisible }) {
  //map to dict, filter by type, render list
  const ifcObjs = [...objects.entries()].filter(([, o]) => o.type === 'ifc')
  const glbObjs = [...objects.entries()].filter(([, o]) => o.type === 'glb')

  
  const renderItem = ([id, obj]) => {
    const isActive = id === selectedId
    const icon = obj.type === 'ifc' ? '🏗' : '🧊'
    const isVisible = obj.mesh.visible !== false
    return (
      <div
        key={id}
        style={{ ...s.item, ...(isActive ? s.itemActive : {}) }}
        onClick={() => onSelect(id)}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-panel-hover)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={s.icon}>{icon}</span>
        <span style={s.name} title={obj.name}>{obj.name}</span>
        <span style={s.badge}>{obj.type.toUpperCase()}</span>
        <span
          style={{ ...s.icon, cursor: 'pointer', opacity: isVisible ? 1 : 0.4 }}
          onClick={(e) => { e.stopPropagation(); onToggleVisible(id) }}
          title={isVisible ? '隱藏' : '顯示'}
        >
          {isVisible ? '👁' : '🚫'}
        </span>
      </div>
    )
  }

  return (
    <div style={s.panel}>
      <div style={s.header}>📋 場景物件</div>
      <div style={s.list}>
        {objects.size === 0 && (
          <div style={s.empty}>
            尚未載入任何模型<br />
            <span style={{ color: 'var(--accent)' }}>開啟 IFC</span> 或 <span style={{ color: 'var(--accent)' }}>加入 GLB</span> 開始
          </div>
        )}
        {ifcObjs.length > 0 && (
          <>
            <div style={s.section}>IFC 模型</div>
            {ifcObjs.map(renderItem)}
          </>
        )}
        {glbObjs.length > 0 && (
          <>
            <div style={s.section}>GLB 物件</div>
            {glbObjs.map(renderItem)}
          </>
        )}
      </div>
      <div style={s.infoBox}>
        <div style={{ marginBottom: 8, fontWeight: 600, color: 'var(--text-primary)' }}>快捷鍵</div>
        {[
          ['Z', '位移'],
          ['X', '旋轉'],
          ['R', '縮放'],
          ['W', '前進'],
          ['A', '左移'],
          ['S', '後退'],
          ['D', '右移'],
          ['Q', '上升'],
          ['E', '下降'],
          ['Esc', '取消選取'],
          ['Del', '刪除'],
          ['Ctrl+S', '儲存'],
        ].map(([k, v]) => (
          <div key={k} style={s.keyHint}>
            <span>{v}</span>
            <span style={s.key}>{k}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
