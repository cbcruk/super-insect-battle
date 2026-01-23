import * as readline from 'readline'
import chalk from 'chalk'
import type { Arthropod } from '@super-insect-battle/engine'
import { arthropodList } from '@super-insect-battle/engine'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

export function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer)
    })
  })
}

export function closeMenu(): void {
  rl.close()
}

export function clearScreen(): void {
  console.clear()
}

export function printHeader(): void {
  console.log(chalk.yellow.bold('\n╔══════════════════════════════════════╗'))
  console.log(chalk.yellow.bold('║      슈퍼곤충대전 시뮬레이터        ║'))
  console.log(chalk.yellow.bold('╚══════════════════════════════════════╝\n'))
}

export function printMainMenu(): void {
  console.log(chalk.cyan('[1]') + ' 배틀 시작')
  console.log(chalk.cyan('[2]') + ' 도감')
  console.log(chalk.cyan('[3]') + ' 통계 시뮬레이션')
  console.log(chalk.cyan('[0]') + ' 종료\n')
}

export function printArthropodList(): void {
  console.log(chalk.yellow('\n=== 절지동물 목록 ===\n'))
  arthropodList.forEach((arthropod: Arthropod, index: number) => {
    const style = getStyleColor(arthropod.behavior.style)
    console.log(
      chalk.cyan(`[${index + 1}]`) +
        ` ${arthropod.nameKo} (${arthropod.name}) - ` +
        style(arthropod.behavior.style)
    )
  })
  console.log()
}

function getStyleColor(style: string): (text: string) => string {
  switch (style) {
    case 'grappler':
      return chalk.red
    case 'striker':
      return chalk.green
    case 'venomous':
      return chalk.magenta
    case 'defensive':
      return chalk.blue
    default:
      return chalk.white
  }
}

export async function selectArthropod(
  prompt: string
): Promise<Arthropod | null> {
  printArthropodList()
  const input = await question(prompt)
  const index = parseInt(input, 10) - 1

  if (index >= 0 && index < arthropodList.length) {
    return arthropodList[index]
  }

  return null
}

export function printArthropodDetails(arthropod: Arthropod): void {
  const style = getStyleColor(arthropod.behavior.style)

  console.log(chalk.yellow(`\n=== ${arthropod.nameKo} ===`))
  console.log(chalk.gray(arthropod.name))
  console.log()
  console.log(arthropod.description)
  console.log()
  console.log(chalk.cyan('물리적 특성:'))
  console.log(`  체중: ${arthropod.physical.weightG}g`)
  console.log(`  체장: ${arthropod.physical.lengthMm}mm`)
  console.log(`  힘 지수: ${arthropod.physical.strengthIndex}`)
  console.log()
  console.log(chalk.cyan('무기:'))
  console.log(`  타입: ${arthropod.weapon.type}`)
  console.log(`  위력: ${arthropod.weapon.power}`)
  console.log(`  독: ${arthropod.weapon.venomous ? '있음' : '없음'}`)
  if (arthropod.weapon.venomPotency) {
    console.log(`  독 강도: ${arthropod.weapon.venomPotency}`)
  }
  console.log()
  console.log(chalk.cyan('행동:'))
  console.log(`  공격성: ${arthropod.behavior.aggression}`)
  console.log(`  스타일: ` + style(arthropod.behavior.style))
  console.log()
  console.log(chalk.cyan('방어:'))
  console.log(`  갑각 강도: ${arthropod.defense.armorRating}`)
  console.log(`  회피력: ${arthropod.defense.evasion}`)
  console.log()
}
