import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import yaml from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT_DIR = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT_DIR, 'data')
const OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'data', 'generated')

const HEADER = `// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from YAML data files by scripts/build-data.ts
// Run 'pnpm build:data' to regenerate

`

function readYamlFile(filename: string): unknown {
  const filepath = path.join(DATA_DIR, filename)
  const content = fs.readFileSync(filepath, 'utf-8')
  return yaml.load(content)
}

function writeGeneratedFile(filename: string, content: string): void {
  const filepath = path.join(OUTPUT_DIR, filename)
  fs.writeFileSync(filepath, HEADER + content, 'utf-8')
  console.log(`Generated: ${filepath}`)
}

function formatValue(value: unknown, indent: number = 0): string {
  const spaces = '  '.repeat(indent)

  if (value === null || value === undefined) {
    return 'undefined'
  }

  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "\\'")}'`
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => formatValue(v, 0)).join(', ')
    return `[${items}]`
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'

    const lines = entries.map(([k, v]) => {
      const formattedValue = formatValue(v, indent + 1)
      return `${spaces}  ${k}: ${formattedValue},`
    })

    return `{\n${lines.join('\n')}\n${spaces}}`
  }

  return String(value)
}

function generateArthropods(): void {
  const data = readYamlFile('arthropods.yaml') as Record<string, unknown>

  const entries = Object.entries(data)
    .map(([key, value]) => {
      const formatted = formatValue(value, 1)
      return `  ${key}: ${formatted},`
    })
    .join('\n')

  const content = `import type { Arthropod } from '../../types/arthropod'

export const arthropodsData: Record<string, Arthropod> = {
${entries}
}
`

  writeGeneratedFile('arthropods.gen.ts', content)
}

function generateActions(): void {
  const data = readYamlFile('actions.yaml') as Record<string, unknown>

  const entries = Object.entries(data)
    .map(([key, value]) => {
      const formatted = formatValue(value, 1)
      return `  ${key}: ${formatted},`
    })
    .join('\n')

  const content = `import type { Action } from '../../types/action'

export const actionsData: Record<string, Action> = {
${entries}
}
`

  writeGeneratedFile('actions.gen.ts', content)
}

function generateMatchup(): void {
  const data = readYamlFile('matchup.yaml') as {
    styleMatchup: Record<string, Record<string, number>>
    weaponVsArmor: Record<string, { softBonus: number; hardPenalty: number }>
  }

  const styleEntries = Object.entries(data.styleMatchup)
    .map(([key, value]) => {
      const innerEntries = Object.entries(value)
        .map(([k, v]) => `    ${k}: ${v},`)
        .join('\n')
      return `  ${key}: {\n${innerEntries}\n  },`
    })
    .join('\n')

  const weaponEntries = Object.entries(data.weaponVsArmor)
    .map(([key, value]) => {
      return `  ${key}: { softBonus: ${value.softBonus}, hardPenalty: ${value.hardPenalty} },`
    })
    .join('\n')

  const content = `import type { BehaviorStyle, WeaponType } from '../../types/arthropod'

export const STYLE_MATCHUP: Record<BehaviorStyle, Record<BehaviorStyle, number>> = {
${styleEntries}
}

export const WEAPON_VS_ARMOR: Record<
  WeaponType,
  { softBonus: number; hardPenalty: number }
> = {
${weaponEntries}
}
`

  writeGeneratedFile('matchup.gen.ts', content)
}

function main(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  console.log('Building data from YAML files...\n')

  generateArthropods()
  generateActions()
  generateMatchup()

  console.log('\nData build complete!')
}

main()
