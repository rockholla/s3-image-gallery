import Base from './Base'

class Mock extends Base {
  constructor (securityType, globalAuthToken) {
    super(securityType, globalAuthToken)
    this.validToken = process.env.VUE_APP_GLOBAL_AUTH_TOKEN
    this.mockTime = 1000
  }

  isAuthenticated () {
    return this.user && this.user.token === this.validToken
  }

  upload (data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve()
      }, this.mockTime) // mock 2 second request time
    })
  }

  login (username, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password === 'password') {
          let user = {
            username: username,
            role: username,
            token: this.validToken
          }
          window.localStorage.setItem('user', JSON.stringify(user))
          this.user = user
          return resolve(user)
        }
        return reject(new Error('Error logging in'))
      }, this.mockTime) // mock request time
    })
  }

  logout () {
    return new Promise((resolve, reject) => {
      window.localStorage.removeItem('user')
      this.user = null
      return resolve()
    })
  }
}

export default Mock
