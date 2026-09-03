export interface SkillFrontmatter {
  name: string
  description: string
  [key: string]: unknown
}

export interface SkillEval {
  id: number
  prompt: string
  expected_output: string
  assertions: string[]
  files?: string[]
}

export interface SkillEvalSuite {
  skill_name: string
  evals: SkillEval[]
}

export interface SkillMetadata {
  name: string
  dirName: string
  dirPath: string
  skillMdPath: string
  frontmatter: SkillFrontmatter
  references: string[]
  evalSuite?: SkillEvalSuite
  hasReferences: boolean
  hasEvals: boolean
}

export interface SkillValidationError {
  skill: string
  type: 'frontmatter' | 'schema' | 'link' | 'evals' | 'system'
  message: string
  file?: string
}

export interface SkillValidationReport {
  totalSkills: number
  validSkills: number
  totalEvals: number
  errors: SkillValidationError[]
  warnings: SkillValidationError[]
  skills: SkillMetadata[]
}

export interface AssertionEvaluationResult {
  assertion: string
  passed: boolean
  confidence: number
  matchedKeywords?: string[]
  reason?: string
}

export interface EvalExecutionResult {
  skillName: string
  evalId: number
  prompt: string
  passed: boolean
  score: number
  assertionResults: AssertionEvaluationResult[]
  durationMs: number
}

export interface SkillSuiteExecutionSummary {
  skillName: string
  totalEvals: number
  passedEvals: number
  averageScore: number
  results: EvalExecutionResult[]
}
