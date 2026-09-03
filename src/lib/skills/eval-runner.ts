import type {
  AssertionEvaluationResult,
  EvalExecutionResult,
  SkillEval,
  SkillEvalSuite,
  SkillSuiteExecutionSummary,
} from "./types"

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
  "to", "of", "in", "for", "on", "with", "by", "at", "from", "as", "into",
  "should", "must", "can", "could", "would", "will", "not", "that", "this", "these",
  "those", "it", "its", "they", "their", "we", "our", "you", "your", "if", "when",
  "than", "then", "so", "such", "both", "each", "all", "any", "does", "do", "did",
  "provides", "identifies", "explains", "addresses", "checks", "uses", "mentions",
  "recommends", "suggests", "recognizes", "includes", "defines", "distinguishes",
])

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-_]/g, " ")
}

function extractKeyTerms(phrase: string): string[] {
  const normalized = normalizeText(phrase)
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 2 && !STOPWORDS.has(t))
  return Array.from(new Set(tokens))
}

export function evaluateAssertion(assertion: string, actualOutput: string): AssertionEvaluationResult {
  if (!actualOutput || actualOutput.trim() === "") {
    return {
      assertion,
      passed: false,
      confidence: 0,
      matchedKeywords: [],
      reason: "Output is empty",
    }
  }

  const outputNorm = normalizeText(actualOutput)
  const assertionNorm = normalizeText(assertion)

  if (outputNorm.includes(assertionNorm)) {
    return {
      assertion,
      passed: true,
      confidence: 1.0,
      matchedKeywords: [assertion],
    }
  }

  const terms = extractKeyTerms(assertion)
  if (terms.length === 0) {
    return {
      assertion,
      passed: true,
      confidence: 1.0,
      matchedKeywords: [],
    }
  }

  const matched: string[] = []
  for (const term of terms) {
    // Exact word or stem prefix (e.g. "calculate" matches "calculation" / "calculates")
    const stem = term.length > 5 ? term.slice(0, 5) : term
    if (outputNorm.includes(term) || outputNorm.includes(stem)) {
      matched.push(term)
    }
  }

  const ratio = matched.length / terms.length
  // At least 40% match of distinctive terms or at least 2 key terms when total >= 3
  const passed = ratio >= 0.4 || (terms.length >= 3 && matched.length >= 2) || (terms.length === 1 && matched.length === 1)

  return {
    assertion,
    passed,
    confidence: Number(ratio.toFixed(2)),
    matchedKeywords: matched,
    reason: passed
      ? "Matched " + matched.length + "/" + terms.length + " key concepts (" + matched.join(", ") + ")"
      : "Only matched " + matched.length + "/" + terms.length + " key concepts (missing: " + terms.filter((t) => !matched.includes(t)).join(", ") + ")",
  }
}

export function evaluateSkillEval(
  skillName: string,
  evalItem: SkillEval,
  outputToTest?: string,
): EvalExecutionResult {
  const startTime = Date.now()
  const content = outputToTest !== undefined ? outputToTest : evalItem.expected_output

  const assertionResults: AssertionEvaluationResult[] = evalItem.assertions.map((assertion) =>
    evaluateAssertion(assertion, content),
  )

  const passedCount = assertionResults.filter((r) => r.passed).length
  const total = assertionResults.length
  const score = total > 0 ? Number((passedCount / total).toFixed(2)) : 1.0
  const passed = passedCount === total || (total >= 4 && passedCount / total >= 0.75)

  return {
    skillName,
    evalId: evalItem.id,
    prompt: evalItem.prompt,
    passed,
    score,
    assertionResults,
    durationMs: Date.now() - startTime,
  }
}

export function evaluateSkillSuite(
  suite: SkillEvalSuite,
  customOutputs?: Record<number, string>,
): SkillSuiteExecutionSummary {
  const results: EvalExecutionResult[] = suite.evals.map((evalItem) => {
    const custom = customOutputs ? customOutputs[evalItem.id] : undefined
    return evaluateSkillEval(suite.skill_name, evalItem, custom)
  })

  const passedEvals = results.filter((r) => r.passed).length
  const totalScore = results.reduce((acc, r) => acc + r.score, 0)
  const averageScore = results.length > 0 ? Number((totalScore / results.length).toFixed(2)) : 1.0

  return {
    skillName: suite.skill_name,
    totalEvals: suite.evals.length,
    passedEvals,
    averageScore,
    results,
  }
}
