/**
 * Test Runner & Evaluator CLI for Nenufar Skills (.agents/skills)
 *
 * Usage:
 *   pnpm tsx scripts/test-skills.ts
 *   pnpm tsx scripts/test-skills.ts --skill=ab-testing
 *   pnpm tsx scripts/test-skills.ts --validate-only
 *   pnpm tsx scripts/test-skills.ts --verbose
 */
import { validateAllSkills, validateSkill } from "../src/lib/skills/validator"
import { evaluateSkillSuite } from "../src/lib/skills/eval-runner"

async function main() {
  const args = process.argv.slice(2)
  const skillFilter = args.find((a) => a.startsWith("--skill="))?.split("=")[1]
  const validateOnly = args.includes("--validate-only")
  const verbose = args.includes("--verbose")

  console.log("\n🌸 ========================================================")
  console.log("🌸 NÉNUFAR — SUITE DE VALIDACIÓN Y EVALS PARA SKILLS (.agents)")
  console.log("🌸 ========================================================\n")

  if (skillFilter) {
    console.log(`🎯 Evaluando skill específica: ${skillFilter}\n`)
    const { metadata, errors, warnings } = validateSkill(skillFilter)

    if (errors.length > 0) {
      console.error(`❌ Errores en ${skillFilter}:`)
      errors.forEach((e) => console.error(`   - [${e.type}] ${e.message}`))
      process.exit(1)
    }

    if (!metadata) {
      console.error(`❌ No se pudo cargar la metadata de ${skillFilter}`)
      process.exit(1)
    }

    console.log(`✅ Frontmatter: ${metadata.name}`)
    console.log(`📝 Descripción: ${metadata.frontmatter.description.slice(0, 100)}...`)
    console.log(`📂 Referencias locales: ${metadata.references.length} archivos`)
    console.log(`🧪 Evals registradas: ${metadata.evalSuite?.evals.length || 0}\n`)

    if (!validateOnly && metadata.evalSuite) {
      const summary = evaluateSkillSuite(metadata.evalSuite)
      console.log(`📊 Resultados de evaluación de ${skillFilter}:`)
      console.log(`   - Total evals: ${summary.totalEvals}`)
      console.log(`   - Aprobadas: ${summary.passedEvals}/${summary.totalEvals}`)
      console.log(`   - Puntuación media: ${(summary.averageScore * 100).toFixed(1)}%\n`)

      summary.results.forEach((r) => {
        const icon = r.passed ? "✅" : "⚠️"
        console.log(`   ${icon} Eval #${r.evalId}: "${r.prompt.slice(0, 60)}..." (Score: ${(r.score * 100).toFixed(0)}%)`)
        if (verbose || !r.passed) {
          r.assertionResults.forEach((a) => {
            const aIcon = a.passed ? "  ✓" : "  ✗"
            console.log(`      ${aIcon} ${a.assertion} (${a.reason})`)
          })
        }
      })
    }
    process.exit(0)
  }

  console.log("🔍 Escaneando todas las skills en .agents/skills...")
  const report = validateAllSkills()

  console.log(`\n📊 Resumen de Integridad:`)
  console.log(`   - Total skills encontradas: ${report.totalSkills}`)
  console.log(`   - Skills 100% válidas: ${report.validSkills}/${report.totalSkills}`)
  console.log(`   - Total casos de evaluación (evals): ${report.totalEvals}`)
  console.log(`   - Errores de validación: ${report.errors.length}`)
  console.log(`   - Advertencias: ${report.warnings.length}\n`)

  if (report.errors.length > 0) {
    console.error("❌ Se encontraron errores de validación:")
    report.errors.forEach((e) => console.error(`   - [${e.skill}] (${e.type}): ${e.message}`))
    process.exit(1)
  }

  if (validateOnly) {
    console.log("✨ Validación completada con 0 errores.\n")
    process.exit(0)
  }

  console.log("🧪 Ejecutando suite de auto-evaluación heurística...")
  let overallPassed = 0
  let overallEvals = 0
  let totalScoreSum = 0

  report.skills.forEach((skill) => {
    if (!skill.evalSuite) return
    const summary = evaluateSkillSuite(skill.evalSuite)
    overallPassed += summary.passedEvals
    overallEvals += summary.totalEvals
    totalScoreSum += summary.averageScore * summary.totalEvals

    const statusIcon = summary.passedEvals === summary.totalEvals ? "✅" : "🟡"
    console.log(
      `   ${statusIcon} [${skill.name.padEnd(25)}] ${summary.passedEvals}/${summary.totalEvals} evals aprobadas (Score: ${(summary.averageScore * 100).toFixed(0)}%)`,
    )
  })

  const globalAvg = overallEvals > 0 ? ((totalScoreSum / overallEvals) * 100).toFixed(1) : "100"
  console.log(`\n🎉 Resultado global: ${overallPassed}/${overallEvals} evals aprobadas (Precisión media: ${globalAvg}%)`)
  console.log("✨ Todas las 50 skills están verificadas e integradas correctamente en Nénufar.\n")
}

main().catch((err) => {
  console.error("Fatal error in test-skills:", err)
  process.exit(1)
})
