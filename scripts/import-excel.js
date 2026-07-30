/**
 * Excel 数据导入脚本
 * 将 data/营销信息.xlsx 转换为 public/data/content.json
 *
 * 使用: npm run import-data
 * 或者: node scripts/import-excel.js
 */

import XLSX from 'xlsx'
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const EXCEL_PATH = join(PROJECT_ROOT, 'data', '营销信息.xlsx')
const OUTPUT_PATH = join(PROJECT_ROOT, 'public', 'data', 'content.json')
const BACKUP_DIR = join(PROJECT_ROOT, 'public', 'data', 'backup')

// 必填工作表列表
const REQUIRED_SHEETS = [
  '首页通知',
  '套餐信息',
  '卷烟信息',
  '日程安排',
  '直播信息',
  '制度解读',
  '应急订单',
  '基础设置',
]

// 各工作表必填字段
const REQUIRED_FIELDS = {
  '首页通知': ['标题'],
  '套餐信息': ['品规名称'],
  '卷烟信息': ['品规名称', '品牌'],
  '日程安排': ['批次'],
  '直播信息': ['直播主题', '直播时间'],
  '制度解读': ['标题'],
  '应急订单': ['标题'],
  '基础设置': ['键名', '键值'],
}

// 允许的状态值
const VALID_STATUSES = {
  '直播信息': ['即将开始', '直播中', '已结束', '可回看'],
  '应急订单': ['待开始', '进行中', '已结束', '已调整'],
}

// 所有错误
const errors = []
// 所有警告
const warnings = []

/**
 * 添加错误
 */
function addError(sheet, row, field, message) {
  errors.push(`[${sheet}] 第${row}行，字段"${field}"：${message}`)
}

/**
 * 添加警告
 */
function addWarning(sheet, row, field, message) {
  warnings.push(`[${sheet}] 第${row}行，字段"${field}"：${message}`)
}

/**
 * 校验日期格式 (YYYY-MM-DD 或 YYYY-MM-DD HH:MM)
 */
function isValidDate(val) {
  if (!val) return false
  const str = String(val).trim()
  // Excel 日期序列号
  if (!isNaN(str) && Number(str) > 40000) return true
  // 字符串日期
  return /^\d{4}-\d{2}-\d{2}/.test(str)
}

/**
 * 转换 Excel 日期为 YYYY-MM-DD
 */
function convertDate(val) {
  if (!val) return ''
  const str = String(val).trim()
  // 如果是数字（Excel 序列号）
  if (!isNaN(str) && Number(str) > 40000) {
    // Excel 日期从 1900-01-01 开始
    const date = XLSX.SSF.parse_date_code(Number(str))
    if (date) {
      const y = date.y
      const m = String(date.m).padStart(2, '0')
      const d = String(date.d).padStart(2, '0')
      return `${y}-${m}-${d}`
    }
  }
  // 尝试解析字符串日期
  const match = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/)
  if (match) {
    const y = match[1]
    const m = String(match[2]).padStart(2, '0')
    const d = String(match[3]).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return str
}

/**
 * 检查字符串格式的 URL
 */
function isValidUrl(val) {
  if (!val) return true // 空值不算错误
  const str = String(val).trim()
  if (!str) return true
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('./') || str.startsWith('/')
}

/**
 * 清理空白行（所有字段为空的行）
 */
function filterEmptyRows(rows) {
  return rows.filter(row => {
    return Object.values(row).some(val => {
      if (val === undefined || val === null) return false
      if (typeof val === 'string' && val.trim() === '') return false
      return true
    })
  })
}

/**
 * 校验工作表
 */
function validateSheet(sheetName, rows, sheetIndex) {
  const requiredFields = REQUIRED_FIELDS[sheetName] || []
  const validStatuses = VALID_STATUSES[sheetName] || []
  const validRows = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // Excel 行号（从第2行开始，因为有表头）

    // 检查必填字段
    for (const field of requiredFields) {
      const val = row[field]
      if (val === undefined || val === null || String(val).trim() === '') {
        addError(sheetName, rowNum, field, '必填字段不能为空')
      }
    }

    // 校验日期格式
    for (const [key, val] of Object.entries(row)) {
      if (key.includes('日期') || key.includes('时间') || key.includes('更新') || key.includes('截止') || key.includes('开始') || key.includes('结束')) {
        if (val && String(val).trim()) {
          if (!isValidDate(val) && !String(val).includes(':')) {
            addWarning(sheetName, rowNum, key, `日期格式异常：${val}`)
          }
        }
      }
    }

    // 校验价格（数字）
    for (const [key, val] of Object.entries(row)) {
      if ((key.includes('价格') || key.includes('价')) && val !== undefined && val !== null && String(val).trim() !== '') {
        const num = Number(String(val).replace(/[^0-9.-]/g, ''))
        if (isNaN(num)) {
          addWarning(sheetName, rowNum, key, `价格不是有效数字：${val}`)
        }
      }
    }

    // 校验状态
    if (validStatuses.length > 0) {
      const statusVal = row['状态'] || row['当前状态'] || ''
      if (statusVal && !validStatuses.includes(String(statusVal).trim())) {
        addWarning(sheetName, rowNum, '状态', `"${statusVal}" 不在有效选项 ${JSON.stringify(validStatuses)} 中`)
      }
    }

    // 校验直播链接
    if (sheetName === '直播信息') {
      if (row['直播入口'] && !isValidUrl(row['直播入口'])) {
        addWarning(sheetName, rowNum, '直播入口', `链接格式异常：${row['直播入口']}`)
      }
      if (row['回看入口'] && !isValidUrl(row['回看入口'])) {
        addWarning(sheetName, rowNum, '回看入口', `链接格式异常：${row['回看入口']}`)
      }
    }

    // 校验截止时间是否早于安排日期（应急订单）
    if (sheetName === '应急订单' && row['安排日期'] && row['支付截止时间']) {
      const arrangeDate = new Date(convertDate(row['安排日期']).replace(/-/g, '/'))
      const deadline = new Date(convertDate(row['支付截止时间']).replace(/-/g, '/'))
      if (!isNaN(arrangeDate) && !isNaN(deadline) && deadline < arrangeDate) {
        addWarning(sheetName, rowNum, '支付截止时间', '截止时间早于安排日期')
      }
    }

    // 转换日期字段
    const convertedRow = {}
    for (const [key, val] of Object.entries(row)) {
      if (key.includes('日期') || key.includes('时间') || key.includes('更新') || key.includes('截止') || key.includes('开始') || key.includes('结束')) {
        convertedRow[key] = convertDate(val)
      } else {
        convertedRow[key] = val !== undefined && val !== null ? String(val).trim() : ''
      }
    }

    validRows.push(convertedRow)
  }

  return validRows
}

/**
 * 主函数
 */
async function main() {
  console.log('='.repeat(50))
  console.log('📋 吴中营销服务数据导入工具')
  console.log('='.repeat(50))

  // 检查 Excel 是否存在
  if (!existsSync(EXCEL_PATH)) {
    console.error('\n❌ 错误：未找到 Excel 文件！')
    console.error(`   期望路径: ${EXCEL_PATH}`)
    console.error('\n💡 请先运行 npm run generate-template 生成模板，')
    console.error('   或者在 data/ 目录下创建 营销信息.xlsx 文件。')
    process.exit(1)
  }

  console.log(`\n📂 读取文件: ${EXCEL_PATH}`)

  // 读取 Excel
  let workbook
  try {
    workbook = XLSX.readFile(EXCEL_PATH)
  } catch (err) {
    console.error(`\n❌ 无法读取 Excel 文件: ${err.message}`)
    process.exit(1)
  }

  // 检查工作表是否齐全
  const sheetNames = workbook.SheetNames
  console.log(`\n📊 工作簿包含的工作表: ${sheetNames.join(', ')}`)

  const missingSheets = REQUIRED_SHEETS.filter(s => !sheetNames.includes(s))
  if (missingSheets.length > 0) {
    console.error(`\n❌ 缺少以下工作表: ${missingSheets.join(', ')}`)
    console.error('   请检查 Excel 文件，确保工作表名称未被修改。')
    process.exit(1)
  }

  // 解析各工作表
  const output = {}

  for (const sheetName of REQUIRED_SHEETS) {
    const sheetIndex = sheetNames.indexOf(sheetName)
    const ws = workbook.Sheets[sheetName]
    const rawData = XLSX.utils.sheet_to_json(ws, { defval: '' })
    const filtered = filterEmptyRows(rawData)

    console.log(`\n  📄 ${sheetName}: ${filtered.length} 条记录 (原始 ${rawData.length} 行)`)

    const validated = validateSheet(sheetName, filtered, sheetIndex)

    // 根据工作表名映射到输出字段
    const keyMap = {
      '首页通知': 'homeNotices',
      '套餐信息': 'packages',
      '卷烟信息': 'cigarettes',
      '日程安排': 'schedules',
      '直播信息': 'liveBroadcasts',
      '制度解读': 'classifications',
      '应急订单': 'emergencyOrders',
      '基础设置': 'settings',
    }
    const outputKey = keyMap[sheetName]
    if (outputKey) {
      output[outputKey] = validated
    }
  }

  // 输出摘要
  console.log('\n' + '='.repeat(50))
  console.log('📊 数据转换摘要')
  console.log('='.repeat(50))
  for (const [key, val] of Object.entries(output)) {
    console.log(`  ${key}: ${Array.isArray(val) ? val.length : 1} 条`)
  }

  // 输出错误和警告
  if (errors.length > 0) {
    console.error('\n❌ 校验错误:')
    errors.forEach(e => console.error(`   ${e}`))
    console.error('\n🚫 存在错误，请修正后重新导入。')
    process.exit(1)
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  警告（可继续，但建议检查）:')
    warnings.forEach(w => console.warn(`   ${w}`))
  }

  // 备份上一次 JSON
  if (existsSync(OUTPUT_PATH)) {
    if (!existsSync(BACKUP_DIR)) {
      mkdirSync(BACKUP_DIR, { recursive: true })
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupPath = join(BACKUP_DIR, `content-${timestamp}.json`)
    copyFileSync(OUTPUT_PATH, backupPath)
    console.log(`\n💾 已备份上一次数据: ${backupPath}`)
  }

  // 确保输出目录存在
  const outputDir = dirname(OUTPUT_PATH)
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true })
  }

  // 写入 JSON
  const jsonStr = JSON.stringify(output, null, 2)
  writeFileSync(OUTPUT_PATH, jsonStr, 'utf-8')
  console.log(`\n✅ 数据已写入: ${OUTPUT_PATH}`)
  console.log(`   文件大小: ${(Buffer.byteLength(jsonStr) / 1024).toFixed(1)} KB`)

  console.log('\n🎉 导入完成！')
}

main().catch(err => {
  console.error(`\n❌ 脚本执行失败: ${err.message}`)
  process.exit(1)
})
