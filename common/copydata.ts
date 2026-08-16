/**
 * 内置文案模板。先中文，占位符用 {{名字}}，用户改完可另存为自己的模板。
 * 混元接口预留在 common/ai.ts，默认不联网。
 */

export type CopyPreset = {
	name: string
	cate: string
	body: string
}

export const COPY_PRESETS: CopyPreset[] = [
	{
		name: '短视频标题-种草',
		cate: '短视频',
		body: '我用了 {{天数}} 天 {{产品}}，只想说一句：{{结论}}\n适合 {{人群}}，不适合瞎跟风。'
	},
	{
		name: '短视频标题-反差',
		cate: '短视频',
		body: '别再 {{错误做法}} 了。{{人群}} 真正该做的是 {{正确做法}}。'
	},
	{
		name: '朋友圈-日常',
		cate: '朋友圈',
		body: '{{时间}} 在 {{地点}}，{{一件小事}}。\n不鸡汤，就这一句：{{金句}}。'
	},
	{
		name: '周报-职场',
		cate: '周报',
		body: '本周重点\n1. {{事项一}}：结果 {{结果一}}\n2. {{事项二}}：结果 {{结果二}}\n风险：{{风险}}\n下周：{{下周计划}}'
	},
	{
		name: '电商标题-主图',
		cate: '电商',
		body: '{{品牌}} {{品名}} {{卖点一}} {{卖点二}} 发 {{赠品}}'
	},
	{
		name: '客服话术-售后',
		cate: '客服',
		body: '亲，这边看到你反馈 {{问题}}。已经帮你登记，预计 {{时效}} 处理完，处理结果会再跟你说一声。'
	}
]

export function fillTemplate(body: string, keys: string[], values: string[]): string {
	let out = body
	keys.forEach((key, i) => {
		out = out.split('{{' + key + '}}').join(values[i] ?? '')
	})
	return out
}

export function collectPlaceholders(body: string): string[] {
	const keys: string[] = []
	let i = 0
	while (i < body.length) {
		const a = body.indexOf('{{', i)
		if (a < 0) break
		const b = body.indexOf('}}', a + 2)
		if (b < 0) break
		const key = body.substring(a + 2, b).trim()
		if (key && !keys.includes(key)) {
			keys.push(key)
		}
		i = b + 2
	}
	return keys
}
