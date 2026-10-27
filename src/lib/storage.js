/** 本地存储：进度、偏好、书签都保存在本机。所有读写都做异常保护（隐私模式/配额）。 */

const PREFIX = 'ak-story:'

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function readSession(key, fallback) {
  try {
    const raw = sessionStorage.getItem(PREFIX + key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeSession(key, value) {
  try {
    sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeJSON(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* noop */
  }
}
