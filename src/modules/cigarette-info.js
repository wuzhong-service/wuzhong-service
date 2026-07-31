/**
 * 卷烟信息模块
 * 展示卷烟品牌、品规、价格等，支持搜索和品牌筛选
 */

import { escapeHtml, formatPrice, debounce } from '../utils.js'
import { getCigarettes, getBrandList } from '../data-service.js'
import { navigate } from '../router.js'

let currentFilters = { brand: '', keyword: '' }

/**
 * 渲染卷烟信息页面
 * @param {Object} data
 */
export function renderCigarette(data) {
  const app = document.getElementById('app')
  const cigarettes = data.cigarettes || []
  const brands = getBrandList()

  renderCigaretteContent(app, cigarettes, brands, currentFilters)
}

function renderCigaretteContent(app, cigarettes, brands, filters) {
  const filtered = getCigarettes(filters)
  const count = filtered.length

  app.innerHTML = `
    <!-- 顶部标题 -->
    <div class="header">
      <div class="header-back" onclick="navigate('home')">← 返回</div>
      <div class="header-title">🔍 卷烟信息查询</div>
    </div>

    <div class="page active">
      <!-- 价格提示 -->
      <div class="legal-notice">
        ⚠️ 相关价格及信息以最新业务通知为准
      </div>

      <!-- 搜索 -->
      <div class="search-bar">
        <input type="text" class="search-input" id="cigarette-search"
          placeholder="输入品牌或品规名称..." value="${escapeHtml(filters.keyword)}">
        <button class="btn btn-primary" id="cigarette-search-btn">搜索</button>
        ${filters.keyword || filters.brand ? `
          <button class="btn btn-secondary" id="cigarette-clear-btn">清空</button>
        ` : ''}
      </div>

      <!-- 品牌筛选 -->
      <div class="filter-bar" id="brand-filter">
        <span class="filter-tag ${!filters.brand ? 'active' : ''}" data-brand="">全部</span>
        ${brands.map(b => `
          <span class="filter-tag ${filters.brand === b ? 'active' : ''}" data-brand="${escapeHtml(b)}">${escapeHtml(b)}</span>
        `).join('')}
      </div>

      <!-- 结果数量 -->
      <div class="result-count">
        共 <strong>${count}</strong> 条记录
      </div>

      <!-- 表格（桌面端） -->
      <table class="data-table">
        <thead>
          <tr>
            <th>品牌</th>
            <th>品规名称</th>
            <th>批发价</th>
            <th>建议零售价</th>
            <th>规格说明</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          ${count > 0 ? filtered.map(c => `
            <tr>
              <td>${escapeHtml(c.品牌 || '—')}</td>
              <td>${escapeHtml(c.品规名称 || '—')}</td>
              <td>${formatPrice(c.批发价)}</td>
              <td>${formatPrice(c.建议零售价)}</td>
              <td>${escapeHtml(c.规格说明 || '—')}</td>
              <td>${escapeHtml(c.备注 || '')}</td>
            </tr>
          `).join('') : `
            <tr><td colspan="6" style="text-align:center;color:#999;">暂无数据</td></tr>
          `}
        </tbody>
      </table>

      <!-- 手机端卡片 -->
      <div class="mobile-cards">
        ${count > 0 ? filtered.map(c => `
          <div class="mobile-card-item">
            <div class="field">
              <span class="field-label">品牌</span>
              <span class="field-value"><strong>${escapeHtml(c.品牌 || '—')}</strong></span>
            </div>
            <div class="field">
              <span class="field-label">品规名称</span>
              <span class="field-value">${escapeHtml(c.品规名称 || '—')}</span>
            </div>
            <div class="field">
              <span class="field-label">批发价</span>
              <span class="field-value">${formatPrice(c.批发价)}</span>
            </div>
            <div class="field">
              <span class="field-label">建议零售价</span>
              <span class="field-value">${formatPrice(c.建议零售价)}</span>
            </div>
            <div class="field">
              <span class="field-label">规格说明</span>
              <span class="field-value">${escapeHtml(c.规格说明 || '—')}</span>
            </div>
            ${c.备注 ? `
            <div class="field">
              <span class="field-label">备注</span>
              <span class="field-value">${escapeHtml(c.备注)}</span>
            </div>
            ` : ''}
          </div>
        `).join('') : `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <p style="margin-bottom: 8px;">没有找到匹配的卷烟信息</p>
            <button class="btn btn-sm btn-outline" id="cigarette-clear-btn2">清空搜索条件</button>
          </div>
        `}
      </div>

      <div class="footer-notice">
        <p>相关价格及信息以最新业务通知为准。</p>
        <p style="margin-top: 4px;">更新时间：${cigarettes[0]?.更新时间 ? cigarettes[0].更新时间 : '—'}</p>
      </div>
    </div>
  `

  // 绑定事件
  document.getElementById('cigarette-search-btn').addEventListener('click', () => {
    currentFilters.keyword = document.getElementById('cigarette-search').value
    renderCigaretteContent(app, cigarettes, brands, currentFilters)
  })

  const searchInput = document.getElementById('cigarette-search')
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      currentFilters.keyword = e.target.value
      renderCigaretteContent(app, cigarettes, brands, currentFilters)
    }
  })

  // 品牌筛选
  document.querySelectorAll('#brand-filter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      currentFilters.brand = tag.dataset.brand
      renderCigaretteContent(app, cigarettes, brands, currentFilters)
    })
  })

  // 清空按钮
  const clearBtn = document.getElementById('cigarette-clear-btn')
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentFilters = { brand: '', keyword: '' }
      renderCigaretteContent(app, cigarettes, brands, currentFilters)
    })
  }
  const clearBtn2 = document.getElementById('cigarette-clear-btn2')
  if (clearBtn2) {
    clearBtn2.addEventListener('click', () => {
      currentFilters = { brand: '', keyword: '' }
      renderCigaretteContent(app, cigarettes, brands, currentFilters)
    })
  }
}
