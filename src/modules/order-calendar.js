/**
 * 订货时间安排模块
 * 客户选择批次 → 显示该批次8月订货日期
 */

import { formatDate } from '../utils.js'
import { getScheduleList } from '../data-service.js'
import { navigate } from '../router.js'

let selectedBatch = ''

/** 核心渲染逻辑 */
function renderScheduleContent(app, schedules) {
  // 获取唯一批次
  const batches = [...new Set(schedules.map(s => s.批次).filter(b => b !== undefined && b !== ''))]
  batches.sort((a, b) => Number(a) - Number(b))

  if (!selectedBatch && batches.length > 0) {
    selectedBatch = String(batches[0])
  }

  // 筛选该批次并按日期排序
  const filtered = schedules.filter(s => String(s.批次) === selectedBatch)
  filtered.sort((a, b) => (a.订货日期 || '').localeCompare(b.订货日期 || ''))

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📅 订货时间安排</div>
    </div>

    <div class="page active">

      <!-- 标题 -->
      <div style="
        text-align: center;
        font-size: 20px;
        font-weight: 600;
        color: var(--color-primary);
        padding: 16px 0 8px;
      ">
        8月订货安排

      <!-- 批次选择 -->
      <div class="card" style="padding: 16px;">
        <div style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">
          请问你是几批次
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${batches.map(b => `
            <button class="btn ${String(selectedBatch) === String(b) ? 'btn-primary' : 'btn-outline'}"
              onclick="selectBatch('${b}')"
              style="flex: 1; min-width: 60px; padding: 12px 8px; font-size: 16px;">
              ${b}批次
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 订货日期列表 -->
      ${filtered.length > 0 ? `
        <div style="margin-top: 12px;">
          <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); padding: 6px 4px;">
            ${selectedBatch}批次 · 8月订货日期
          </div>

          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: var(--color-primary);
            color: #fff;
            padding: 10px 12px;
            border-radius: 8px 8px 0 0;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
          ">
            <div>订货日期</div>
            <div>送货日期</div>
          </div>

          ${filtered.map((s, idx) => {
            const weekDays = ['日', '一', '二', '三', '四', '五', '六']
            const d = s.订货日期 ? new Date(s.订货日期.replace(/-/g, '/')) : null
            const weekDayStr = d ? '周' + weekDays[d.getDay()] : ''
            return `
              <div style="
                display: grid;
                grid-template-columns: 1fr 1fr;
                padding: 12px;
                background: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};
                border-bottom: 1px solid #eee;
                font-size: 15px;
                text-align: center;
                align-items: center;
              ">
                <div>
                  <span style="font-weight: 500;">${formatDate(s.订货日期)}</span>
                  <span style="font-size: 12px; color: #999; margin-left: 4px;">${weekDayStr}</span>
                </div>
                <div>${formatDate(s.送货日期)}</div>
              </div>
            `
          }).join('')}
        </div>

        <div style="
          margin-top: 12px;
          padding: 12px;
          background: #fef9e7;
          border-radius: 8px;
          border-left: 4px solid var(--color-warning);
          font-size: 13px;
          color: #856404;
        ">
          💡 请务必在订货日当天完成订单提交，以免影响配送安排。
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <p>暂无该批次订货安排</p>
        </div>
      `}

      <div class="footer-notice">
        <p>具体订货日期以正式通知为准</p>
      </div>
    </div>
  `
}

export function renderCalendar(data) {
  const app = document.getElementById('app')
  const schedules = data.schedules || getScheduleList()
  renderScheduleContent(app, schedules)
}

window.selectBatch = function(batch) {
  selectedBatch = String(batch)
  const app = document.getElementById('app')
  const schedules = getScheduleList()
  renderScheduleContent(app, schedules)
}
