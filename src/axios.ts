import axios from 'axios'
import JSONbig from 'json-bigint'

// Defines the API instance in Axios with special handling for big integers.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
  transformResponse: [
    function transform(data) {
      // Replacing the default transformResponse in axios because this uses JSON.parse and causes problems
      // with precision of big numbers.
      if (typeof data === 'string') {
        try {
          data = JSONbig.parse(data)
        } catch (e) {
          /* Ignore */
        }
      }
      return data
    }
  ]
})

export default axiosInstance
