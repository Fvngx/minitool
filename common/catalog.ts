/**
 * 工具目录：首页展示、收藏、跳转都走这份清单。
 * tag=keep 表示带模板/历史，是留存主力。
 * tag=flow 表示一次性引流，不作为留客核心。
 */

export type ToolItem = {
	id: string
	name: string
	desc: string
	path: string
	group: string
	tag: 'keep' | 'flow'
}

export const TOOLS: ToolItem[] = [
	{ id: 'json', name: 'JSON 格式化', desc: '美化校验，最近 10 条历史直接回填', path: '/pages/tools/json', group: '开发', tag: 'keep' },
	{ id: 'image-size', name: '图片尺寸模板', desc: '小红书封面、主图尺寸一键切', path: '/pages/tools/image-size', group: '图片', tag: 'keep' },
	{ id: 'qrcode', name: '二维码模板', desc: '店铺/社群链接存成模板，下次一键出码', path: '/pages/tools/qrcode', group: '日常', tag: 'keep' },
	{ id: 'snippets', name: '话术收藏夹', desc: '销售客服短句，本地保存一键复制', path: '/pages/tools/snippets', group: '文案', tag: 'keep' },
	{ id: 'copy', name: '文案模板库', desc: '短视频、周报、电商标题，自己的模板反复用', path: '/pages/tools/copy', group: '文案', tag: 'keep' },
	{ id: 'keywords', name: '关键词清单', desc: '去重排序，词表存在本地反复改', path: '/pages/tools/keywords', group: '运营', tag: 'keep' },
	{ id: 'timestamp', name: '时间戳换算', desc: '查日志排期常用，留转换记录', path: '/pages/tools/timestamp', group: '开发', tag: 'keep' },
	{ id: 'password', name: '密码规则', desc: '长度、符号几套规则存着随时生成', path: '/pages/tools/password', group: '开发', tag: 'keep' },
	{ id: 'palette', name: '常用色板', desc: '封面配色组，一键复制色值', path: '/pages/tools/palette', group: '图片', tag: 'keep' },
	{ id: 'todo', name: '简易清单', desc: '临时待办，不协同，纯本地', path: '/pages/tools/todo', group: '日常', tag: 'keep' },
	{ id: 'word-count', name: '字数统计', desc: '搜一搜引流，用完即走', path: '/pages/tools/word-count', group: '引流', tag: 'flow' },
	{ id: 'image-compress', name: '图片压缩', desc: '搜一搜引流，不上传服务器', path: '/pages/tools/image-compress', group: '引流', tag: 'flow' }
]

export function findTool(id: string): ToolItem | null {
	return TOOLS.find((t) => t.id === id) ?? null
}

export function keepTools(): ToolItem[] {
	return TOOLS.filter((t) => t.tag === 'keep')
}

export function flowTools(): ToolItem[] {
	return TOOLS.filter((t) => t.tag === 'flow')
}
