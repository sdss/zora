import axios from 'axios'
import JSONbig from 'json-big'

// Defines the API instance in Axios with special handling for big integers.
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 5000,
  withCredentials: true,
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
