/**
 * 简单哈希路由模块
 * 基于 URL hash 实现 SPA 路由
 */

// 路由表
const routes = {}
// 当前路由
let currentRoute = null
// 路由变化回调
let onRouteChange = null

/**
 * 注册路由
 * @param {string} path 路由路径（不带 #）
 * @param {Function} handler 路由处理函数，接收 (params, query) 参数
 */
export function registerRoute(path, handler) {
  routes[path] = handler
}

/**
 * 设置路由变化回调
 * @param {Function} callback
 */
export function setRouteChangeCallback(callback) {
  onRouteChange = callback
}

/**
 * 解析当前 hash 为路由路径和参数
 * @returns {{ path: string, params: Object, query: Object }}
 */
function parseHash() {
  const hash = window.location.hash || '#home'
  const [pathPart, queryPart] = hash.slice(1).split('?')
  const path = pathPart || 'home'

  // 解析查询参数
  const query = {}
  if (queryPart) {
    queryPart.split('&').forEach(pair => {
      const [key, value] = pair.split('=')
      query[decodeURIComponent(key)] = decodeURIComponent(value || '')
    })
  }

  return { path, query }
}

/**
 * 导航到指定路由
 * @param {string} path
 * @param {Object} query 可选查询参数
 */
export function navigate(path, query = {}) {
  const queryStr = Object.keys(query).length
    ? '?' + Object.entries(query).map(([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : ''
  window.location.hash = '#' + path + queryStr
}

/**
 * 处理路由变化
 */
function handleRouteChange() {
  const { path, query } = parseHash()
  const handler = routes[path]

  if (handler) {
    if (onRouteChange) {
      onRouteChange(path)
    }
    currentRoute = path
    handler(path, query)
  } else {
    // 路由不存在，跳转首页
    navigate('home')
  }
}

/**
 * 初始化路由
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRouteChange)
  // 初始加载
  handleRouteChange()
}

/**
 * 获取当前路由
 * @returns {string|null}
 */
export function getCurrentRoute() {
  return currentRoute
}

/**
 * 获取上一个路由（通过简单跟踪）
 */
let prevRoute = null

// 重写 onRouteChange 以跟踪上一个路由
const origCallback = onRouteChange
export function getPrevRoute() {
  return prevRoute
}
