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

export function isDataLoaded() {
  return dataCache !== null
}

export function getLoadError() {
  return loadError
}

export function clearCache() {
  dataCache = null
  loadError = null
}

/** 获取基础设置 */
export function getSettings() {
  if (!dataCache || !dataCache.settings) return {}
  const settings = {}
  dataCache.settings.forEach(item => {
    settings[item.键名] = item.键值
  })
  return settings
}

/** 获取首页通知 */
export function getHomeNotices() {
  if (!dataCache || !dataCache.homeNotices) return []
  return dataCache.homeNotices
    .filter(item => item.是否启用 !== '否')
    .sort((a, b) => (a.排序 || 0) - (b.排序 || 0))
}

/**
 * 获取某个品规在指定档位的数量
 * @param {Object} product 品规对象（含档位数量映射）
 * @param {number} tier 档位 1-30
 * @returns {number|null}
 */
export function getTierQuantity(product, tier) {
  const map = product.档位数量 || {}
  // 精确档位优先（如 "30"）
  if (map[String(tier)] !== undefined && Number(map[String(tier)]) > 0) {
    return map[String(tier)]
  }
  // 范围匹配（如 "30-28"）
  for (const [key, val] of Object.entries(map)) {
    const m = key.match(/^(\d+)-(\d+)$/)
    if (m) {
      const hi = Number(m[1])
      const lo = Number(m[2])
      if (tier >= lo && tier <= hi && Number(val) > 0) {
        return val
      }
    }
  }
  return null
}

/**
 * 根据具体档位（1-30）获取可用品规
 * @param {number} tier 档位
 * @returns {Array}
 */
export function getPackagesByTierNumber(tier) {
  if (!dataCache || !dataCache.packages) return []
  if (!tier || tier < 1 || tier > 30) return []

  const result = []
  for (const item of dataCache.packages) {
    const qty = getTierQuantity(item, tier)
    if (qty !== null) {
      result.push({
        品牌组: item.品牌组 || '',
        类型: item.类型 || '激励品规',
        品牌: item.品牌 || '',
        品规名称: item.品规名称 || '',
        数量: qty,
        更新时间: item.更新时间 || ''
      })
    }
  }
  return result
}

/** 获取所有品牌组列表（去重排序） */
export function getBrandGroups() {
  if (!dataCache || !dataCache.packages) return []
  const groups = new Set()
  dataCache.packages.forEach(item => {
    if (item.品牌组) groups.add(item.品牌组)
  })
  return Array.from(groups)
}

/** 获取卷烟信息 */
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

export function getBrandList() {
  if (!dataCache || !dataCache.cigarettes) return []
  const brands = new Set()
  dataCache.cigarettes.forEach(item => {
    if (item.品牌) brands.add(item.品牌)
  })
  return Array.from(brands).sort()
}

/** 获取订货时间安排 */
export function getScheduleList() {
  if (!dataCache || !dataCache.schedules) return []
  return [...dataCache.schedules]
}

/** 获取直播信息 */
export function getLiveBroadcasts() {
  if (!dataCache || !dataCache.liveBroadcasts) return []
  return [...dataCache.liveBroadcasts]
}

/** 获取制度解读 */
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

/** 获取应急订单 */
export function getEmergencyOrders() {
  if (!dataCache || !dataCache.emergencyOrders) return []
  return [...dataCache.emergencyOrders]
}

/** 检测是否有进行中的应急订单 */
export function hasActiveEmergencyOrders() {
  if (!dataCache || !dataCache.emergencyOrders) return false
  return dataCache.emergencyOrders.some(o =>
    o.当前状态 === '进行中' || o.当前状态 === '待开始'
  )
}
