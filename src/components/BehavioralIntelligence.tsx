import { useState, useEffect } from 'react'

interface BehavioralIndicator {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  confidence: number
  detected: boolean
}

interface RelationshipRisk {
  indicators: BehavioralIndicator[]
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
}

interface BehavioralIntelligenceProps {
  sellerName: string
  sellerPhone: string
  buyerName: string
  dealAmount?: number
  communicationLog?: string[]
  paymentMethod?: string
  urgencyLevel?: number
  onAnalysisComplete?: (analysis: RelationshipRisk) => void
}

export default function BehavioralIntelligence({
  sellerName,
  sellerPhone,
  buyerName,
  dealAmount,
  communicationLog = [],
  paymentMethod,
  urgencyLevel = 0,
  onAnalysisComplete
}: BehavioralIntelligenceProps) {
  const [riskAnalysis, setRiskAnalysis] = useState<RelationshipRisk | null>(null)
  const [analyzing, setAnalyzing] = useState(false)

  useEffect(() => {
    const analyzeBehavior = async () => {
      if (!sellerName || !buyerName) return

      setAnalyzing(true)

      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      const indicators: BehavioralIndicator[] = []

      // Check for off-platform payment requests
      if (paymentMethod && ['mpesa', 'cash', 'bank_transfer'].includes(paymentMethod.toLowerCase())) {
        indicators.push({
          type: 'off_platform_payment',
          severity: 'high',
          description: 'Seller requested payment outside DealRoom KE',
          confidence: 85,
          detected: true
        })
      }

      // Check for private communication shift
      if (communicationLog.some(msg => msg.toLowerCase().includes('whatsapp') || msg.toLowerCase().includes('private'))) {
        indicators.push({
          type: 'private_communication',
          severity: 'medium',
          description: 'Communication moved to private channels',
          confidence: 70,
          detected: true
        })
      }

      // Check for urgency pressure
      if (urgencyLevel > 7) {
        indicators.push({
          type: 'urgency_pressure',
          severity: 'medium',
          description: 'High urgency language detected in communications',
          confidence: 60,
          detected: true
        })
      }

      // Check for family/close relationship patterns
      const familyTerms = ['brother', 'sister', 'cousin', 'uncle', 'aunt', 'family', 'relative']
      if (communicationLog.some(msg => familyTerms.some(term => msg.toLowerCase().includes(term)))) {
        indicators.push({
          type: 'family_relationship',
          severity: 'low',
          description: 'Family relationship mentioned - monitor for internal fraud',
          confidence: 40,
          detected: true
        })
      }

      // Check for church/community connections
      const communityTerms = ['church', 'pastor', 'community', 'neighbor', 'friend']
      if (communicationLog.some(msg => communityTerms.some(term => msg.toLowerCase().includes(term)))) {
        indicators.push({
          type: 'community_connection',
          severity: 'low',
          description: 'Community connection detected - potential trust exploitation',
          confidence: 35,
          detected: true
        })
      }

      // Check for unusual timing (late night, weekend urgency)
      const now = new Date()
      const hour = now.getHours()
      if ((hour < 6 || hour > 22) && urgencyLevel > 5) {
        indicators.push({
          type: 'unusual_timing',
          severity: 'low',
          description: 'Unusual timing for urgent transaction',
          confidence: 30,
          detected: true
        })
      }

      // Calculate overall risk
      const criticalCount = indicators.filter(i => i.severity === 'critical').length
      const highCount = indicators.filter(i => i.severity === 'high').length
      const mediumCount = indicators.filter(i => i.severity === 'medium').length

      let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low'
      if (criticalCount > 0) overallRisk = 'critical'
      else if (highCount > 0) overallRisk = 'high'
      else if (mediumCount > 1) overallRisk = 'high'
      else if (mediumCount > 0) overallRisk = 'medium'

      // Generate recommendations
      const recommendations: string[] = []
      if (overallRisk === 'high' || overallRisk === 'critical') {
        recommendations.push('Pause transaction and verify identities independently')
        recommendations.push('Consider involving a neutral third party')
      }
      if (indicators.some(i => i.type === 'off_platform_payment')) {
        recommendations.push('Insist on DealRoom KE escrow payment only')
      }
      if (indicators.some(i => i.type === 'private_communication')) {
        recommendations.push('Keep all communication within DealRoom KE platform')
      }
      if (indicators.some(i => i.type === 'urgency_pressure')) {
        recommendations.push('Take time to verify independently - fraud often creates false urgency')
      }

      setRiskAnalysis({
        indicators,
        overallRisk,
        recommendations
      })
      onAnalysisComplete?.({
        indicators,
        overallRisk,
        recommendations
      })
      setAnalyzing(false)
    }

    analyzeBehavior()
  }, [sellerName, sellerPhone, buyerName, dealAmount, communicationLog, paymentMethod, urgencyLevel])

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'var(--danger)'
      case 'high': return 'var(--danger)'
      case 'medium': return 'var(--warning)'
      case 'low': return 'var(--success)'
      default: return 'var(--text-secondary)'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨'
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🔵'
      default: return '⚪'
    }
  }

  return (
    <div className="behavioral-intelligence">
      <h3>Social Fraud Detection</h3>
      <p className="description">
        Kenya's fraud often comes through trusted relationships. We analyze behavioral patterns
        to detect when "trusted" sellers might be exploiting relationships.
      </p>

      {analyzing ? (
        <div className="analyzing">Analyzing behavioral patterns...</div>
      ) : riskAnalysis ? (
        <div className="risk-analysis">
          <div className="overall-risk">
            <h4>Relationship Risk Assessment</h4>
            <div className="risk-score">
              <span className="risk-label">Overall Risk:</span>
              <span
                className={`risk-value ${riskAnalysis.overallRisk}`}
                style={{ color: getRiskColor(riskAnalysis.overallRisk) }}
              >
                {riskAnalysis.overallRisk.toUpperCase()}
              </span>
            </div>
          </div>

          {riskAnalysis.indicators.length > 0 && (
            <div className="risk-indicators">
              <h4>Risk Indicators Detected</h4>
              <div className="indicators-list">
                {riskAnalysis.indicators.map((indicator, index) => (
                  <div key={index} className={`indicator ${indicator.severity}`}>
                    <div className="indicator-header">
                      {getSeverityIcon(indicator.severity)}
                      <strong>{indicator.description}</strong>
                    </div>
                    <div className="indicator-details">
                      <span>Confidence: {indicator.confidence}%</span>
                      <span>Severity: {indicator.severity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {riskAnalysis.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Recommended Actions</h4>
              <ul>
                {riskAnalysis.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="no-data">Enter seller and buyer information to analyze relationship risks</p>
      )}

      <div className="kenya-context">
        <h4>Why Social Fraud Detection Matters in Kenya</h4>
        <ul>
          <li><strong>Family Fraud:</strong> Relatives selling the same property multiple times</li>
          <li><strong>Church Networks:</strong> Trusted community members exploiting relationships</li>
          <li><strong>Community Brokers:</strong> Local "trusted" intermediaries facilitating scams</li>
          <li><strong>Relationship Pressure:</strong> Using social bonds to create urgency</li>
        </ul>
      </div>

      <style jsx>{`
        .behavioral-intelligence {
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

        .analyzing {
          text-align: center;
          color: var(--primary);
          font-style: italic;
          padding: 2rem;
        }

        .risk-analysis {
          margin-bottom: 2rem;
        }

        .overall-risk {
          margin-bottom: 1.5rem;
        }

        .risk-score {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 6px;
        }

        .risk-label {
          font-weight: bold;
        }

        .risk-value {
          font-size: 1.2rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .risk-indicators h4 {
          margin-bottom: 1rem;
        }

        .indicators-list {
          display: grid;
          gap: 0.75rem;
        }

        .indicator {
          border: 1px solid var(--border-light);
          border-radius: 4px;
          padding: 0.75rem;
        }

        .indicator.critical { border-color: var(--danger); background: rgba(220, 53, 69, 0.05); }
        .indicator.high { border-color: var(--danger); background: rgba(220, 53, 69, 0.05); }
        .indicator.medium { border-color: var(--warning); background: rgba(255, 193, 7, 0.05); }
        .indicator.low { border-color: var(--info); background: rgba(0, 123, 255, 0.05); }

        .indicator-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .indicator-details {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .recommendations ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .recommendations li {
          margin-bottom: 0.5rem;
        }

        .no-data {
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          padding: 2rem;
        }

        .kenya-context {
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        .kenya-context h4 {
          margin-bottom: 1rem;
        }

        .kenya-context ul {
          list-style: none;
          padding: 0;
        }

        .kenya-context li {
          margin-bottom: 0.5rem;
          padding-left: 1rem;
          position: relative;
        }

        .kenya-context li::before {
          content: '⚠️';
          position: absolute;
          left: 0;
        }
      `}</style>
    </div>
  )
}