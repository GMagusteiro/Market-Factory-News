import test from 'node:test'
import assert from 'node:assert/strict'
import { cleanName, toAssets } from './index'

test('cleanName tira sufixos legais e guarda o nome legal como alias', () => {
  assert.deepEqual(cleanName('NVIDIA CORP'), { name: 'Nvidia', alias: 'Nvidia Corp' })
  assert.equal(cleanName('Apple Inc.').name, 'Apple')
  assert.equal(cleanName('Microsoft Corp').name, 'Microsoft')
  assert.equal(cleanName('JPMORGAN CHASE & CO').name, 'Jpmorgan Chase &')
  assert.equal(cleanName('AMD').name, 'AMD')
})

test('toAssets respeita a ordem e o limite, ignora símbolos inválidos/repetidos e guarda o CIK', () => {
  const data = {
    '1': { cik_str: 1045810, ticker: 'NVDA', title: 'NVIDIA CORP' },
    '0': { cik_str: 320193, ticker: 'AAPL', title: 'Apple Inc.' },
    '2': { cik_str: 1067983, ticker: 'BRK-B', title: 'BERKSHIRE HATHAWAY INC' },
    '3': { cik_str: 1, ticker: 'nvda', title: 'DUP' },
    '4': { cik_str: 2, ticker: '', title: 'SEM SIMBOLO' },
    '5': { cik_str: 3, ticker: 'X Y', title: 'INVALIDO' },
  }
  const all = toAssets(data, 10)
  assert.deepEqual(all.map((a) => a.symbol), ['AAPL', 'NVDA', 'BRK-B'])
  assert.equal(all[0].cik, '320193')
  assert.equal(all[2].slug, 'brk-b')
  assert.equal(toAssets(data, 2).length, 2)
})
