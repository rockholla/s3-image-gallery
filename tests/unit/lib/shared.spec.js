import shared from '@/../lib/shared.js'
import path from 'path'

describe('lib/shared.js', () => {
  it('createStream returns a stream for a string', () => {
    expect(typeof shared.createStream('random', 'string')).toBe('object')
  })
  it('createStream returns a stream for a path', () => {
    expect(typeof shared.createStream(path.resolve(__dirname, 'shared.spec.js'), 'path')).toBe('object')
  })
  it('createStream should fail for invalid type', () => {
    expect(() => { shared.createStream('random', 'invalid-type') }).toThrow()
  })
})
