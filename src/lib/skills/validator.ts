import fs from "fs"
import path from "path"
import type {
  SkillFrontmatter,
  SkillMetadata,
  SkillValidationError,
  SkillValidationReport,
  SkillEvalSuite,
} from "./types"

export function parseFrontmatter(markdown: string): { frontmatter: SkillFrontmatter | null; error?: string } {
  if (!markdown.startsWith("---")) {
    return { frontmatter: null, error: "Document does not start with YAML frontmatter delimiter (---)" }
  }

  const endIdx = markdown.indexOf("---", 3)
  if (endIdx === -1) {
    return { frontmatter: null, error: "Unclosed YAML frontmatter delimiter" }
  }

  const rawYaml = markdown.slice(3, endIdx).trim()
  const lines = rawYaml.split(/\r?\n/)
  const result: Record<string, string> = {}

  for (const line of lines) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let val = line.slice(colonIdx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    result[key] = val
  }

  if (!result.name) {
    return { frontmatter: null, error: "Frontmatter missing required field \"name\"" }
  }
  if (!result.description) {
    return { frontmatter: null, error: "Frontmatter missing required field \"description\"" }
  }

  return {
    frontmatter: {
      name: result.name,
      description: result.description,
      ...result,
    },
  }
}

export function validateSkill(dirName: string, skillsBaseDir?: string): { metadata: SkillMetadata | null; errors: SkillValidationError[]; warnings: SkillValidationError[] } {
  const baseDir = skillsBaseDir || path.join(process.cwd(), ".agents/skills")
  const skillDir = path.join(baseDir, dirName)
  const errors: SkillValidationError[] = []
  const warnings: SkillValidationError[] = []

  if (!fs.existsSync(skillDir) || !fs.statSync(skillDir).isDirectory()) {
    return {
      metadata: null,
      errors: [{ skill: dirName, type: "system", message: "Skill directory " + skillDir + " does not exist" }],
      warnings: [],
    }
  }

  const skillMdPath = path.join(skillDir, "SKILL.md")
  if (!fs.existsSync(skillMdPath)) {
    return {
      metadata: null,
      errors: [{ skill: dirName, type: "frontmatter", message: "Missing SKILL.md" }],
      warnings: [],
    }
  }

  const skillMdContent = fs.readFileSync(skillMdPath, "utf8")
  const { frontmatter, error: frontmatterError } = parseFrontmatter(skillMdContent)

  if (frontmatterError || !frontmatter) {
    errors.push({
      skill: dirName,
      type: "frontmatter",
      message: frontmatterError || "Invalid frontmatter",
      file: skillMdPath,
    })
  } else if (frontmatter.name !== dirName) {
    errors.push({
      skill: dirName,
      type: "frontmatter",
      message: "Frontmatter name \"" + frontmatter.name + "\" does not match directory name \"" + dirName + "\"",
      file: skillMdPath,
    })
  }

  const referencesDir = path.join(skillDir, "references")
  const references: string[] = []
  const hasReferences = fs.existsSync(referencesDir) && fs.statSync(referencesDir).isDirectory()

  if (hasReferences) {
    const files = fs.readdirSync(referencesDir)
    references.push(...files.map((f) => path.join("references", f)))
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(skillMdContent)) !== null) {
    const rawLink = match[2]
    if (rawLink.startsWith("http://") || rawLink.startsWith("https://") || rawLink.startsWith("#")) {
      continue
    }
    const cleanLink = rawLink.split("#")[0]
    if (!cleanLink) continue

    if (cleanLink.startsWith("references/") || cleanLink.startsWith("./references/") || cleanLink.startsWith("assets/") || cleanLink.startsWith("./assets/")) {
      const resolved = path.resolve(skillDir, cleanLink)
      if (!fs.existsSync(resolved)) {
        errors.push({
          skill: dirName,
          type: "link",
          message: "Broken internal link \"" + rawLink + "\" in SKILL.md",
          file: skillMdPath,
        })
      }
    }
  }

  const evalsPath = path.join(skillDir, "evals/evals.json")
  const hasEvals = fs.existsSync(evalsPath)
  let evalSuite: SkillEvalSuite | undefined

  if (!hasEvals) {
    errors.push({
      skill: dirName,
      type: "evals",
      message: "Missing evals/evals.json file",
      file: evalsPath,
    })
  } else {
    try {
      const evalsRaw = fs.readFileSync(evalsPath, "utf8")
      const parsed = JSON.parse(evalsRaw) as SkillEvalSuite
      evalSuite = parsed

      if (parsed.skill_name !== dirName) {
        errors.push({
          skill: dirName,
          type: "evals",
          message: "evals.json skill_name \"" + parsed.skill_name + "\" does not match directory \"" + dirName + "\"",
          file: evalsPath,
        })
      }

      if (!Array.isArray(parsed.evals) || parsed.evals.length === 0) {
        errors.push({
          skill: dirName,
          type: "evals",
          message: "evals array is missing or empty in evals.json",
          file: evalsPath,
        })
      } else {
        const seenIds = new Set<number>()
        parsed.evals.forEach((ev, idx) => {
          if (typeof ev.id !== "number" || isNaN(ev.id)) {
            errors.push({
              skill: dirName,
              type: "evals",
              message: "Eval index " + idx + " has invalid id: " + ev.id,
              file: evalsPath,
            })
          } else if (seenIds.has(ev.id)) {
            errors.push({
              skill: dirName,
              type: "evals",
              message: "Duplicate eval id " + ev.id + " at index " + idx,
              file: evalsPath,
            })
          } else {
            seenIds.add(ev.id)
          }

          if (!ev.prompt || typeof ev.prompt !== "string" || ev.prompt.trim() === "") {
            errors.push({
              skill: dirName,
              type: "evals",
              message: "Eval id " + ev.id + " is missing a non-empty prompt",
              file: evalsPath,
            })
          }

          if (!ev.expected_output || typeof ev.expected_output !== "string" || ev.expected_output.trim() === "") {
            errors.push({
              skill: dirName,
              type: "evals",
              message: "Eval id " + ev.id + " is missing a non-empty expected_output",
              file: evalsPath,
            })
          }

          if (!Array.isArray(ev.assertions) || ev.assertions.length === 0) {
            errors.push({
              skill: dirName,
              type: "evals",
              message: "Eval id " + ev.id + " must have at least one assertion in assertions array",
              file: evalsPath,
            })
          } else {
            ev.assertions.forEach((as, asIdx) => {
              if (!as || typeof as !== "string" || as.trim() === "") {
                errors.push({
                  skill: dirName,
                  type: "evals",
                  message: "Eval id " + ev.id + " assertion at index " + asIdx + " is empty",
                  file: evalsPath,
                })
              }
            })
          }
        })
      }
    } catch (e: any) {
      errors.push({
        skill: dirName,
        type: "evals",
        message: "Failed to parse JSON in evals.json: " + e.message,
        file: evalsPath,
      })
    }
  }

  const metadata: SkillMetadata | null = frontmatter
    ? {
        name: frontmatter.name,
        dirName,
        dirPath: skillDir,
        skillMdPath,
        frontmatter,
        references,
        evalSuite,
        hasReferences,
        hasEvals,
      }
    : null

  return { metadata, errors, warnings }
}

export function validateAllSkills(skillsBaseDir?: string): SkillValidationReport {
  const baseDir = skillsBaseDir || path.join(process.cwd(), ".agents/skills")
  const report: SkillValidationReport = {
    totalSkills: 0,
    validSkills: 0,
    totalEvals: 0,
    errors: [],
    warnings: [],
    skills: [],
  }

  if (!fs.existsSync(baseDir)) {
    report.errors.push({
      skill: "root",
      type: "system",
      message: "Skills directory " + baseDir + " not found",
    })
    return report
  }

  const dirEntries = fs.readdirSync(baseDir, { withFileTypes: true })
  const skillDirs = dirEntries.filter((d) => d.isDirectory()).map((d) => d.name)

  report.totalSkills = skillDirs.length

  for (const dirName of skillDirs) {
    const { metadata, errors, warnings } = validateSkill(dirName, baseDir)
    report.errors.push(...errors)
    report.warnings.push(...warnings)

    if (metadata) {
      report.skills.push(metadata)
      if (errors.length === 0) {
        report.validSkills++
      }
      if (metadata.evalSuite?.evals) {
        report.totalEvals += metadata.evalSuite.evals.length
      }
    }
  }

  return report
}
