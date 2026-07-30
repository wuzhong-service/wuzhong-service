/**
 * 订货日历模块
 * 展示日程安排，支持日历视图和列表视图切换，支持按事项类型筛选
 */

import { formatDate, getToday, getWeekDay, isToday, isBeforeToday, escapeHtml } from '../utils.js'
import { getSchedules } from '../data-service.js'
import { navigate } from '../router.js'

let currentView = 'list'  // 'calendar' | 'list'
let currentType = ''
let currentMonth = 0  // 从当前月份开始的偏移

/**
 * 渲染日历页面
 * @param {Object} data
 */
export function renderCalendar(data) {
  const app = document.getElementById('app')
  const schedules = data.schedules || []

  renderCalendarContent(app, schedules)
}

function renderCalendarContent(app, schedules) {
  // 按类型筛选
  const filtered = currentType ? schedules.filter(s => s.事项类型 === currentType) : schedules

  // 将来30天
  const today = new Date()
  const future30 = new Date(today)
  future30.setDate(future30.getDate() + 30)

  const futureSchedules = filtered.filter(s => {
    if (!s.日期) return false
    const d = new Date(s.日期.replace(/-/g, '/'))
    return d >= today && d <= future30
  })

  // 获取事项类型列表
  const types = [...new Set(schedules.map(s => s.事项类型).filter(Boolean))]

  // 日历数据
  const calendarDays = generateCalendarDays(today, currentMonth)
  const todayStr = getToday()

  app.innerHTML = `
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">📅 订货日历</div>
    </div>

    <div class="page active">
      <!-- 演示提示 -->
      <div class="notice-bar">
        ⚠️ 以下内容仅为系统演示，不代表实际业务安排。
      </div>

      <!-- 视图切换 -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div class="view-toggle">
          <button class="${currentView === 'calendar' ? 'active' : ''}" id="view-calendar">日历</button>
          <button class="${currentView === 'list' ? 'active' : ''}" id="view-list">列表</button>
        </div>

        <select class="filter-select" id="schedule-type-filter" style="flex: 0 0 auto;">
          <option value="">全部事项</option>
          ${types.map(t => `
            <option value="${escapeHtml(t)}" ${currentType === t ? 'selected' : ''}>${escapeHtml(t)}</option>
          `).join('')}
        </select>
      </div>

      <!-- 日历视图 -->
      <div id="calendar-view" style="display: ${currentView === 'calendar' ? 'block' : 'none'};">
        <div class="calendar-header">
          <button class="btn btn-sm btn-outline" id="calendar-prev">‹ 上月</button>
          <strong>${calendarDays.year}年${calendarDays.month}月</strong>
          <button class="btn btn-sm btn-outline" id="calendar-next">下月 ›</button>
          <button class="btn btn-sm btn-secondary" id="calendar-today">今天</button>
        </div>

        <div class="calendar-grid">
          <div class="calendar-weekday">日</div>
          <div class="calendar-weekday">一</div>
          <div class="calendar-weekday">二</div>
          <div class="calendar-weekday">三</div>
          <div class="calendar-weekday">四</div>
          <div class="calendar-weekday">五</div>
          <div class="calendar-weekday">六</div>
          ${calendarDays.days.map(d => `
            <div class="calendar-day
              ${d.hasEvent ? 'has-event' : ''}
              ${d.isToday ? 'today' : ''}
              ${d.isPast ? 'past' : ''}
            ">
              <span>${d.day}</span>
              ${d.hasEvent ? '<div class="day-dot"></div>' : ''}
            </div>
          `).join('')}
        </div>

        <!-- 当天日程 -->
        <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">
          📌 今日日程
        </div>
        ${renderDayEvents(schedules, todayStr)}
      </div>

      <!-- 列表视图 -->
      <div id="list-view" style="display: ${currentView === 'list' ? 'block' : 'none'};">
        <div style="font-size: 14px; font-weight: 600; color: var(--color-primary); margin-bottom: 8px;">
          📋 未来30天事项（${futureSchedules.length}条）
        </div>
        ${futureSchedules.length > 0 ? `
          <div class="event-list">
            ${futureSchedules.map(s => {
              const isTodayEvent = s.日期 === todayStr
              const isPast = s.日期 ? isBeforeToday(s.日期) : false
              return `
                <div class="event-item ${isTodayEvent ? 'today' : ''} ${isPast ? 'past' : ''}">
                  <div class="event-date">
                    ${formatDate(s.日期)} ${s.日期 ? getWeekDay(s.日期) : ''}
                    ${isTodayEvent ? '<span class="tag tag-active">今天</span>' : ''}
                  </div>
                  <div style="margin-top: 4px;">
                    <span class="event-type-tag">${escapeHtml(s.事项类型 || '其他')}</span>
                    <strong>${escapeHtml(s.事项标题 || '')}</strong>
                  </div>
                  ${s.适用客户 ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">适用：${escapeHtml(s.适用客户)}</div>` : ''}
                  ${s.具体安排 ? `<div style="font-size: 13px; color: #666; margin-top: 2px;">${escapeHtml(s.具体安排)}</div>` : ''}
                  ${s.注意事项 ? `<div style="font-size: 12px; color: #999; margin-top: 2px;">⚠️ ${escapeHtml(s.注意事项)}</div>` : ''}
                </div>
              `
            }).join('')}
          </div>
        ` : `
          <div class="empty-state">
            <div class="empty-state-icon">📅</div>
            <p>暂无未来30天的日程安排</p>
          </div>
        `}
      </div>

      <div class="footer-notice">
        <p>具体订货安排以正式通知为准</p>
      </div>
    </div>
  `

  // 绑定视图切换
  document.getElementById('view-calendar').addEventListener('click', () => {
    currentView = 'calendar'
    renderCalendarContent(app, schedules)
  })
  document.getElementById('view-list').addEventListener('click', () => {
    currentView = 'list'
    renderCalendarContent(app, schedules)
  })

  // 类型筛选
  document.getElementById('schedule-type-filter').addEventListener('change', (e) => {
    currentType = e.target.value
    renderCalendarContent(app, schedules)
  })

  // 日历导航
  const prevBtn = document.getElementById('calendar-prev')
  const nextBtn = document.getElementById('calendar-next')
  const todayBtn = document.getElementById('calendar-today')
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentMonth--
      renderCalendarContent(app, schedules)
    })
    nextBtn.addEventListener('click', () => {
      currentMonth++
      renderCalendarContent(app, schedules)
    })
    todayBtn.addEventListener('click', () => {
      currentMonth = 0
      renderCalendarContent(app, schedules)
    })
  }
}

/**
 * 生成日历天数
 */
function generateCalendarDays(baseDate, monthOffset) {
  const date = new Date(baseDate)
  date.setMonth(date.getMonth() + monthOffset)
  const year = date.getFullYear()
  const month = date.getMonth() + 1

  const firstDay = new Date(year, date.getMonth(), 1).getDay()
  const daysInMonth = new Date(year, date.getMonth() + 1, 0).getDate()

  const todayStr = getToday()
  const days = []

  // 填充空白
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: '', hasEvent: false, isToday: false, isPast: false })
  }

  // 填充日期
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isTodayDate = dateStr === todayStr
    const dObj = new Date(year, date.getMonth(), d)
    const isPast = dObj < new Date(todayStr.replace(/-/g, '/'))

    // 检查是否有事件（简化处理）
    const hasEvent = false // 实际可从 schedules 中检查

    days.push({
      day: d,
      hasEvent,
      isToday: isTodayDate,
      isPast
    })
  }

  return { year, month, days }
}

/**
 * 渲染当天的日程
 */
function renderDayEvents(schedules, dateStr) {
  const dayEvents = schedules.filter(s => s.日期 === dateStr)
  if (dayEvents.length === 0) {
    return `<div style="font-size: 13px; color: #999; padding: 8px 0;">今天暂无安排</div>`
  }
  return dayEvents.map(s => `
    <div style="
      padding: 10px 12px;
      background: var(--color-highlight);
      border-radius: 8px;
      margin-bottom: 6px;
      font-size: 14px;
    ">
      <div>
        <span class="event-type-tag">${escapeHtml(s.事项类型 || '其他')}</span>
        <strong>${escapeHtml(s.事项标题 || '')}</strong>
      </div>
      ${s.具体安排 ? `<div style="color: #666; margin-top: 4px;">${escapeHtml(s.具体安排)}</div>` : ''}
    </div>
  `).join('')
}
