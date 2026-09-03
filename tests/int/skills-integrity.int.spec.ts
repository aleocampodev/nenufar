import { describe, it, expect } from "vitest"
import path from "path"
import fs from "fs"
import { validateAllSkills, validateSkill, parseFrontmatter } from "@/lib/skills/validator"

describe("Skills Integrity & Schema Validation (.agents/skills)", () => {
  const skillsDir = path.join(process.cwd(), ".agents/skills")

  it("scans all 50 skills and validates zero critical schema errors", () => {
    const report = validateAllSkills(skillsDir)

    expect(report.totalSkills).toBe(50)
    expect(report.validSkills).toBe(50)
    expect(report.totalEvals).toBeGreaterThanOrEqual(330)
    expect(report.errors).toEqual([])
  })

  it("verifies product-marketing.md context file exists and has substantive content", () => {
    const pmPath = path.join(process.cwd(), ".agents/product-marketing.md")
    expect(fs.existsSync(pmPath)).toBe(true)
    const pmContent = fs.readFileSync(pmPath, "utf8")
    expect(pmContent.length).toBeGreaterThan(500)
    const normalized = pmContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    expect(normalized).toContain("nenufar")
    expect(normalized).toContain("shirley")
    expect(normalized).toContain("cartagena")
  })

  it("verifies YAML frontmatter parser edge cases", () => {
    expect(parseFrontmatter("# No frontmatter").frontmatter).toBeNull()
    expect(parseFrontmatter("---\nname: test\n---\n").frontmatter).toBeNull()
    expect(
      parseFrontmatter("---\nname: \"test-skill\"\ndescription: \"A test description\"\n---\n")
        .frontmatter,
    ).toEqual({
      name: "test-skill",
      description: "A test description",
    })
  })

  it("validates each individual skill has valid SKILL.md, evals.json, and internal references", () => {
    const dirEntries = fs.readdirSync(skillsDir, { withFileTypes: true })
    const skillDirs = dirEntries.filter((d) => d.isDirectory()).map((d) => d.name)

    expect(skillDirs.length).toBe(50)

    for (const skillName of skillDirs) {
      const { metadata, errors } = validateSkill(skillName, skillsDir)
      expect(errors, "Skill " + skillName + " should have 0 errors").toHaveLength(0)
      expect(metadata).not.toBeNull()
      expect(metadata?.name).toBe(skillName)
      expect(metadata?.frontmatter.description).toBeTruthy()
      expect(metadata?.evalSuite?.evals.length).toBeGreaterThan(0)
    }
  })
})
