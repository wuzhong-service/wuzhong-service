/**
 * 服务入口页面
 * 目前仅保留分档制度解读作为入口
 * 其他功能直接通过首页导航进入
 */

import { navigate } from '../router.js'

/**
 * 渲染服务入口
 * @param {Object} data
 */
export function renderService(data) {
  // 直接跳转到分档解读
  navigate('classification')
}
