import { describe, it, expect } from "vitest"
import path from "path"
import { evaluateAssertion, evaluateSkillEval, evaluateSkillSuite } from "@/lib/skills/eval-runner"
import { validateSkill } from "@/lib/skills/validator"
import type { SkillEval } from "@/lib/skills/types"

describe("Skills Evaluation Engine (eval-runner)", () => {
  const skillsDir = path.join(process.cwd(), ".agents/skills")

  describe("evaluateAssertion", () => {
    it("returns true and 1.0 confidence for exact/partial substring matches", () => {
      const assertion = "Checks for product-marketing.md"
      const output = "Before planning the test, I will check for product-marketing.md in the repo."
      const res = evaluateAssertion(assertion, output)
      expect(res.passed).toBe(true)
      expect(res.confidence).toBe(1.0)
    })

    it("returns true when key distinctive terms are present", () => {
      const assertion = "Uses the hypothesis framework with observation, belief, outcome, and metric"
      const output = "We formulate our hypothesis: Because observation X, we believe change Y will yield outcome Z, measured by metric M."
      const res = evaluateAssertion(assertion, output)
      expect(res.passed).toBe(true)
      expect(res.confidence).toBeGreaterThanOrEqual(0.4)
    })

    it("returns false for empty or non-matching outputs", () => {
      expect(evaluateAssertion("Checks for product-marketing.md", "").passed).toBe(false)
      expect(
        evaluateAssertion(
          "Calculates multivariate combinations",
          "We recommend running a simple headline test on Tuesday.",
        ).passed,
      ).toBe(false)
    })
  })

  describe("evaluateSkillEval & evaluateSkillSuite", () => {
    it("evaluates a single eval item against its expected output with high score", () => {
      const mockEval: SkillEval = {
        id: 1,
        prompt: "Test prompt",
        expected_output: "Should check for product-marketing.md and define primary metric signup rate.",
        assertions: ["Checks for product-marketing.md", "Defines primary metric"],
      }

      const result = evaluateSkillEval("test-skill", mockEval)
      expect(result.passed).toBe(true)
      expect(result.score).toBe(1.0)
      expect(result.assertionResults).toHaveLength(2)
      expect(result.assertionResults.every((a) => a.passed)).toBe(true)
    })

    it("evaluates real skill suites from .agents/skills (e.g. ab-testing, cro, copywriting)", () => {
      const testSkills = ["ab-testing", "cro", "copywriting", "pricing", "seo-audit"]

      for (const skillName of testSkills) {
        const { metadata } = validateSkill(skillName, skillsDir)
        expect(metadata?.evalSuite).toBeDefined()

        if (metadata?.evalSuite) {
          const summary = evaluateSkillSuite(metadata.evalSuite)
          expect(summary.skillName).toBe(skillName)
          expect(summary.totalEvals).toBeGreaterThan(0)
          expect(summary.averageScore).toBeGreaterThanOrEqual(0.80)
          expect(summary.passedEvals).toBeGreaterThanOrEqual(Math.floor(summary.totalEvals * 0.7))
        }
      }
    })
  })
})
