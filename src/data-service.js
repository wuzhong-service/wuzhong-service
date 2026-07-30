/**
 * 数据服务模块
 * 负责从 JSON 文件加载数据，缓存到内存，提供查询接口
 */

// 数据缓存
let dataCache = null
let loadError = null

/**
 * 从 JSON 文件加载数据
 * @returns {Promise<Object>}
 */
export async function loadData() {
  // 如果有缓存且没有错误，直接返回
  if (dataCache && !loadError) {
    return dataCache
  }

  try {
    const dataUrl = new URL('./data/content.json', window.location.href).href
    const response = await fetch(dataUrl + '?_t=' + Date.now())
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const json = await response.json()
    dataCache = json
    loadError = null
    return json
  } catch (err) {
    loadError = err.message || '未知错误'
    console.error('数据加载失败:', err)
    throw err
  }
}

/**
 * 检查数据是否已加载
 * @returns {boolean}
 */
export function isDataLoaded() {
  return dataCache !== null
}

/**
 * 获取加载错误信息
 * @returns {string|null}
 */
export function getLoadError() {
  return loadError
}

/**
 * 清除缓存（强制重新加载）
 */
export function clearCache() {
  dataCache = null
  loadError = null
}

/**
 * 获取基础设置
 * @returns {Object}
 */
export function getSettings() {
  if (!dataCache || !dataCache.settings) return {}
  const settings = {}
  dataCache.settings.forEach(item => {
    settings[item.键名] = item.键值
  })
  return settings
}

/**
 * 获取首页通知
 * @returns {Array}
 */
export function getHomeNotices() {
  if (!dataCache || !dataCache.homeNotices) return []
  return dataCache.homeNotices
    .filter(item => item.是否启用 !== '否')
    .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
}

/**
 * 获取套餐列表
 * @param {Object} filters
 * @returns {Array}
 */
export function getPackages(filters = {}) {
  if (!dataCache || !dataCache.packages) return []
  let list = [...dataCache.packages]

  if (filters.week) {
    list = list.filter(item => String(item.周次) === String(filters.week))
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(item =>
      (item.套餐名称 || '').toLowerCase().includes(kw) ||
      (item.适用档位 || '').includes(kw) ||
      (item.包含品规 || '').includes(kw)
    )
  }

  return list
}

/**
 * 获取卷烟信息列表
 * @param {Object} filters
 * @returns {Array}
 */
export function getCigarettes(filters = {}) {
  if (!dataCache || !dataCache.cigarettes) return []
  let list = [...dataCache.cigarettes]

  if (filters.brand) {
    list = list.filter(item => (item.品牌 || '') === filters.brand)
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(item =>
      (item.品牌 || '').toLowerCase().includes(kw) ||
      (item.品规名称 || '').toLowerCase().includes(kw)
    )
  }

  return list
}

/**
 * 获取品牌列表（去重）
 * @returns {Array}
 */
export function getBrandList() {
  if (!dataCache || !dataCache.cigarettes) return []
  const brands = new Set()
  dataCache.cigarettes.forEach(item => {
    if (item.品牌) brands.add(item.品牌)
  })
  return Array.from(brands).sort()
}

/**
 * 获取日程安排
 * @param {Object} filters
 * @returns {Array}
 */
export function getSchedules(filters = {}) {
  if (!dataCache || !dataCache.schedules) return []
  let list = [...dataCache.schedules]

  if (filters.type) {
    list = list.filter(item => (item.事项类型 || '') === filters.type)
  }

  return list
}

/**
 * 获取直播信息
 * @returns {Array}
 */
export function getLiveBroadcasts() {
  if (!dataCache || !dataCache.liveBroadcasts) return []
  return [...dataCache.liveBroadcasts]
}

/**
 * 获取制度解读
 * @param {Object} filters
 * @returns {Array}
 */
export function getClassifications(filters = {}) {
  if (!dataCache || !dataCache.classifications) return []
  let list = [...dataCache.classifications]

  if (filters.category) {
    list = list.filter(item => (item.分类 || '') === filters.category)
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    list = list.filter(item =>
      (item.标题 || '').toLowerCase().includes(kw) ||
      (item.一句话解释 || '').toLowerCase().includes(kw) ||
      (item.详细内容 || '').includes(kw)
    )
  }

  return list
}

/**
 * 获取应急订单
 * @returns {Array}
 */
export function getEmergencyOrders() {
  if (!dataCache || !dataCache.emergencyOrders) return []
  return [...dataCache.emergencyOrders]
}
