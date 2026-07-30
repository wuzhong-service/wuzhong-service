/**
 * 工具函数模块
 * 提供日期格式化、货币显示、防抖等通用功能
 */

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date)
  if (isNaN(d.getTime())) return String(date).trim()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取中文字符串表示的星期
 * @param {string|Date} date
 * @returns {string}
 */
export function getWeekDay(date) {
  const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const d = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date)
  return days[d.getDay()]
}

/**
 * 获取今天日期字符串 YYYY-MM-DD
 * @returns {string}
 */
export function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 获取当前周次（按ISO周计算）
 * @returns {number}
 */
export function getWeekNumber() {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const diff = now - startOfYear
  const oneWeek = 604800000
  const week = Math.ceil((diff / oneWeek) + startOfYear.getDay() / 7)
  return week
}

/**
 * 格式化金额为人民币格式
 * @param {number|string} price
 * @returns {string}
 */
export function formatPrice(price) {
  if (price === undefined || price === null || price === '') return '—'
  const num = Number(price)
  if (isNaN(num)) return String(price)
  return '¥' + num.toFixed(2)
}

/**
 * 比较日期字符串大小
 * @param {string} dateStr1 YYYY-MM-DD
 * @param {string} dateStr2 YYYY-MM-DD
 * @returns {number} -1: date1<date2, 0:相等, 1:date1>date2
 */
export function compareDate(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return 0
  const d1 = new Date(dateStr1.replace(/-/g, '/'))
  const d2 = new Date(dateStr2.replace(/-/g, '/'))
  if (d1 < d2) return -1
  if (d1 > d2) return 1
  return 0
}

/**
 * 判断日期是否在今天之前
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isBeforeToday(dateStr) {
  return compareDate(dateStr, getToday()) < 0
}

/**
 * 判断日期是否在今天之后
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isAfterToday(dateStr) {
  return compareDate(dateStr, getToday()) > 0
}

/**
 * 判断日期是否是今天
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isToday(dateStr) {
  return compareDate(dateStr, getToday()) === 0
}

/**
 * 获取 N 天后的日期
 * @param {number} days
 * @returns {string}
 */
export function getFutureDate(days) {
  const now = new Date()
  now.setDate(now.getDate() + days)
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 简单防抖
 * @param {Function} fn
 * @param {number} delay 毫秒
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 安全打开外部链接，先提示用户
 * @param {string} url
 */
export function openExternalLink(url) {
  if (!url) return
  if (confirm('您即将打开外部链接，请确认链接来源可靠。\n\n' + url)) {
    window.open(url, '_blank')
  }
}

/**
 * 转义 HTML 防止 XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (!str) return ''
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}

/**
 * 判断套餐是否过期
 * @param {string} endDate 订购结束日期
 * @returns {string} 'expired' | 'active' | 'upcoming'
 */
export function getPackageStatus(endDate) {
  if (!endDate) return 'active'
  if (isBeforeToday(endDate)) return 'expired'
  if (isToday(endDate)) return 'active'
  return 'active'
}
