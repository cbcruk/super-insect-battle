import {
  printHeader,
  printMainMenu,
  question,
  closeMenu,
  clearScreen,
  selectArthropod,
  printArthropodDetails,
  printArthropodList,
} from './ui/menu.js'
import { renderBattle, renderStatistics } from './ui/renderer.js'
import { runBattle, runMultipleBattles } from './simulation/battle-runner.js'
import { arthropodList } from '@super-insect-battle/engine'

async function handleBattle(): Promise<void> {
  console.log('\n첫 번째 절지동물을 선택하세요:')
  const arthropod1 = await selectArthropod('선택: ')

  if (!arthropod1) {
    console.log('잘못된 선택입니다.')
    return
  }

  console.log('\n두 번째 절지동물을 선택하세요:')
  const arthropod2 = await selectArthropod('선택: ')

  if (!arthropod2) {
    console.log('잘못된 선택입니다.')
    return
  }

  console.log('\n배틀을 시작합니다...\n')
  const result = runBattle(arthropod1, arthropod2)
  await renderBattle(result)

  await question('계속하려면 Enter를 누르세요...')
}

async function handleEncyclopedia(): Promise<void> {
  while (true) {
    clearScreen()
    printArthropodList()
    console.log('[0] 돌아가기\n')

    const input = await question('상세 정보를 볼 절지동물을 선택하세요: ')
    const index = parseInt(input, 10) - 1

    if (input === '0') {
      return
    }

    if (index >= 0 && index < arthropodList.length) {
      printArthropodDetails(arthropodList[index])
      await question('\n계속하려면 Enter를 누르세요...')
    }
  }
}

async function handleStatistics(): Promise<void> {
  console.log('\n첫 번째 절지동물을 선택하세요:')
  const arthropod1 = await selectArthropod('선택: ')

  if (!arthropod1) {
    console.log('잘못된 선택입니다.')
    return
  }

  console.log('\n두 번째 절지동물을 선택하세요:')
  const arthropod2 = await selectArthropod('선택: ')

  if (!arthropod2) {
    console.log('잘못된 선택입니다.')
    return
  }

  const countInput = await question('시뮬레이션 횟수 (기본값 100): ')
  const count = parseInt(countInput, 10) || 100

  console.log(`\n${count}회 시뮬레이션 중...`)

  const stats = runMultipleBattles(arthropod1, arthropod2, count)
  renderStatistics(arthropod1.nameKo, arthropod2.nameKo, stats, count)

  await question('계속하려면 Enter를 누르세요...')
}

async function main(): Promise<void> {
  while (true) {
    clearScreen()
    printHeader()
    printMainMenu()

    const choice = await question('선택: ')

    switch (choice) {
      case '1':
        await handleBattle()
        break
      case '2':
        await handleEncyclopedia()
        break
      case '3':
        await handleStatistics()
        break
      case '0':
        console.log('\n게임을 종료합니다.\n')
        closeMenu()
        process.exit(0)
      default:
        console.log('잘못된 선택입니다.')
        await question('계속하려면 Enter를 누르세요...')
    }
  }
}

main().catch(console.error)
