class Base {
  constructor () {
    this.initialized = false
    this.init()
  }

  init () {
    let storedUser = this.getStoredUser()
    if (storedUser !== null) {
      this.setUser(storedUser, false)
    } else {
      switch (process.env.VUE_APP_SECURITY_TYPE) {
        case 'public-read-write':
          this.setUser({
            username: 'editor-anonymous',
            role: 'editor',
            token: process.env.VUE_APP_GLOBAL_AUTH_TOKEN
          })
          break
        case 'public-read':
          this.setUser({
            username: 'viewer-anonymous',
            role: 'viewer',
            token: process.env.VUE_APP_GLOBAL_AUTH_TOKEN
          })
          break
        default:
          // private
          this.setUser(null, false)
      }
    }
    this.initialized = true
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
