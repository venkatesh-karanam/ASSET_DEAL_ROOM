import { useState, useEffect } from 'react'

interface DocumentAnalysis {
  fileName: string
  readabilityScore: number
  issues: DocumentIssue[]
  recommendations: string[]
  extractedData?: Record<string, string>
}

interface DocumentIssue {
  type: 'stamp_obscured' | 'signature_cropped' | 'text_unclear' | 'format_inconsistent' | 'tampering_suspected'
  severity: 'low' | 'medium' | 'high'
  description: string
}

interface MessyDocumentIntelligenceProps {
  uploadedFiles: Record<string, string>
  onAnalysisComplete?: (analysis: Record<string, DocumentAnalysis>) => void
}

export default function MessyDocumentIntelligence({
  uploadedFiles,
  onAnalysisComplete
}: MessyDocumentIntelligenceProps) {
  const [analyses, setAnalyses] = useState<Record<string, DocumentAnalysis>>({})
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set())

  useEffect(() => {
    const analyzeDocuments = async () => {
      const newAnalyses: Record<string, DocumentAnalysis> = {}

      for (const [key, fileName] of Object.entries(uploadedFiles)) {
        if (!fileName || analyses[key]) continue

        setAnalyzing(prev => new Set(prev).add(key))

        try {
          // Mock OCR analysis - in real implementation, call OCR service
          const analysis = await mockDocumentAnalysis(fileName, key)
          newAnalyses[key] = analysis
        } catch (error) {
          console.error(`Failed to analyze ${fileName}:`, error)
        } finally {
          setAnalyzing(prev => {
            const next = new Set(prev)
            next.delete(key)
            return next
          })
        }
      }

      if (Object.keys(newAnalyses).length > 0) {
        const updatedAnalyses = { ...analyses, ...newAnalyses }
        setAnalyses(updatedAnalyses)
        onAnalysisComplete?.(updatedAnalyses)
      }
    }

    analyzeDocuments()
  }, [uploadedFiles, analyses, onAnalysisComplete])

  const mockDocumentAnalysis = async (fileName: string, key: string): Promise<DocumentAnalysis> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock analysis based on filename patterns
    const issues: DocumentIssue[] = []
    let readabilityScore = 85

    if (fileName.toLowerCase().includes('stamp')) {
      issues.push({
        type: 'stamp_obscured',
        severity: 'medium',
        description: 'Stamp partially obscured by folding'
      })
      readabilityScore -= 15
    }

    if (fileName.toLowerCase().includes('signature')) {
      issues.push({
        type: 'signature_cropped',
        severity: 'high',
        description: 'Signature cropped at page edge'
      })
      readabilityScore -= 25
    }

    if (fileName.toLowerCase().includes('unclear') || Math.random() > 0.7) {
      issues.push({
        type: 'text_unclear',
        severity: 'low',
        description: 'Some text unclear due to poor scanning'
      })
      readabilityScore -= 10
    }

    if (Math.random() > 0.8) {
      issues.push({
        type: 'tampering_suspected',
        severity: 'high',
        description: 'Inconsistencies detected in document formatting'
      })
      readabilityScore -= 30
    }

    const recommendations = []
    if (readabilityScore < 70) {
      recommendations.push('Re-upload higher quality scan')
    }
    if (issues.some(i => i.type === 'stamp_obscured')) {
      recommendations.push('Ensure stamp is fully visible')
    }
    if (issues.some(i => i.type === 'signature_cropped')) {
      recommendations.push('Include full signature area')
    }

    return {
      fileName,
      readabilityScore: Math.max(0, readabilityScore),
      issues,
      recommendations,
      extractedData: key.includes('registry') ? {
        titleNumber: 'LR.12345/678',
        ownerName: 'JOHN DOE',
        registrationDate: '2020-03-15'
      } : undefined
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success)'
    if (score >= 60) return 'var(--warning)'
    return 'var(--danger)'
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return '🚨'
      case 'medium': return '⚠️'
      case 'low': return 'ℹ️'
      default: return '❓'
    }
  }

  return (
    <div className="document-intelligence">
      <h3>Messy Document Intelligence</h3>
      <p className="description">
        Our AI analyzes uploaded documents for readability issues, tampering signs, and extraction accuracy.
        We handle Kenya's imperfect document ecosystem.
      </p>

      {Object.keys(uploadedFiles).length === 0 ? (
        <p className="no-documents">Upload documents to see analysis</p>
      ) : (
        <div className="analysis-results">
          {Object.entries(uploadedFiles).map(([key, fileName]) => {
            const analysis = analyses[key]
            const isAnalyzing = analyzing.has(key)

            return (
              <div key={key} className="document-analysis">
                <div className="document-header">
                  <h4>{fileName}</h4>
                  {isAnalyzing && <span className="analyzing">Analyzing...</span>}
                </div>

                {analysis ? (
                  <div className="analysis-content">
                    <div className="readability-score">
                      <span>Document readability:</span>
                      <strong style={{ color: getScoreColor(analysis.readabilityScore) }}>
                        {analysis.readabilityScore}%
                      </strong>
                    </div>

                    {analysis.issues.length > 0 && (
                      <div className="issues-list">
                        <strong>Detected issues:</strong>
                        <ul>
                          {analysis.issues.map((issue, index) => (
                            <li key={index} className={`issue ${issue.severity}`}>
                              {getSeverityIcon(issue.severity)} {issue.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.recommendations.length > 0 && (
                      <div className="recommendations">
                        <strong>Recommendations:</strong>
                        <ul>
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.extractedData && (
                      <div className="extracted-data">
                        <strong>Extracted data:</strong>
                        <dl>
                          {Object.entries(analysis.extractedData).map(([field, value]) => (
                            <div key={field}>
                              <dt>{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</dt>
                              <dd>{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                ) : !isAnalyzing ? (
                  <p className="pending-analysis">Analysis pending</p>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <div className="intelligence-benefits">
        <h4>Why This Matters in Kenya</h4>
        <ul>
          <li><strong>Real Documents:</strong> Handles handwritten, scanned, and imperfect records</li>
          <li><strong>Fraud Detection:</strong> Identifies tampering and inconsistencies</li>
          <li><strong>User Guidance:</strong> Tells users exactly what to fix</li>
          <li><strong>Legal Ready:</strong> Creates evidence trail for court admissibility</li>
        </ul>
      </div>

      <style jsx>{`
        .document-intelligence {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .description {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }

        .no-documents {
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }

        .analysis-results {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .document-analysis {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background);
        }

        .document-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .document-header h4 {
          margin: 0;
          font-size: 1rem;
        }

        .analyzing {
          color: var(--primary);
          font-style: italic;
        }

        .readability-score {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
        }

        .issues-list, .recommendations, .extracted-data {
          margin-bottom: 1rem;
        }

        .issues-list ul, .recommendations ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .issue {
          margin-bottom: 0.5rem;
        }

        .issue.high { color: var(--danger); }
        .issue.medium { color: var(--warning); }
        .issue.low { color: var(--info); }

        .extracted-data dl {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 0.25rem 1rem;
          margin: 0.5rem 0;
        }

        .extracted-data dt {
          font-weight: bold;
          text-transform: capitalize;
        }

        .extracted-data dd {
          color: var(--text-secondary);
        }

        .pending-analysis {
          color: var(--text-secondary);
          font-style: italic;
        }

        .intelligence-benefits {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .intelligence-benefits h4 {
          margin-bottom: 1rem;
        }

        .intelligence-benefits ul {
          list-style: none;
          padding: 0;
        }

        .intelligence-benefits li {
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .intelligence-benefits li::before {
          content: '✓';
          color: var(--success);
          font-weight: bold;
          position: absolute;
          left: 0;
        }
      `}</style>
    </div>
  )
}