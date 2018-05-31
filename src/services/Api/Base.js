class Base {
  constructor (securityType, globalAuthToken) {
    this.securityType = securityType
    this.globalAuthToken = globalAuthToken
    this.init()
  }

  init () {
    let storedUser = this.getStoredUser()
    if (storedUser !== null) {
      this.setUser(storedUser, false)
    } else {
      switch (this.securityType) {
        case 'public-read-write':
          this.setUser({
            username: 'editor-anonymous',
            role: 'editor',
            token: this.globalAuthToken
          })
          break
        case 'public-read':
          this.setUser({
            username: 'viewer-anonymous',
            role: 'viewer',
            token: this.globalAuthToken
          })
          break
        default:
          // private
          this.setUser(null, false)
      }
    }
  }

  getStoredUser () {
    return window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')) : null
  }

  setUser (user, updateStored = true) {
    if (updateStored) window.localStorage.setItem('user', JSON.stringify(user))
    this.user = user
  }
}

export default Base
