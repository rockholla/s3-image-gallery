import Mock from './Mock'
import Aws from './Aws'

const api = function () {
  if (process.env.NODE_ENV === 'development') {
    return new Mock()
  } else {
    return new Aws()
  }
}

export default api()
