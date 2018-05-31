import Base from '@/services/Api/Base.js'

describe('services/Api/Base', () => {
  it('getStoredUser returns null in default state', () => {
    let api = new Base()
    expect(api.getStoredUser()).toEqual(null)
  })
})
