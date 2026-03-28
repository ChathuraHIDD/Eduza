import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import { getStudentStressData } from '../utils/stressHubApi'

function GuardianStressMonitoring() {
  const [studentEmail, setStudentEmail] = useState('')
  const [studentData, setStudentData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}')
    } catch {
      return {}
    }
  }, [])

  const isAuthorized = user?.role === 'coordinator' || user?.role === 'guardian'

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!studentEmail.trim()) {
      setError('Please enter a student email address')
      return
    }

    setLoading(true)
    setError('')
    setStudentData(null)
    setSearched(true)

    try {
      const data = await getStudentStressData(studentEmail)
      setStudentData(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch student stress data')
      setStudentData(null)
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = () => {
    if (!studentData) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(249, 115, 22)
    doc.text('Student Stress Level Report', pageWidth / 2, yPosition, { align: 'center' })

    yPosition += 15
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Student Name: ${studentData.studentName}`, 20, yPosition)
    yPosition += 8
    doc.text(`Email: ${studentData.email}`, 20, yPosition)
    yPosition += 8
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 20, yPosition)

    // Stress Summary Section
    yPosition += 15
    doc.setFontSize(14)
    doc.setTextColor(249, 115, 22)
    doc.text('Current Stress Summary', 20, yPosition)

    yPosition += 10
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)

    const stressLevels = {
      RED: { label: 'High Stress (Critical)', color: [220, 38, 38] },
      ORANGE: { label: 'Elevated Stress', color: [249, 115, 22] },
      YELLOW: { label: 'Mild Stress', color: [234, 179, 8] },
      GREEN: { label: 'Balanced/Growth', color: [34, 197, 94] },
      BLUE: { label: 'Calm State', color: [59, 130, 246] },
    }

    // Add stress level distribution
    if (studentData.stressDistribution) {
      Object.entries(studentData.stressDistribution).forEach(([level, count]) => {
        const info = stressLevels[level]
        doc.text(`${info.label}: ${count} times`, 25, yPosition)
        yPosition += 6
      })
    }

    // Calm Streak Section
    yPosition += 10
    doc.setFontSize(12)
    doc.setTextColor(59, 130, 246)
    doc.text(`📊 Calm Streak: ${studentData.calmStreak || 0} days`, 20, yPosition)

    // Recent Activity Section
    yPosition += 15
    doc.setFontSize(14)
    doc.setTextColor(249, 115, 22)
    doc.text('Recent Stress Logs (Last 7 Days)', 20, yPosition)

    yPosition += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    if (studentData.recentLogs && studentData.recentLogs.length > 0) {
      studentData.recentLogs.forEach((log, index) => {
        const date = new Date(log.createdAt).toLocaleDateString()
        const level = log.stressLevel || 'UNKNOWN'
        doc.text(`${index + 1}. ${date} - ${level}`, 25, yPosition)
        yPosition += 6

        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
      })
    } else {
      doc.text('No recent stress logs found', 25, yPosition)
    }

    // Recommendations Section
    yPosition += 10
    if (yPosition > pageHeight - 30) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(249, 115, 22)
    doc.text('Recommendations', 20, yPosition)

    yPosition += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)

    const recommendations = generateRecommendations(studentData)
    recommendations.forEach((rec) => {
      const wrapped = doc.splitTextToSize(rec, pageWidth - 40)
      wrapped.forEach((line) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = 20
        }
        doc.text(line, 25, yPosition)
        yPosition += 6
      })
    })

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text(`Guardian/Coordinator Stress Monitoring Report - Eduza`, pageWidth / 2, pageHeight - 10, {
      align: 'center',
    })

    doc.save(`${studentData.email}_stress_report_${Date.now()}.pdf`)
  }

  const generateRecommendations = (data) => {
    const recommendations = []

    if (data.stressDistribution?.RED > 2) {
      recommendations.push('⚠️ Student shows frequent high stress levels. Consider scheduling a support meeting.')
    }

    if (data.stressDistribution?.ORANGE > 3) {
      recommendations.push('⚠️ Elevated stress is common. Encourage use of calming activities and stress management techniques.')
    }

    if (data.calmStreak < 3) {
      recommendations.push('💡 Low calm streak. Student may benefit from guided meditation or wellness programs.')
    }

    if (data.calmStreak > 7) {
      recommendations.push('✅ Strong calm streak! Continue current wellness routine.')
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Student stress levels appear manageable. Continue monitoring regularly.')
    }

    return recommendations
  }

  if (!isAuthorized) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 32, color: 'red', marginBottom: '1rem' }}>⛔</div>
        <h2 style={{ color: '#f5f5f5' }}>Access Denied</h2>
        <p style={{ color: '#888' }}>Only coordinators and guardians can access student stress data.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #1a1008 100%)',
          border: '1px solid #2a2010',
          borderRadius: 18,
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600, marginBottom: 8 }}>
          Guardian & Coordinator Portal
        </div>
        <h1 style={{ margin: 0, color: '#f5f5f5', fontSize: 28, fontWeight: 800 }}>
          Student Stress Monitoring 📊
        </h1>
        <p style={{ margin: '8px 0 0', color: '#777', fontSize: 14 }}>
          Search for students by email and view their real-time stress levels and history.
        </p>
      </div>

      {/* Search Form */}
      <div
        style={{
          background: '#1a1a1a',
          border: '1px solid #2a2010',
          borderRadius: 14,
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <form onSubmit={handleSearch}>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="Enter student email address..."
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                background: '#161616',
                border: '1px solid #2a2010',
                borderRadius: 8,
                color: '#f5f5f5',
                fontSize: 14,
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f97316',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {error && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>❌ {error}</p>}
        </form>
      </div>

      {/* Results Section */}
      {searched && loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#1a1a1a',
            borderRadius: 14,
            color: '#888',
          }}
        >
          Loading student data...
        </div>
      )}

      {searched && !loading && studentData && (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {/* Student Info Card */}
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2010',
              borderRadius: 14,
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ margin: '0 0 0.5rem', color: '#f5f5f5' }}>👤 {studentData.studentName}</h2>
                <p style={{ margin: 0, color: '#888', fontSize: 13 }}>📧 {studentData.email}</p>
              </div>
              <button
                onClick={generatePDF}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                📥 Download PDF
              </button>
            </div>
          </div>

          {/* Stress Distribution */}
          <div
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2010',
              borderRadius: 14,
              padding: '1.5rem',
            }}
          >
            <h3 style={{ marginTop: 0, color: '#f5f5f5', marginBottom: '1.25rem' }}>📊 Stress Level Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {studentData.stressDistribution &&
                Object.entries(studentData.stressDistribution).map(([level, count]) => {
                  const stressInfo = {
                    RED: { label: 'High Stress', color: '#dc2626', bg: '#3d1919' },
                    ORANGE: { label: 'Elevated', color: '#f97316', bg: '#3d2415' },
                    YELLOW: { label: 'Mild Stress', color: '#eab308', bg: '#3d3419' },
                    GREEN: { label: 'Balanced', color: '#22c55e', bg: '#1a3a1a' },
                    BLUE: { label: 'Calm', color: '#3b82f6', bg: '#1a2540' },
                  }
                  const info = stressInfo[level]
                  const total = Object.values(studentData.stressDistribution).reduce((a, b) => a + b, 0)
                  const percentage = total > 0 ? Math.round((count / total) * 100) : 0

                  return (
                    <div
                      key={level}
                      style={{
                        background: info.bg,
                        border: `2px solid ${info.color}`,
                        borderRadius: 10,
                        padding: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ color: info.color, fontSize: 20, fontWeight: 800, marginBottom: '0.5rem' }}>
                        {count}
                      </div>
                      <div style={{ color: '#bbb', fontSize: 12, marginBottom: '0.5rem' }}>{info.label}</div>
                      <div style={{ color: info.color, fontSize: 12, fontWeight: 600 }}>{percentage}%</div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Calm Streak */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1a2540 0%, #0f3460 100%)',
              border: '2px solid #3b82f6',
              borderRadius: 14,
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, color: '#888', marginBottom: '0.5rem' }}>CALM STREAK</div>
            <div style={{ fontSize: 48, fontWeight: 800, color: '#3b82f6', marginBottom: '0.5rem' }}>
              {studentData.calmStreak || 0}
            </div>
            <div style={{ color: '#bbb', fontSize: 14 }}>
              {studentData.calmStreak > 0
                ? `${studentData.calmStreak} day${studentData.calmStreak > 1 ? 's' : ''} of consistent calm/balanced states`
                : 'No calm streak yet. Encourage wellness practices!'}
            </div>
          </div>

          {/* Recent Logs */}
          {studentData.recentLogs && studentData.recentLogs.length > 0 && (
            <div
              style={{
                background: '#1a1a1a',
                border: '1px solid #2a2010',
                borderRadius: 14,
                padding: '1.5rem',
              }}
            >
              <h3 style={{ marginTop: 0, color: '#f5f5f5', marginBottom: '1rem' }}>📋 Recent Stress Logs (Last 7 Days)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {studentData.recentLogs.map((log, index) => {
                  const date = new Date(log.createdAt).toLocaleDateString()
                  const level = log.stressLevel || 'UNKNOWN'
                  const stressColors = {
                    RED: '#dc2626',
                    ORANGE: '#f97316',
                    YELLOW: '#eab308',
                    GREEN: '#22c55e',
                    BLUE: '#3b82f6',
                  }
                  const color = stressColors[level] || '#888'

                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        background: '#161616',
                        border: `1px solid ${color}22`,
                        borderRadius: 8,
                      }}
                    >
                      <span style={{ color: '#bbb', fontSize: 13 }}>{date}</span>
                      <span
                        style={{
                          padding: '0.35rem 0.75rem',
                          background: `${color}22`,
                          color: color,
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {level}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div
            style={{
              background: '#1a2e1a',
              border: '1px solid #22c55e',
              borderRadius: 14,
              padding: '1.5rem',
            }}
          >
            <h3 style={{ margin: '0 0 1rem', color: '#22c55e' }}>💡 Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {generateRecommendations(studentData).map((rec, index) => (
                <div key={index} style={{ color: '#bbb', fontSize: 13, lineHeight: 1.6 }}>
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {searched && !loading && !studentData && !error && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#1a1a1a',
            borderRadius: 14,
            color: '#888',
          }}
        >
          No student data found. Please check the email address and try again.
        </div>
      )}
    </div>
  )
}

export default GuardianStressMonitoring
