import Mock from './Mock'
import Aws from './Aws'

const api = function () {
  console.log(process.env)
  if (process.env.NODE_ENV === 'development') {
    return new Mock(process.env.VUE_APP_SECURITY_TYPE, process.env.VUE_APP_GLOBAL_AUTH_TOKEN)
  } else {
    return new Aws(process.env.VUE_APP_SECURITY_TYPE, process.env.VUE_APP_GLOBAL_AUTH_TOKEN)
  }
}

export default api()
