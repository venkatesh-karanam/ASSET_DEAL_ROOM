import { useMemo } from 'react'

interface ActionPrompt {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'verification' | 'documents' | 'system' | 'behavioral' | 'compliance'
  title: string
  description: string
  action: string
  actionable: boolean
  autoAction?: () => void
}

interface ActionPromptsProps {
  currentStep: number
  sellerKyc: any
  governmentVerification: any
  evidenceDocuments: Record<string, string>
  systemStatus: any
  behavioralAnalysis: any
  documentAnalysis: any
  onActionClick?: (actionId: string) => void
}

export default function ActionPrompts({
  currentStep,
  sellerKyc,
  governmentVerification,
  evidenceDocuments,
  systemStatus,
  behavioralAnalysis,
  documentAnalysis,
  onActionClick
}: ActionPromptsProps) {
  const prompts = useMemo(() => {
    const allPrompts: ActionPrompt[] = []

    // System status prompts
    if (!systemStatus?.backendOnline) {
      allPrompts.push({
        id: 'system_backend_down',
        priority: 'critical',
        category: 'system',
        title: 'Backend System Offline',
        description: 'The DealRoom backend is not responding. Limited functionality available.',
        action: 'Contact system administrator',
        actionable: false
      })
    }

    if (!systemStatus?.ardhiConnected && !systemStatus?.ntsaConnected) {
      allPrompts.push({
        id: 'system_registry_down',
        priority: 'high',
        category: 'system',
        title: 'Registry Systems Unavailable',
        description: 'Government registries are not accessible. Verification cannot proceed.',
        action: 'Retry connection or use manual verification',
        actionable: true
      })
    }

    // Verification prompts
    if (currentStep >= 2 && !governmentVerification) {
      allPrompts.push({
        id: 'verification_missing',
        priority: 'high',
        category: 'verification',
        title: 'Government Verification Required',
        description: 'Registry check has not been performed. This is required before proceeding.',
        action: 'Run government verification',
        actionable: true
      })
    }

    if (governmentVerification?.status === 'blocked') {
      allPrompts.push({
        id: 'verification_blocked',
        priority: 'critical',
        category: 'verification',
        title: 'Transaction Blocked',
        description: `Registry verification blocked: ${governmentVerification.message}`,
        action: 'Review block reason and resolve issues',
        actionable: false
      })
    }

    if (governmentVerification?.status === 'caution') {
      allPrompts.push({
        id: 'verification_caution',
        priority: 'medium',
        category: 'verification',
        title: 'Registry issues found',
        description: 'Caveats or encumbrances were detected and could affect your trust decision.',
        action: 'Review caveats and encumbrances',
        actionable: true
      })
    }

    if (currentStep >= 4) {
      allPrompts.push({
        id: 'live_protection_scan',
        priority: 'medium',
        category: 'system',
        title: 'Live protection scan is active',
        description: 'The platform is comparing registry, identity, and evidence signals in the background.',
        action: 'Review ongoing protection checks',
        actionable: false
      })
    }

    // KYC prompts
    if (currentStep >= 3 && sellerKyc?.status === 'incomplete') {
      allPrompts.push({
        id: 'kyc_incomplete',
        priority: 'high',
        category: 'verification',
        title: 'Seller KYC Incomplete',
        description: `KYC completion: ${sellerKyc?.score || 0}%. Missing required information.`,
        action: 'Complete seller identity verification',
        actionable: true
      })
    }

    // Document prompts
    const uploadedCount = Object.values(evidenceDocuments).filter(Boolean).length
    const requiredCount = 9

    if (currentStep >= 4 && uploadedCount < 6) {
      allPrompts.push({
        id: 'documents_minimum',
        priority: 'high',
        category: 'documents',
        title: 'Minimum Documents Required',
        description: `Only ${uploadedCount} of ${requiredCount} required documents uploaded.`,
        action: 'Upload at least 6 evidence documents',
        actionable: true
      })
    }

    if (uploadedCount < requiredCount) {
      allPrompts.push({
        id: 'documents_incomplete',
        priority: 'medium',
        category: 'documents',
        title: 'Evidence Incomplete',
        description: `${uploadedCount}/${requiredCount} documents uploaded. Full verification requires all documents.`,
        action: 'Upload remaining evidence documents',
        actionable: true
      })
    }

    // Document analysis prompts
    if (documentAnalysis) {
      Object.entries(documentAnalysis).forEach(([docKey, analysis]: [string, any]) => {
        if (analysis.readabilityScore < 60) {
          allPrompts.push({
            id: `document_quality_${docKey}`,
            priority: 'medium',
            category: 'documents',
            title: 'Poor Document Quality',
            description: `${docKey} readability: ${analysis.readabilityScore}%. May cause verification issues.`,
            action: 'Re-upload higher quality document',
            actionable: true
          })
        }

        if (analysis.issues?.some((issue: any) => issue.severity === 'high')) {
          allPrompts.push({
            id: `document_issues_${docKey}`,
            priority: 'high',
            category: 'documents',
            title: 'Critical Document Issues',
            description: `${docKey} has critical issues that may prevent verification.`,
            action: 'Review and fix document issues',
            actionable: true
          })
        }
      })
    }

    // Behavioral analysis prompts
    if (behavioralAnalysis?.overallRisk === 'critical') {
      allPrompts.push({
        id: 'behavioral_critical',
        priority: 'critical',
        category: 'behavioral',
        title: 'Critical Behavioral Risk',
        description: 'High-risk behavioral patterns detected. Transaction should not proceed.',
        action: 'Review behavioral analysis and stop transaction',
        actionable: true
      })
    }

    if (behavioralAnalysis?.overallRisk === 'high') {
      allPrompts.push({
        id: 'behavioral_high',
        priority: 'high',
        category: 'behavioral',
        title: 'High Behavioral Risk',
        description: 'Concerning behavioral patterns detected that require attention.',
        action: 'Review behavioral recommendations',
        actionable: true
      })
    }

    if (behavioralAnalysis?.recommendations?.length > 0) {
      allPrompts.push({
        id: 'behavioral_recommendations',
        priority: 'medium',
        category: 'behavioral',
        title: 'Behavioral Recommendations',
        description: `${behavioralAnalysis.recommendations.length} recommendations for risk mitigation.`,
        action: 'Review and implement recommendations',
        actionable: true
      })
    }

    // Step-specific prompts
    if (currentStep === 1) {
      allPrompts.push({
        id: 'step_asset_setup',
        priority: 'low',
        category: 'verification',
        title: 'Complete Asset Setup',
        description: 'Enter asset type and identifier to begin verification process.',
        action: 'Fill in asset details',
        actionable: true
      })
    }

    if (currentStep === 2) {
      allPrompts.push({
        id: 'step_party_verification',
        priority: 'medium',
        category: 'verification',
        title: 'Verify seller identity before payment',
        description: 'Confirm the parties and contact details before you commit funds.',
        action: 'Complete party verification',
        actionable: true
      })
    }

    if (currentStep === 3) {
      allPrompts.push({
        id: 'step_kyc_completion',
        priority: 'high',
        category: 'verification',
        title: 'Complete seller identity protection',
        description: 'This step verifies seller identity and buyer contact integrity before release of funds.',
        action: 'Complete KYC verification',
        actionable: true
      })
    }

    if (currentStep === 4) {
      allPrompts.push({
        id: 'step_document_upload',
        priority: 'high',
        category: 'documents',
        title: 'Capture evidence that protects your payment',
        description: 'Upload documents that will back up your claim if a dispute happens.',
        action: 'Upload and verify documents',
        actionable: true
      })
    }

    if (currentStep === 5) {
      allPrompts.push({
        id: 'step_final_review',
        priority: 'medium',
        category: 'compliance',
        title: 'Final fraud protection screening',
        description: 'Review all verification results, regional intelligence, and protection signals before proceeding.',
        action: 'Complete final review',
        actionable: true
      })
    }

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return allPrompts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  }, [
    currentStep,
    sellerKyc,
    governmentVerification,
    evidenceDocuments,
    systemStatus,
    behavioralAnalysis,
    documentAnalysis
  ])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'var(--danger)'
      case 'high': return 'var(--warning)'
      case 'medium': return 'var(--info)'
      case 'low': return 'var(--success)'
      default: return 'var(--text-secondary)'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🚨'
      case 'high': return '⚠️'
      case 'medium': return 'ℹ️'
      case 'low': return '✅'
      default: return '❓'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'verification': return '🔍'
      case 'documents': return '📄'
      case 'system': return '⚙️'
      case 'behavioral': return '🧠'
      case 'compliance': return '⚖️'
      default: return '📋'
    }
  }

  if (prompts.length === 0) {
    return (
      <div className="action-prompts">
        <h3>Action Prompts</h3>
        <div className="no-prompts">
          <span>✅</span>
          <p>All systems operational. No action required.</p>
        </div>
        <style jsx>{`
          .action-prompts {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1.5rem;
            margin: 1rem 0;
          }

          .no-prompts {
            text-align: center;
            padding: 2rem;
            color: var(--success);
          }

          .no-prompts span {
            font-size: 2rem;
            display: block;
            margin-bottom: 1rem;
          }

          .no-prompts p {
            margin: 0;
            color: var(--text-secondary);
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="action-prompts">
      <h3>Intelligent Action Prompts</h3>
      <p className="description">
        AI-powered analysis of your current situation with prioritized action recommendations.
      </p>

      <div className="prompts-list">
        {prompts.map(prompt => (
          <div key={prompt.id} className={`prompt-item ${prompt.priority}`}>
            <div className="prompt-header">
              <div className="prompt-meta">
                {getPriorityIcon(prompt.priority)}
                {getCategoryIcon(prompt.category)}
                <span className="priority" style={{ color: getPriorityColor(prompt.priority) }}>
                  {prompt.priority.toUpperCase()}
                </span>
              </div>
              <h4>{prompt.title}</h4>
            </div>

            <p className="prompt-description">{prompt.description}</p>

            {prompt.actionable && (
              <button
                className="prompt-action"
                onClick={() => onActionClick?.(prompt.id)}
              >
                {prompt.action}
              </button>
            )}

            {!prompt.actionable && (
              <div className="prompt-note">
                <small>{prompt.action}</small>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="prompts-summary">
        <p>
          <strong>{prompts.filter(p => p.priority === 'critical').length}</strong> critical,
          <strong>{prompts.filter(p => p.priority === 'high').length}</strong> high priority actions
        </p>
      </div>

      <style jsx>{`
        .action-prompts {
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

        .prompts-list {
          display: grid;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .prompt-item {
          border: 1px solid var(--border-light);
          border-radius: 6px;
          padding: 1rem;
          background: var(--background);
        }

        .prompt-item.critical {
          border-color: var(--danger);
          background: rgba(220, 53, 69, 0.05);
        }

        .prompt-item.high {
          border-color: var(--warning);
          background: rgba(255, 193, 7, 0.05);
        }

        .prompt-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .prompt-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .priority {
          font-weight: bold;
          font-size: 0.8rem;
        }

        .prompt-item h4 {
          margin: 0;
          font-size: 1rem;
        }

        .prompt-description {
          margin: 0 0 1rem 0;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .prompt-action {
          background: var(--primary);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .prompt-action:hover {
          background: var(--primary-dark);
        }

        .prompt-note {
          background: var(--background);
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid var(--border-light);
        }

        .prompt-note small {
          color: var(--text-secondary);
        }

        .prompts-summary {
          border-top: 1px solid var(--border);
          padding-top: 1rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .prompts-summary strong {
          color: var(--text);
        }
      `}</style>
    </div>
  )
}