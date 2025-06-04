import axios, { AxiosRequestConfig } from 'axios'
import { AuthenticateParams } from 'constants/enums/auth'
import { debounce } from 'lodash'
import qs from 'qs'
import { toast } from 'react-toastify'

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
      Accept: 'application/json;charset=UTF-8',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    },
    paramsSerializer: params => qs.stringify(params)
  })
  
  export const api = axiosInstance

function handleUnauthorized() {
  alert('Unauthorized! Please try again or contact support.')
  const rootURL = window?.location?.origin ?? `${window.location.protocol}//${process.env.REACT_APP_BASE_PATH}/`
  window.location.replace(rootURL)
}

const handleUnauthorizedWithDebounce = debounce(handleUnauthorized, 500)

api.interceptors.request.use(function (config: any) {
  const token = localStorage.getItem(AuthenticateParams.ACCESS_TOKEN)
  if (token && !config.headers.Authorization) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
  }
  return config
})

api.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    console.error(error);
    if (
      error?.message?.includes('401') ||
      (error?.config?.url === '/users/me' && error?.config?.url !== '/auth/login')
    ) {
      handleUnauthorizedWithDebounce()
    }
    return Promise.reject(error)
  }
)

export function handleError(
  error: Error,
  filePath: string,
  functionName: string,
  keepThrowing: boolean = true,
  showToast: boolean = false,
  group: string = ''
) {
  const errorPath = `Error: ${filePath} -> ${functionName} -> error: ${error}`
  console.error(errorPath, JSON.stringify(error))

  if (showToast) {
    toast.error(error.message)
  }
  if (keepThrowing) {
    throw error
  }
}
