export default function Modal({ title, onClose, children }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28, 43, 69, 0.45)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{
          width: '100%',
          maxWidth: '760px',
          maxHeight: '80vh',
          overflowY: 'auto',
          background: 'var(--paper-raised)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="ghost" onClick={onClose} style={{ fontSize: '1.2rem', padding: '0 0.4em' }}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
