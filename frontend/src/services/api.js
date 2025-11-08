import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

let currentAccessToken = null;
let refreshHandler;
let refreshPromise = null;
let notifier;

api.interceptors.request.use(function (config) {
  if (currentAccessToken) {
    config.headers.Authorization = 'Bearer ' + currentAccessToken;
  }
  return config;
});

api.interceptors.response.use(
  function (response) { return response; },
  async function (error) {
    if (!error || !error.config) return Promise.reject(error);
    var status = error.response && error.response.status;
    var url = error.config.url || '';
    if (status === 403 && typeof notifier === 'function') {
      notifier('error', 'Permission denied');
    }
    if (url.indexOf('/auth/refresh') !== -1 || url.indexOf('/auth/login') !== -1) {
      return Promise.reject(error);
    }
    if (status !== 401 || !refreshHandler || error.config._retry) {
      return Promise.reject(error);
    }
    error.config._retry = true;
    try {
      const token = await queueRefresh();
      if (token) {
        error.config.headers.Authorization = 'Bearer ' + token;
        return api(error.config);
      }
    } catch (_) {
      // ignore, let original error bubble
    }
    return Promise.reject(error);
  }
);

function queueRefresh() {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve()
      .then(function () { return refreshHandler(); })
      .finally(function () { refreshPromise = null; });
  }
  return refreshPromise;
}

export function setAccessToken(token) {
  currentAccessToken = token || null;
}

export function registerRefresh(handler) {
  refreshHandler = handler;
}

export function registerNotifier(handler) {
  notifier = handler;
}

export function getAccessToken() {
  return currentAccessToken;
}

export default api;
