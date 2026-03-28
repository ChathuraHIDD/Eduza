import { useEffect, useMemo, useState } from 'react'
import { jsPDF } from 'jspdf'
import { acknowledgeStressAlert, getStressAdminSummary, getStressAlerts } from '../utils/stressHubApi'

const cardStyle = {
  background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
  border: '1.5px solid #dbe4f2',
  borderRadius: 16,
  padding: '1.25rem',
  boxShadow: '0 12px 24px rgba(15,23,42,0.07)',
}

function AdminStressManagement() {
  const [stressAlerts, setStressAlerts] = useState([])
  const [stressAlertsLoading, setStressAlertsLoading] = useState(true)
  const [stressAlertsError, setStressAlertsError] = useState('')

  const [stressSummary, setStressSummary] = useState(null)
  const [stressSummaryLoading, setStressSummaryLoading] = useState(true)
  const [stressSummaryError, setStressSummaryError] = useState('')
  const [animateBars, setAnimateBars] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [selectedColor, setSelectedColor] = useState('RED')
  const [clickedBar, setClickedBar] = useState('')
  const [submissionSearch, setSubmissionSearch] = useState('')
  const [submissionLevelFilter, setSubmissionLevelFilter] = useState('ALL')
  const [submissionColorFilter, setSubmissionColorFilter] = useState('ALL')

  const colorColumns = [
    { key: 'RED', label: 'Red', fill: 'linear-gradient(180deg, #fb7185 0%, #e11d48 55%, #881337 100%)' },
    { key: 'ORANGE', label: 'Orange', fill: 'linear-gradient(180deg, #fdba74 0%, #f97316 55%, #9a3412 100%)' },
    { key: 'YELLOW', label: 'Yellow', fill: 'linear-gradient(180deg, #fde047 0%, #eab308 55%, #854d0e 100%)' },
    { key: 'GREEN', label: 'Green', fill: 'linear-gradient(180deg, #6ee7b7 0%, #10b981 55%, #065f46 100%)' },
    { key: 'BLUE', label: 'Blue', fill: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 55%, #1e3a8a 100%)' },
  ]

  const fetchOpenStressAlerts = async () => {
    try {
      setStressAlertsLoading(true)
      setStressAlertsError('')
      const data = await getStressAlerts(undefined, 'OPEN')
      setStressAlerts(Array.isArray(data) ? data : [])
    } catch (err) {
      setStressAlertsError('Failed to load stress alerts')
      console.error(err)
    } finally {
      setStressAlertsLoading(false)
    }
  }

  const fetchStressSummary = async () => {
    try {
      setStressSummaryLoading(true)
      setStressSummaryError('')
      const data = await getStressAdminSummary(30, 20)
      setStressSummary(data)
    } catch (err) {
      setStressSummaryError('Failed to load stress summary')
      console.error(err)
    } finally {
      setStressSummaryLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 70)
    fetchOpenStressAlerts()
    fetchStressSummary()
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!stressSummary) return
    setAnimateBars(false)
    const timer = setTimeout(() => setAnimateBars(true), 80)
    return () => clearTimeout(timer)
  }, [stressSummary])

  useEffect(() => {
    if (!clickedBar) return
    const timer = setTimeout(() => setClickedBar(''), 280)
    return () => clearTimeout(timer)
  }, [clickedBar])

  const chartMax = useMemo(() => {
    const counts = colorColumns.map((item) => stressSummary?.colorBreakdown?.[item.key]?.count || 0)
    return Math.max(1, ...counts)
  }, [stressSummary])

  const selectedColorData = useMemo(() => {
    if (!stressSummary) return { count: 0, percentage: 0 }
    return stressSummary.colorBreakdown?.[selectedColor] || { count: 0, percentage: 0 }
  }, [selectedColor, stressSummary])

  const selectedColorSubmissions = useMemo(() => {
    const all = stressSummary?.recentSubmissions || []
    const filtered = all.filter((row) => {
      const primary = Array.isArray(row.selectedColors) && row.selectedColors.length > 0
        ? String(row.selectedColors[0]).toUpperCase()
        : ''
      return primary === selectedColor
    })
    return (filtered.length > 0 ? filtered : all).slice(0, 6)
  }, [selectedColor, stressSummary])

  const filteredRecentSubmissions = useMemo(() => {
    const all = stressSummary?.recentSubmissions || []
    const normalizedSearch = submissionSearch.trim().toLowerCase()

    return all.filter((row) => {
      const name = String(row.studentName || '').toLowerCase()
      const email = String(row.studentEmail || '').toLowerCase()
      const colors = Array.isArray(row.selectedColors)
        ? row.selectedColors.map((c) => String(c).toUpperCase())
        : []

      const matchesSearch =
        normalizedSearch.length === 0 ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch)

      const matchesLevel =
        submissionLevelFilter === 'ALL' ||
        String(row.stressLevel || '').toUpperCase() === submissionLevelFilter

      const matchesColor =
        submissionColorFilter === 'ALL' ||
        colors.includes(submissionColorFilter)

      return matchesSearch && matchesLevel && matchesColor
    })
  }, [stressSummary, submissionSearch, submissionLevelFilter, submissionColorFilter])

  const handleAcknowledgeStressAlert = async (alertId) => {
    try {
      await acknowledgeStressAlert(alertId)
      await fetchOpenStressAlerts()
      alert('Stress alert acknowledged')
    } catch (err) {
      alert('Failed to acknowledge stress alert: ' + err.message)
    }
  }

  const handleDownloadSubmissionPdf = (row) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    const borderMargin = 24
    const contentX = 48
    const contentWidth = pageWidth - contentX * 2
    let cursorY = 132

    const drawPageFrame = () => {
      doc.setDrawColor(194, 65, 12)
      doc.setLineWidth(1.6)
      doc.rect(borderMargin, borderMargin, pageWidth - borderMargin * 2, pageHeight - borderMargin * 2)

      doc.setFillColor(194, 65, 12)
      doc.rect(borderMargin + 8, borderMargin + 8, pageWidth - (borderMargin + 8) * 2, 64, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(24)
      doc.text('EDUZA', borderMargin + 18, borderMargin + 48)

      doc.setFontSize(12)
      doc.text('Student Stress Report', pageWidth - borderMargin - 20, borderMargin + 48, { align: 'right' })

      doc.setTextColor(17, 24, 39)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(`Generated: ${new Date().toLocaleString()}`, contentX, 116)
    }

    const ensureSpace = (neededHeight) => {
      if (cursorY + neededHeight <= pageHeight - 48) return
      doc.addPage()
      drawPageFrame()
      cursorY = 132
    }

    const writeField = (label, value) => {
      const safeText = value || 'N/A'
      const lines = doc.splitTextToSize(String(safeText), contentWidth - 140)
      const rowHeight = Math.max(18, lines.length * 14)
      ensureSpace(rowHeight + 8)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(124, 45, 18)
      doc.text(`${label}:`, contentX, cursorY)

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(31, 41, 55)
      doc.text(lines, contentX + 140, cursorY)

      cursorY += rowHeight + 8
    }

    drawPageFrame()

    const selectedColors = Array.isArray(row.selectedColors)
      ? row.selectedColors.join(', ')
      : 'N/A'

    writeField('Student Name', row.studentName || 'Unknown Student')
    writeField('Student Email', row.studentEmail || 'No email')
    writeField('Stress Level', String(row.stressLevel || 'N/A').toUpperCase())
    writeField('Stress Score', row.stressScore != null ? String(row.stressScore) : 'N/A')
    writeField('Selected Colors', selectedColors || 'N/A')
    writeField('Submitted At', row.submittedAt ? new Date(row.submittedAt).toLocaleString() : 'N/A')

    if (row.notes) {
      writeField('Notes', row.notes)
    }

    const slug = String(row.studentName || 'student')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    doc.save(`eduza-stress-report-${slug || 'student'}.pdf`)
  }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(130deg, #7f1d1d 0%, #b91c1c 48%, #ef4444 100%)',
          borderRadius: 20,
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 22px 40px rgba(127,29,29,0.3)',
          position: 'relative',
          overflow: 'hidden',
          transform: animateIn ? 'translateY(0)' : 'translateY(8px)',
          opacity: animateIn ? 1 : 0.72,
          transition: 'all 420ms ease',
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: -70,
            top: -70,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(254,242,242,0.25) 0%, rgba(254,242,242,0.02) 72%)',
          }}
        />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Stress Management Monitoring
        </div>
        <h1 style={{ margin: 0, color: '#fff', fontSize: 28, fontWeight: 800 }}>
          Student Stress Insights
        </h1>
        <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
          Track submissions, review alert status, and monitor stress level distribution.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#1a1a2e', fontSize: 18 }}>
          🚨 Student High-Stress Alerts ({stressAlerts.length})
        </h3>

        {stressAlertsLoading && <div style={{ color: '#9ca3af' }}>Loading stress alerts...</div>}
        {stressAlertsError && <div style={{ color: '#ef4444' }}>{stressAlertsError}</div>}

        {!stressAlertsLoading && stressAlerts.length === 0 && (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '1.5rem' }}>
            No active high-stress alerts right now.
          </div>
        )}

        {!stressAlertsLoading && stressAlerts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {stressAlerts.map((alert) => (
              <div
                key={alert._id}
                style={{
                  background: 'linear-gradient(140deg, #fff7f7 0%, #ffecec 55%, #ffe4e6 100%)',
                  border: '1.5px solid #fda4af',
                  borderRadius: 14,
                  padding: '1rem',
                  boxShadow: '0 12px 26px rgba(190,24,93,0.16)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -28,
                    top: -24,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(244,63,94,0.22) 0%, rgba(244,63,94,0.04) 70%)',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <div style={{ color: '#9f1239', fontSize: 14, fontWeight: 900, letterSpacing: '0.01em' }}>
                    {alert.title || 'High Stress Detected'}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 16, background: '#fecdd3', color: '#881337' }}>
                    {alert.severity || 'HIGH'}
                  </span>
                </div>

                <div
                  style={{
                    marginBottom: '0.55rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#fff1f2',
                    border: '1px solid #fda4af',
                    color: '#9f1239',
                    borderRadius: 999,
                    padding: '0.25rem 0.55rem',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  <span aria-hidden='true'>⚠️</span>
                  Priority Alert
                </div>

                <div style={{ color: '#881337', fontSize: 13, lineHeight: 1.55 }}>{alert.message}</div>
                <div style={{ color: '#9ca3af', fontSize: 11, marginTop: '0.6rem' }}>
                  {new Date(alert.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={() => handleAcknowledgeStressAlert(alert._id)}
                  style={{
                    marginTop: '0.8rem',
                    background: 'linear-gradient(140deg, #e11d48, #be123c)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '7px 13px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: 11,
                    boxShadow: '0 10px 16px rgba(190,24,93,0.26)',
                  }}
                >
                  Resolve Alert
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#1a1a2e', fontSize: 18 }}>
          📊 Cinematic Stress Spectrum (Last 30 Days)
        </h3>

        {stressSummaryLoading && <div style={{ color: '#9ca3af' }}>Loading stress chart...</div>}
        {stressSummaryError && <div style={{ color: '#ef4444' }}>{stressSummaryError}</div>}

        {!stressSummaryLoading && stressSummary && (
          <>
            <div
              style={{
                background: 'linear-gradient(140deg, #0b1220 0%, #16203a 48%, #1e293b 100%)',
                border: '1px solid rgba(148,163,184,0.3)',
                borderRadius: 16,
                padding: '1rem',
                marginBottom: '1.2rem',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: -30,
                  top: -30,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0.04) 70%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: -70,
                  bottom: -80,
                  width: 260,
                  height: 260,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(244,114,182,0.24) 0%, rgba(244,114,182,0.04) 72%)',
                }}
              />

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.25fr 0.9fr',
                  gap: '1rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div>
                  <div style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                    Click a column to inspect student details
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: 8 }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'flex-end',
                        height: 320,
                        color: '#93c5fd',
                        fontWeight: 700,
                        fontSize: 11,
                        paddingRight: 6,
                      }}
                    >
                      <span>{chartMax}</span>
                      <span>{Math.ceil(chartMax * 0.75)}</span>
                      <span>{Math.ceil(chartMax * 0.5)}</span>
                      <span>{Math.ceil(chartMax * 0.25)}</span>
                      <span>0</span>
                    </div>

                    <div
                      style={{
                        borderLeft: '2px solid #60a5fa',
                        borderBottom: '2px solid #60a5fa',
                        borderRadius: '0 0 0 8px',
                        height: 320,
                        padding: '0.4rem 0.6rem 0',
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'space-around',
                        gap: '0.5rem',
                      }}
                    >
                      {colorColumns.map((item) => {
                        const row = stressSummary.colorBreakdown?.[item.key] || { count: 0, percentage: 0 }
                        const safeCount = Math.max(0, row.count)
                        const targetHeight = Math.max(10, Math.round((safeCount / chartMax) * 245))
                        const isSelected = selectedColor === item.key
                        const isClicked = clickedBar === item.key

                        return (
                          <div key={item.key} style={{ width: '19%', minWidth: 54, textAlign: 'center' }}>
                            <div style={{ fontSize: 10, color: '#bfdbfe', fontWeight: 700, marginBottom: 5 }}>
                              {safeCount}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedColor(item.key)
                                setClickedBar(item.key)
                              }}
                              style={{
                                width: '100%',
                                border: isSelected ? '2px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.25)',
                                height: animateBars ? targetHeight : 8,
                                background: item.fill,
                                borderRadius: '10px 10px 0 0',
                                boxShadow: isSelected
                                  ? '0 0 0 2px rgba(56,189,248,0.35), 0 16px 24px rgba(15,23,42,0.35)'
                                  : '0 8px 16px rgba(15,23,42,0.25)',
                                transform: isClicked
                                  ? 'translateY(-8px) scale(1.07)'
                                  : isSelected
                                  ? 'translateY(-4px) scale(1.03)'
                                  : 'translateY(0) scale(1)',
                                transition: 'height 700ms cubic-bezier(.22,.8,.26,1), transform 230ms ease, box-shadow 230ms ease, border-color 230ms ease',
                                cursor: 'pointer',
                              }}
                            />
                            <div style={{ marginTop: 7, fontSize: 11, color: isSelected ? '#e2e8f0' : '#94a3b8', fontWeight: 700 }}>
                              {item.label}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    borderRadius: 14,
                    background: 'linear-gradient(145deg, rgba(30,41,59,0.96) 0%, rgba(51,65,85,0.88) 100%)',
                    border: '1px solid rgba(148,163,184,0.32)',
                    padding: '0.9rem',
                  }}
                >
                  <div style={{ color: '#f8fafc', fontSize: 15, fontWeight: 800 }}>
                    {selectedColor} Focus Panel
                  </div>
                  <div style={{ marginTop: 6, color: '#cbd5e1', fontSize: 12 }}>
                    {selectedColorData.count} submissions ({selectedColorData.percentage}%)
                  </div>

                  <div style={{ marginTop: 10, display: 'grid', gap: '0.55rem' }}>
                    {selectedColorSubmissions.length === 0 && (
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>No entries available for this color in the selected period.</div>
                    )}
                    {selectedColorSubmissions.map((row) => (
                      <div
                        key={row.id}
                        style={{
                          background: 'rgba(15,23,42,0.5)',
                          border: '1px solid rgba(148,163,184,0.25)',
                          borderRadius: 10,
                          padding: '0.58rem 0.7rem',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <div style={{ color: '#f8fafc', fontSize: 12, fontWeight: 700 }}>{row.studentName}</div>
                          <div style={{ color: '#93c5fd', fontSize: 11, fontWeight: 700 }}>Score {row.stressScore}</div>
                        </div>
                        <div style={{ marginTop: 4, color: '#cbd5e1', fontSize: 11 }}>
                          {(row.selectedColors || []).join(', ')} • {new Date(row.submittedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
                <span
                  style={{
                    background: 'rgba(15,23,42,0.48)',
                    border: '1px solid rgba(148,163,184,0.45)',
                    borderRadius: 10,
                    padding: '0.3rem 0.7rem',
                    color: '#dbeafe',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Interactive spectrum: tap bars for drill-down insights
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#f8faff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Total Submissions</div>
                <div style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 800 }}>{stressSummary.totalSubmissions || 0}</div>
              </div>
              <div style={{ background: '#f8faff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Average Stress Score</div>
                <div style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 800 }}>{stressSummary.averageStressScore || 0}</div>
              </div>
              <div style={{ background: '#f8faff', border: '1px solid #e8ecf4', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#9ca3af', fontSize: 11 }}>Period</div>
                <div style={{ color: '#1a1a2e', fontSize: 20, fontWeight: 800 }}>{stressSummary.periodDays || 30}d</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#fff7f7', border: '1px solid #fecaca', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#991b1b', fontSize: 11 }}>High Level</div>
                <div style={{ color: '#7f1d1d', fontSize: 20, fontWeight: 800 }}>{stressSummary.levelBreakdown?.HIGH?.percentage || 0}%</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#92400e', fontSize: 11 }}>Medium Level</div>
                <div style={{ color: '#78350f', fontSize: 20, fontWeight: 800 }}>{stressSummary.levelBreakdown?.MEDIUM?.percentage || 0}%</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '0.75rem' }}>
                <div style={{ color: '#166534', fontSize: 11 }}>Low Level</div>
                <div style={{ color: '#14532d', fontSize: 20, fontWeight: 800 }}>{stressSummary.levelBreakdown?.LOW?.percentage || 0}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: '#1f2937', fontSize: 15 }}>Recent Student Stress Submissions</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  value={submissionSearch}
                  onChange={(event) => setSubmissionSearch(event.target.value)}
                  placeholder="Search student"
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 9,
                    padding: '0.45rem 0.6rem',
                    fontSize: 12,
                    minWidth: 150,
                    background: '#ffffff',
                    color: '#1f2937',
                  }}
                />
                <select
                  value={submissionLevelFilter}
                  onChange={(event) => setSubmissionLevelFilter(event.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 9,
                    padding: '0.45rem 0.6rem',
                    fontSize: 12,
                    background: '#ffffff',
                    color: '#1f2937',
                  }}
                >
                  <option value="ALL">All levels</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
                <select
                  value={submissionColorFilter}
                  onChange={(event) => setSubmissionColorFilter(event.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: 9,
                    padding: '0.45rem 0.6rem',
                    fontSize: 12,
                    background: '#ffffff',
                    color: '#1f2937',
                  }}
                >
                  <option value="ALL">All colors</option>
                  <option value="RED">Red</option>
                  <option value="ORANGE">Orange</option>
                  <option value="YELLOW">Yellow</option>
                  <option value="GREEN">Green</option>
                  <option value="BLUE">Blue</option>
                </select>
              </div>
            </div>

            {(!stressSummary.recentSubmissions || stressSummary.recentSubmissions.length === 0) && (
              <div style={{ color: '#9ca3af', fontSize: 13 }}>No submissions in this period.</div>
            )}
            {stressSummary.recentSubmissions && stressSummary.recentSubmissions.length > 0 && filteredRecentSubmissions.length === 0 && (
              <div style={{ color: '#9ca3af', fontSize: 13 }}>No submissions match the selected filters.</div>
            )}
            {stressSummary.recentSubmissions && stressSummary.recentSubmissions.length > 0 && filteredRecentSubmissions.length > 0 && (
              <div style={{ display: 'grid', gap: '0.65rem' }}>
                {filteredRecentSubmissions.map((row) => (
                  <div
                    key={row.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '0.7rem 0.85rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div>
                        <div style={{ color: '#111827', fontSize: 13, fontWeight: 700 }}>{row.studentName}</div>
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{row.studentEmail || 'No email'}</div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'grid', justifyItems: 'end', gap: 4 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: row.stressLevel === 'HIGH' ? '#dc2626' : row.stressLevel === 'MEDIUM' ? '#b45309' : '#166534' }}>
                          {row.stressLevel}
                        </div>
                        <div style={{ fontSize: 12, color: '#475569' }}>Score: {row.stressScore}</div>
                        <button
                          onClick={() => handleDownloadSubmissionPdf(row)}
                          style={{
                            marginTop: 2,
                            border: 'none',
                            borderRadius: 8,
                            background: 'linear-gradient(140deg, #f97316, #c2410c)',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 11,
                            padding: '0.35rem 0.6rem',
                            cursor: 'pointer',
                            boxShadow: '0 8px 14px rgba(194,65,12,0.26)',
                          }}
                        >
                          Download PDF
                        </button>
                      </div>
                    </div>
                    <div style={{ marginTop: 6, color: '#6b7280', fontSize: 11 }}>
                      Colors: {(row.selectedColors || []).join(', ') || 'N/A'} • {new Date(row.submittedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default AdminStressManagement
