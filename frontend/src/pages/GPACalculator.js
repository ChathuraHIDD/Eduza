import React, { useCallback, useMemo, useState } from 'react'

const GRADING_SCALE = [
  { grade: 'A+', gpa: 4.0, marks: '90-100' },
  { grade: 'A', gpa: 4.0, marks: '80-89' },
  { grade: 'A-', gpa: 3.7, marks: '75-79' },
  { grade: 'B+', gpa: 3.3, marks: '70-74' },
  { grade: 'B', gpa: 3.0, marks: '65-69' },
  { grade: 'B-', gpa: 2.7, marks: '60-64' },
  { grade: 'C+', gpa: 2.3, marks: '55-59' },
  { grade: 'C', gpa: 2.0, marks: '45-54' },
  { grade: 'C-', gpa: 1.7, marks: '40-44' },
  { grade: 'D+', gpa: 1.3, marks: '35-39' },
  { grade: 'D', gpa: 1.0, marks: '30-34' },
  { grade: 'E', gpa: 0.0, marks: '0-29' },
]

const modeOptions = [
  { title: 'Custom', subtitle: 'Add your own' },
  { title: 'Y1S1 Only', subtitle: 'New Syllabus' },
  { title: 'Y1S1 Only', subtitle: 'Old Syllabus' },
  { title: 'Y1S2 Only', subtitle: 'New Syllabus' },
  { title: 'Y1S2 Only', subtitle: 'Old Syllabus' },
  { title: 'Y2S1 Only', subtitle: 'Old Syllabus' },
  { title: 'Y2S2 Only', subtitle: 'Old Syllabus' },
  { title: 'Up to Y1S2', subtitle: 'New Syllabus' },
  { title: 'Up to Y2S1', subtitle: 'Old Syllabus' },
  { title: 'Up to Y2S2', subtitle: 'Old Syllabus' },
]

function GPACalculator() {
  const [selectedMode, setSelectedMode] = useState('Custom-Add your own')
  const [modules, setModules] = useState([
    { id: 1, moduleName: '', credits: 3, grade: 'A' },
  ])
  const [reportGenerated, setReportGenerated] = useState(false)

  const getGradePoint = useCallback((grade) => {
    const found = GRADING_SCALE.find((item) => item.grade === grade)
    return found ? found.gpa : 0
  }, [])

  const handleModuleChange = (id, field, value) => {
    setModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, [field]: value } : module
      )
    )
    setReportGenerated(false)
  }

  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        id: Date.now(),
        moduleName: '',
        credits: 3,
        grade: 'A',
      },
    ])
    setReportGenerated(false)
  }

  const removeModule = (id) => {
    if (modules.length === 1) return
    setModules((prev) => prev.filter((module) => module.id !== id))
    setReportGenerated(false)
  }

  const validModules = useMemo(() => {
    return modules.filter(
      (m) => m.moduleName.trim() !== '' && Number(m.credits) > 0
    )
  }, [modules])

  const summary = useMemo(() => {
    const totalCredits = validModules.reduce(
      (sum, module) => sum + Number(module.credits),
      0
    )

    const totalWeightedPoints = validModules.reduce(
      (sum, module) =>
        sum + Number(module.credits) * getGradePoint(module.grade),
      0
    )

    const gpa =
      totalCredits > 0 ? (totalWeightedPoints / totalCredits).toFixed(2) : '0.00'

    return {
      totalModules: validModules.length,
      totalCredits,
      gpa,
    }
  }, [getGradePoint, validModules])

  const getGpaLabel = (gpa) => {
    const value = Number(gpa)
    if (value >= 3.7) return 'Excellent'
    if (value >= 3.3) return 'Very Good'
    if (value >= 3.0) return 'Good'
    if (value >= 2.0) return 'Average'
    if (value > 0) return 'Needs Improvement'
    return 'No Data'
  }

  const getReportMessage = (gpa) => {
    const value = Number(gpa)
    if (value >= 3.7) {
      return 'Outstanding academic performance. You are maintaining a very strong GPA and showing excellent consistency across your modules.'
    }
    if (value >= 3.3) {
      return 'Very strong academic performance. You are doing well in most subjects and are close to excellent standing.'
    }
    if (value >= 3.0) {
      return 'Good academic performance. You have a solid GPA, but there is still room to improve a few modules for a stronger result.'
    }
    if (value >= 2.0) {
      return 'Average academic performance. Focus more on weaker modules and improve consistency to raise your GPA.'
    }
    if (value > 0) {
      return 'Your GPA needs improvement. It is important to review difficult modules, practice regularly, and seek support when needed.'
    }
    return 'No GPA report can be generated yet. Please enter valid module details first.'
  }

  const getStrengthModules = () => {
    return validModules.filter((m) => getGradePoint(m.grade) >= 3.3)
  }

  const getWeakModules = () => {
    return validModules.filter((m) => getGradePoint(m.grade) < 3.0)
  }

  const handleGenerateReport = () => {
    if (validModules.length === 0) {
      alert('Please add at least one valid module before generating the report.')
      return
    }
    setReportGenerated(true)
  }

  const handleDownloadReport = () => {
    if (!reportGenerated) {
      alert('Please generate the report first.')
      return
    }

    const reportDate = new Date().toLocaleString()
    const moduleLines = validModules
      .map(
        (module, index) =>
          `${index + 1}. ${module.moduleName} | Credits: ${module.credits} | Grade: ${module.grade} | Grade Point: ${getGradePoint(module.grade)}`
      )
      .join('\n')

    const strongLines =
      getStrengthModules().length > 0
        ? getStrengthModules().map((m) => `- ${m.moduleName} (${m.grade})`).join('\n')
        : 'None'

    const weakLines =
      getWeakModules().length > 0
        ? getWeakModules().map((m) => `- ${m.moduleName} (${m.grade})`).join('\n')
        : 'None'

    const reportText = `EDUZA GPA REPORT\n==============================\n\nGenerated On:\n${reportDate}\n\nSelected Mode:\n${selectedMode}\n\nOverall Summary:\n- Total Modules: ${summary.totalModules}\n- Total Credits: ${summary.totalCredits}\n- GPA: ${summary.gpa}\n- Performance Level: ${getGpaLabel(summary.gpa)}\n\nModule Details:\n${moduleLines}\n\nPerformance Report:\n${getReportMessage(summary.gpa)}\n\nStrong Modules:\n${strongLines}\n\nModules That Need Improvement:\n${weakLines}\n\nSuggestions:\n- Focus on low-grade modules first\n- Improve time management and revision planning\n- Practice quizzes and past papers\n- Stay consistent with weekly study goals\n`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'gpa-report.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1040, margin: '0 auto' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #ff6a00 0%, #f25c05 55%, #d5541b 100%)',
          borderRadius: '24px',
          padding: '28px 32px',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '165px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -55,
            right: 100,
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(255,255,255,0.14)',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: '14px',
            width: 'fit-content',
            marginBottom: '14px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
            }}
          >
            ✨
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            GPA Calculator
          </span>
        </div>

        <h1
          style={{
            margin: '0 0 10px 0',
            color: '#fff',
            fontSize: '28px',
            fontWeight: '800',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Calculate GPA
        </h1>

        <p
          style={{
            margin: 0,
            color: 'rgba(255,255,255,0.92)',
            fontSize: '14px',
            lineHeight: '1.7',
            maxWidth: '760px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          Add your modules, credits, and grades to calculate your GPA and generate a GPA report.
        </p>
      </div>

      <div style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 12, fontWeight: 700, color: '#111827' }}>Select Mode</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {modeOptions.map((mode) => {
            const modeKey = `${mode.title}-${mode.subtitle}`
            const isActive = selectedMode === modeKey
            return (
              <button
                key={modeKey}
                onClick={() => {
                  setSelectedMode(modeKey)
                  setReportGenerated(false)
                }}
                style={{
                  borderRadius: 18,
                  border: isActive ? '1px solid #7c3aed' : '1px solid #d1d5db',
                  background: isActive ? '#ede9fe' : '#ffffff',
                  color: isActive ? '#5b21b6' : '#111827',
                  padding: '12px 16px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 700 }}>{mode.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{mode.subtitle}</div>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ borderRadius: 24, border: '1px solid #f5d0fe', background: '#fff', padding: 24, marginBottom: 24 }}>
        {modules.map((module, index) => (
          <div key={module.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#111827' }}>
                {index === 0 ? 'Module Name' : ' '}
              </label>
              <input
                type="text"
                placeholder="Module name"
                value={module.moduleName}
                onChange={(e) => handleModuleChange(module.id, 'moduleName', e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 16, border: '1px solid #fbbf24', background: '#fffbeb', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#111827' }}>
                {index === 0 ? 'Credits' : ' '}
              </label>
              <input
                type="number"
                min="1"
                value={module.credits}
                onChange={(e) => handleModuleChange(module.id, 'credits', e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 16, border: '1px solid #fbbf24', background: '#fffbeb', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 700, color: '#111827' }}>
                {index === 0 ? 'Grade' : ' '}
              </label>
              <select
                value={module.grade}
                onChange={(e) => handleModuleChange(module.id, 'grade', e.target.value)}
                style={{ width: '100%', padding: 12, borderRadius: 16, border: '1px solid #fbbf24', background: '#fffbeb', outline: 'none' }}
              >
                {GRADING_SCALE.map((item) => (
                  <option key={item.grade} value={item.grade}>
                    {item.grade}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'end' }}>
              <button
                onClick={() => removeModule(module.id)}
                style={{ width: '100%', borderRadius: 16, border: '1px solid #fca5a5', background: '#fecaca', color: '#991b1b', padding: '12px 0', cursor: 'pointer' }}
              >
                ⊖
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
          <button
            onClick={addModule}
            style={{ borderRadius: 18, border: 'none', background: '#f97316', color: '#ffffff', padding: '12px 20px', cursor: 'pointer' }}
          >
            Add Module
          </button>
          <button
            onClick={handleGenerateReport}
            style={{ borderRadius: 18, border: 'none', background: '#111827', color: '#ffffff', padding: '12px 20px', cursor: 'pointer' }}
          >
            Generate Report
          </button>
          <button
            onClick={handleDownloadReport}
            style={{ borderRadius: 18, border: '1px solid #f97316', background: '#ffffff', color: '#f97316', padding: '12px 20px', cursor: 'pointer' }}
          >
            Download Report
          </button>
        </div>
      </div>

      <div style={{ borderRadius: 24, border: '1px solid #fcd34d', background: '#fef3c7', padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4b5563' }}>Total Modules</div>
            <div style={{ marginTop: 8, fontSize: 32, fontWeight: 800, color: '#111827' }}>{summary.totalModules}</div>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4b5563' }}>Total Credits</div>
            <div style={{ marginTop: 8, fontSize: 32, fontWeight: 800, color: '#111827' }}>{summary.totalCredits}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#4b5563' }}>Current GPA</div>
            <div style={{ marginTop: 8, fontSize: 48, fontWeight: 800, color: '#c2410c' }}>{summary.gpa}</div>
            <div style={{ marginTop: 6, color: '#475569', fontWeight: 600 }}>{getGpaLabel(summary.gpa)}</div>
          </div>
        </div>
      </div>

      {reportGenerated && (
        <div style={{ borderRadius: 24, border: '1px solid #e2e8f0', background: '#ffffff', padding: 24, marginBottom: 24 }}>
          <h2 style={{ marginBottom: 16, fontSize: 24, fontWeight: 800, color: '#111827' }}>GPA Report</h2>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div style={{ fontWeight: 700, color: '#334155' }}>Selected Mode:</div>
              <div style={{ marginTop: 4, color: '#475569' }}>{selectedMode}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#334155' }}>Performance Level:</div>
              <div style={{ marginTop: 4, color: '#475569' }}>{getGpaLabel(summary.gpa)}</div>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#334155' }}>Report Message</div>
              <p style={{ marginTop: 6, color: '#475569', lineHeight: 1.75 }}>{getReportMessage(summary.gpa)}</p>
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#334155' }}>Strong Modules</div>
              {getStrengthModules().length > 0 ? (
                <ul style={{ marginTop: 8, paddingLeft: 20, color: '#475569' }}>
                  {getStrengthModules().map((module) => (
                    <li key={module.id}>{module.moduleName} ({module.grade})</li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: 8, color: '#475569' }}>No strong modules identified yet.</p>
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#334155' }}>Weak Modules</div>
              {getWeakModules().length > 0 ? (
                <ul style={{ marginTop: 8, paddingLeft: 20, color: '#475569' }}>
                  {getWeakModules().map((module) => (
                    <li key={module.id}>{module.moduleName} ({module.grade})</li>
                  ))}
                </ul>
              ) : (
                <p style={{ marginTop: 8, color: '#475569' }}>No weak modules identified.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ borderRadius: 24, border: '1px solid #fcd34d', background: '#fffbeb', padding: 24 }}>
        <h2 style={{ marginBottom: 16, fontSize: 22, fontWeight: 800, color: '#92400e' }}>Grading Scale</h2>
        <div style={{ display: 'grid', gap: 12 }}>
          {GRADING_SCALE.map((item) => (
            <div key={item.grade} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: 12, borderRadius: 18, background: '#fff7d6', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: '#92400e' }}>{item.grade}</div>
              <div style={{ color: '#6b7280' }}>{item.gpa.toFixed(1)}</div>
              <div style={{ color: '#6b7280' }}>{item.marks}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, color: '#92400e' }}>
          GPA = Total (Grade Point × Credits) / Total Credits
        </div>
      </div>
    </div>
  )
}

export default GPACalculator;
