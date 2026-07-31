/**
 * 生成 Excel 模板（含演示数据）
 * 运行: node scripts/generate-template.js
 */

import XLSX from 'xlsx'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dataDir = join(__dirname, '..', 'data')
const excelPath = join(dataDir, '营销信息.xlsx')

/** 工具：获取当前日期字符串 */
function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** 工具：获取未来 N 天日期 */
function futureDate(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ========== 数据定义 ==========

/** 首页通知 */
function genHomeNotices() {
  return [
    { 排序: 1, 标题: '本周套餐已更新', 内容: '本周套餐已发布，请选择您的档位查看对应品规和数量。', 日期: futureDate(0), 紧急: '否', 更新时间: today() },
    { 排序: 2, 标题: '应急订单安排已发布', 内容: '本批次应急订单已发布，请查看截止时间并提前准备资金。', 日期: futureDate(1), 紧急: '是', 更新时间: today() },
  ]
}

/** 标签活动：档位对应品规和数量，每行按原文件标注活动品规/激励品规 */
function genPackages() {
  const r = (品牌组, 类型, 品规名称, d30, d27, d19, d14, d9) => ({
    品牌组, 品牌: 品牌组 === '组1'||品牌组==='组2'||品牌组==='组3'||品牌组==='组4'||品牌组==='组5' ? '江苏中烟' : 品牌组,
    类型, 品规名称,
    '30-28档数量': d30, '27-20档数量': d27, '19-15档数量': d19, '14-10档数量': d14, '9-1档数量': d9,
    更新时间: today()
  })
  return [
    // 上烟集团
    r('上烟集团', '活动品规', '中华(硬红)', 25, 20, 15, 8, 5),
    r('上烟集团', '激励品规', '沪前门(软)', 25, 20, 15, 8, 5),
    r('上烟集团', '激励品规', '牡丹(软)', 15, 10, 8, 4, 3),
    // 组1
    r('组1', '活动品规', '苏烟(软五星红杉树)', 24, 22, 16, 10, 6),
    r('组1', '激励品规', '南京(硬炫赫门)', 18, 16, 12, 7, 4),
    // 组2
    r('组2', '活动品规', '南京(硬大观园爆冰)', 15, 10, 5, 3, ''),
    r('组2', '活动品规', '苏烟(硬五星红中)', 5, 5, 3, 2, ''),
    r('组2', '激励品规', '南京(硬紫树)', 18, 13, 7, 4, ''),
    // 组3
    r('组3', '活动品规', '南京(硬精品)', 10, 8, 5, 3, 2),
    r('组3', '活动品规', '南京(硬十二钗薄荷)', 10, 8, 5, 3, 2),
    r('组3', '激励品规', '南京(硬红)', 15, 12, 7, 4, 2),
    // 组4
    r('组4', '活动品规', '南京(软九五)', 5, 4, 2, '', ''),
    r('组4', '激励品规', '南京(硬紫树)', 5, 4, 2, '', ''),
    r('组4', '激励品规', '利群(硬新版)', 2, 2, 1, '', ''),
    // 组5
    r('组5', '活动品规', '南京(硬十二钗烤烟)', 6, 6, 4, 4, 4),
    r('组5', '激励品规', '黄山(硬新一品)', 9, 9, 6, 6, 6),
    // 云南中烟
    r('云南中烟', '活动品规', '云烟(软珍品)', 22, 18, 12, 7, 4),
    r('云南中烟', '激励品规', '红塔山(软13mg经典1956)', 25, 20, 15, 8, 5),
    // 福建中烟
    r('福建中烟', '活动品规', '七匹狼(硬银中支)', 5, 3, 2, '', ''),
    r('福建中烟', '活动品规', '七匹狼(软灰)', 3, 2, 2, '', ''),
    r('福建中烟', '激励品规', '七匹狼(纯境)', 6, 4, 3, '', ''),
  ]
}

/** 卷烟信息 */
function genCigarettes() {
  return [
    { 品牌: '中华', 品规名称: '中华(硬红)', 批发价: '100.00', 建议零售价: '200.00', 规格说明: '20支/包, 10包/条', 备注: '演示价格', 更新时间: today() },
    { 品牌: '苏烟', 品规名称: '苏烟(软五星红杉树)', 批发价: '100.00', 建议零售价: '200.00', 规格说明: '20支/包, 10包/条', 备注: '演示价格', 更新时间: today() },
    { 品牌: '南京', 品规名称: '南京(硬炫赫门)', 批发价: '100.00', 建议零售价: '200.00', 规格说明: '20支/包, 10包/条', 备注: '演示价格', 更新时间: today() },
    { 品牌: '南京', 品规名称: '南京(硬精品)', 批发价: '100.00', 建议零售价: '200.00', 规格说明: '20支/包, 10包/条', 备注: '演示价格', 更新时间: today() },
    { 品牌: '云烟', 品规名称: '云烟(软珍品)', 批发价: '100.00', 建议零售价: '200.00', 规格说明: '20支/包, 10包/条', 备注: '演示价格', 更新时间: today() },
    { 品牌: '七匹狼', 品规名称: '七匹狼(硬银中支)', 批发价: '100.00', 建议零售价: '200.00', 规格说明: '20支/包, 10包/条', 备注: '演示价格', 更新时间: today() },
  ]
}

/** 订货时间安排：8月订货排期，周日~周四=批次1~5 */
function genSchedules() {
  const rows = []
  // 2026年8月：1号周六，2号周日开始
  for (let d = 2; d <= 31; d++) {
    const date = new Date(2026, 7, d) // 7=August
    const day = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    if (day === 5 || day === 6) continue // 跳过周五周六

    const batchNum = day + 1 // Sun=1, Mon=2, ..., Thu=5
    const orderDate = `2026-08-${String(d).padStart(2, '0')}`

    // 送货日期（订货后2天）
    const delivery = new Date(date)
    delivery.setDate(delivery.getDate() + 2)
    const deliveryDate = `${delivery.getFullYear()}-${String(delivery.getMonth() + 1).padStart(2, '0')}-${String(delivery.getDate()).padStart(2, '0')}`

    rows.push({ 批次: batchNum, 订货日期: orderDate, 送货日期: deliveryDate })
  }
  return rows
}

/** 直播信息 */
function genLiveBroadcasts() {
  return [
    {
      直播时间: `${futureDate(1)} 10:00`,
      直播主题: '最新分档政策解读',
      主要内容: '详细介绍最新档位评定标准和规则变化',
      主讲人: '王经理',
      直播入口: 'https://example.com/live/demo1',
      直播二维码: '',
      回看入口: '',
      状态: '即将开始',
      更新时间: today(),
    },
  ]
}

/** 制度解读 */
function genClassifications() {
  return [
    {
      分类: '档位概述',
      标题: '什么是客户档位',
      一句话解释: '客户档位是烟草公司根据客户经营情况评定的等级，不同档位对应不同的订货权限。',
      详细内容: '卷烟零售客户档位制度是根据客户的经营能力、规范程度和历史数据，将客户分为不同等级的管理制度。档位越高，通常意味着可以订购的品规种类和数量越多。',
      常见问题: JSON.stringify([
        { q: '档位多久调整一次？', a: '演示数据，具体调整周期以当地烟草公司正式通知为准。' },
      ]),
      更新时间: today(),
    },
    {
      分类: '评定规则',
      标题: '档位评定的主要依据',
      一句话解释: '评定依据主要包括客户的订货量、订货金额、规范经营情况等多个维度。',
      详细内容: '档位评定的主要维度包括：\n1. 订货量维度\n2. 订货金额维度\n3. 规范经营维度\n4. 配合度维度',
      常见问题: JSON.stringify([
        { q: '如何提升档位？', a: '建议保持稳定订货，积极配合各项工作，具体可咨询客户经理。演示数据仅供参考。' },
      ]),
      更新时间: today(),
    },
  ]
}

/** 应急订单 */
function genEmergencyOrders() {
  return [
    {
      标题: '应急订单安排（演示）',
      安排日期: futureDate(1),
      涉及批次: '2026年7月第一批',
      涉及品规: '中华(硬红)、苏烟(软五星红杉树)',
      适用客户: '全部客户',
      支付截止时间: futureDate(3),
      具体说明: '演示数据。工业到货后及时安排兑付，请提前确认账户资金充足。',
      当前状态: '进行中',
      更新时间: today(),
    },
  ]
}

/** 基础设置 */
function genSettings() {
  return [
    { 键名: '网站名称', 键值: '吴中零售客户营销服务' },
    { 键名: '服务对象提示', 键值: '仅供持证卷烟零售客户业务查询' },
    { 键名: '数据更新时间', 键值: today() },
    { 键名: '活动日期范围', 键值: '7.26-7.30' },
    { 键名: '页脚说明', 键值: '本页面仅面向持证卷烟零售客户提供业务信息查询和服务提醒' },
  ]
}

// ========== 生成 Excel ==========

const wb = XLSX.utils.book_new()

function addSheet(wb, name, data, colWidths) {
  const ws = XLSX.utils.json_to_sheet(data)
  ws['!cols'] = (colWidths || []).map(w => ({ wch: w }))
  XLSX.utils.book_append_sheet(wb, ws, name)
}

addSheet(wb, '首页通知', genHomeNotices(), [8, 25, 35, 14, 6, 14])
addSheet(wb, '套餐信息', genPackages(), [10, 6, 12, 22, 14, 14, 14, 14, 14, 14])
addSheet(wb, '卷烟信息', genCigarettes(), [10, 22, 12, 14, 22, 20, 14])
addSheet(wb, '日程安排', genSchedules(), [8, 14, 14])
addSheet(wb, '直播信息', genLiveBroadcasts(), [20, 25, 30, 10, 35, 20, 20, 10, 14])
addSheet(wb, '制度解读', genClassifications(), [10, 20, 35, 50, 40, 14])
addSheet(wb, '应急订单', genEmergencyOrders(), [30, 14, 20, 20, 14, 14, 40, 10, 14])
addSheet(wb, '基础设置', genSettings(), [20, 30])

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true })
}

XLSX.writeFile(wb, excelPath)
console.log(`✅ Excel 模板已生成: ${excelPath}`)
console.log(`📊 共 8 个工作表，包含演示数据。请修改后执行 npm run import-data 更新数据。`)
