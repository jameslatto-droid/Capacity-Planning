import { describe, expect, it } from 'vitest'
import { defaultForecastRange, generateMonthRange } from './months'

describe('generateMonthRange', () => {
  it('supports ranges beyond the current year', () => {
    expect(generateMonthRange('2026-11', '2027-02')).toEqual([
      '2026-11',
      '2026-12',
      '2027-01',
      '2027-02',
    ])
  })

  it('returns an empty range for cleared month input values', () => {
    expect(generateMonthRange('', '2027-12')).toEqual([])
    expect(generateMonthRange('2026-06', '')).toEqual([])
  })

  it('defaults the forecast range to six calendar months from the start month', () => {
    expect(defaultForecastRange(6, '2026-06')).toEqual({
      startMonth: '2026-06',
      endMonth: '2026-12',
    })
  })
})
