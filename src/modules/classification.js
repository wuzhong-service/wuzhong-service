/**
 * 分档制度解读模块
 * 使用折叠面板展示通俗解释、详细规则和常见问题
 */

import { formatDate, escapeHtml, debounce } from '../utils.js'
import { getClassifications } from '../data-service.js'
import { navigate } from '../router.js'

let currentFilters = { category: '', keyword: '' }

/**
 * 渲染分档解读页面
 * @param {Object} data
 */
export function renderClassification(data) {
  const app = document.getElementById('app')
  const classifications = data.classifications || []

  // 获取分类列表
  const categories = [...new Set(classifications.map(c => c.分类).filter(Boolean))]

  renderClassificationContent(app, classifications, categories, currentFilters)
}

function renderClassificationContent(app, classifications, categories, filters) {
  const filtered = getClassifications(filters)

  app.innerHTML = `
    <div class="header">
      <div class="header-back" onclick="navigate('service')">← 返回</div>
      <div class="header-title">📋 分档制度解读</div>
    </div>

    <div class="page active">
      <!-- 提示 -->
      <div class="legal-notice">
        ⚠️ 具体档位及评定结果以正式业务系统和最新通知为准。以下内容仅为系统演示。
      </div>

      <!-- 搜索 -->
      <div class="search-bar">
        <input type="text" class="search-input" id="class-search"
          placeholder="搜索关键词..." value="${escapeHtml(filters.keyword)}">
        <button class="btn btn-primary" id="class-search-btn">搜索</button>
      </div>

      <!-- 分类筛选 -->
      <div class="filter-bar" id="class-category-filter">
        <span class="filter-tag ${!filters.category ? 'active' : ''}" data-cat="">全部</span>
        ${categories.map(c => `
          <span class="filter-tag ${filters.category === c ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</span>
        `).join('')}
      </div>

      <!-- 结果 -->
      <div class="result-count">
        共 ${filtered.length} 条记录
      </div>

      ${filtered.length > 0 ? filtered.map((item, index) => `
        <div class="class-card">
          <div class="accordion">
            <button class="accordion-header" data-accordion="${index}">
              <div style="flex:1;">
                <div style="font-size: 12px; color: #999; margin-bottom: 2px;">${escapeHtml(item.分类 || '')}</div>
                <div style="font-weight: 600;">${escapeHtml(item.标题 || '未命名')}</div>
                <div style="font-size: 13px; color: #666; margin-top: 4px;">${escapeHtml(item.一句话解释 || '')}</div>
              </div>
              <span class="accordion-icon">▼</span>
            </button>
            <div class="accordion-body" id="accordion-body-${index}">
              ${item.详细内容 ? `
                <div style="margin-bottom: 16px;">
                  <div style="font-weight: 600; color: var(--color-primary); margin-bottom: 8px; font-size: 15px;">
                    📖 详细说明
                  </div>
                  <div style="font-size: 14px; line-height: 1.8; color: #444;">
                    ${item.详细内容.replace(/\n/g, '<br>')}
                  </div>
                </div>
              ` : ''}

              ${item.常见问题 ? `
                <div style="border-top: 1px solid var(--color-border); padding-top: 16px;">
                  <div style="font-weight: 600; color: var(--color-primary); margin-bottom: 8px; font-size: 15px;">
                    ❓ 常见问题
                  </div>
                  <div style="font-size: 14px; line-height: 1.8;">
                    ${renderFAQs(item.常见问题)}
                  </div>
                </div>
              ` : ''}

              ${item.更新时间 ? `
                <div style="margin-top: 12px; font-size: 12px; color: #999; text-align: right;">
                  更新于 ${formatDate(item.更新时间)}
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('') : `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>没有找到匹配的内容</p>
        </div>
      `}

      <div class="footer-notice">
        <p>具体档位及评定结果以正式业务系统和最新通知为准</p>
      </div>
    </div>
  `

  // 绑定折叠面板
  document.querySelectorAll('.accordion-header').forEach(btn => {
    btn.addEventListener('click', () => {
      const body = btn.nextElementSibling
      const isOpen = body.classList.contains('open')
      // 关闭所有
      document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'))
      document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('open'))
      // 切换当前
      if (!isOpen) {
        body.classList.add('open')
        btn.classList.add('open')
      }
    })
  })

  // 搜索
  document.getElementById('class-search-btn').addEventListener('click', () => {
    currentFilters.keyword = document.getElementById('class-search').value
    renderClassificationContent(app, classifications, categories, currentFilters)
  })
  document.getElementById('class-search').addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      currentFilters.keyword = e.target.value
      renderClassificationContent(app, classifications, categories, currentFilters)
    }
  })

  // 分类筛选
  document.querySelectorAll('#class-category-filter .filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      currentFilters.category = tag.dataset.cat
      renderClassificationContent(app, classifications, categories, currentFilters)
    })
  })
}

/**
 * 渲染常见问题（支持 Q: / A: 格式或 JSON 格式）
 */
function renderFAQs(faqText) {
  if (!faqText) return ''
  // 尝试解析为对象数组
  try {
    const faqs = typeof faqText === 'string' ? JSON.parse(faqText) : faqText
    if (Array.isArray(faqs)) {
      return faqs.map(faq => `
        <div class="faq-item">
          <div class="faq-q">❓ ${faq.q || faq.问题 || ''}</div>
          <div class="faq-a">💡 ${faq.a || faq.答案 || faq.回答 || ''}</div>
        </div>
      `).join('')
    }
  } catch (e) {
    // 不是 JSON 格式，按文本逐行解析
    const lines = String(faqText).split('\n')
    let html = ''
    let currentQ = ''
    for (const line of lines) {
      if (line.startsWith('Q:') || line.startsWith('问:')) {
        if (currentQ) {
          html += `<div class="faq-item">${currentQ}</div>`
        }
        currentQ = `<div class="faq-q">❓ ${line.replace(/^Q:|^问:/, '').trim()}</div>`
      } else if (line.startsWith('A:') || line.startsWith('答:')) {
        currentQ += `<div class="faq-a">💡 ${line.replace(/^A:|^答:/, '').trim()}</div>`
      } else if (line.trim()) {
        currentQ += `<div style="font-size: 13px; color: #666; padding-left: 8px;">${line.trim()}</div>`
      }
    }
    if (currentQ) {
      html += `<div class="faq-item">${currentQ}</div>`
    }
    return html
  }
  return ''
}
