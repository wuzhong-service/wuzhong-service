/**
 * 订货时间安排模块
 * 展示批次、订货日期、送货日期
 */

import { formatDate, escapeHtml } from '../utils.js'
import { getScheduleList } from '../data-service.js'
import { navigate } from '../router.js'

/**
 * 渲染订货时间安排页面
 * @param {Object} data
 */
export function renderCalendar(data) {
  const app = document.getElementById('app')
  const schedules = getScheduleList()

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📅 订货时间安排</div>
    </div>

    <div class="page active">
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      ${schedules.length > 0 ? `
        <!-- 列表视图 -->
        <div style="margin-bottom: 12px;">
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            background: var(--color-primary);
            color: #fff;
            padding: 10px 12px;
            border-radius: 8px 8px 0 0;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
          ">
            <div>批次</div>
            <div>订货日期</div>
            <div>送货日期</div>
          </div>

          ${schedules.map((s, idx) => `
            <div style="
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              padding: 14px 12px;
              background: ${idx % 2 === 0 ? '#fff' : '#f9f9f9'};
              border-bottom: 1px solid #eee;
              font-size: 15px;
              text-align: center;
              align-items: center;
            ">
              <div style="font-weight: 600; color: var(--color-primary);">${escapeHtml(s.批次 || '—')}</div>
              <div>${s.订货日期 ? formatDate(s.订货日期) : '—'}</div>
              <div>${s.送货日期 ? formatDate(s.送货日期) : '—'}</div>
            </div>
          `).join('')}
        </div>

        ${schedules[0]?.备注 ? `
          <div style="font-size: 13px; color: #999; padding: 8px 0;">
            📌 ${escapeHtml(schedules[0].备注)}
          </div>
        ` : ''}
      ` : `
        <div class="empty-state">
          <div class="empty-state-icon">📅</div>
          <p>暂无订货时间安排</p>
        </div>
      `}

      <div class="footer-notice">
        <p>具体订货日期以正式通知为准</p>
      </div>
    </div>
  `
}
