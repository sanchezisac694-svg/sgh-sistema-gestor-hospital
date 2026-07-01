export function Card({ title, subtitle, children, actions, className = '' }) {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || subtitle || actions) && (
        <div className="card-header">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actions && <div className="card-actions">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, helper, tone = 'blue', icon: Icon }) {
  return (
    <Card className={`stat-card stat-${tone}`}>
      <div className="stat-content">
        <div>
          <span>{label}</span>
          <strong>{value}</strong>
          {helper && <small>{helper}</small>}
        </div>
        {Icon && (
          <div className="stat-icon" aria-hidden="true">
            <Icon size={22} />
          </div>
        )}
      </div>
    </Card>
  );
}
