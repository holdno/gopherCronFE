import _default from "v-network-graph/components/network-graph.vue"
import { Task } from "../types"

export function TaskInLevels(tasks: Task[]): string[][] {
	let igraph = new Map<string, string[]>()
	let graph = new Map<string, string[]>()
	for (let task of tasks) {
		igraph.set(task.id, task.deps || [])
		if (task.deps) {
			for (let parentId of task.deps) {
				let children = graph.get(parentId) || []
				children.push(task.id)
				graph.set(parentId, children)
			}
		}
	}

	let S: string[] = []
	let inCountMap = new Map<string, number>()
	igraph.forEach((incomes, node) => {
		inCountMap.set(node, incomes.length);
		if (inCountMap.get(node) === 0) {
			S.push(node)
		}
	})

	let levels: string[][] = []
	levels.push(Object.assign([], S))

	S = S.reverse()
	let NS: string[] = []
	while (true) {
		const node = S.pop()
		if (node === undefined) {
			if (NS.length === 0) {
				break
			}
			S = NS.reverse()
			levels.push(Object.assign([], NS))
			NS = []
		} else {
			const outcomes = graph.get(node)
			if (!outcomes) continue
			for (let outcome of outcomes) {
				let inCount = inCountMap.get(outcome)
				if (inCount === undefined) continue
				inCount--
				inCountMap.set(outcome, inCount)
				if (inCount == 0) {
					NS.push(outcome)
				}
			}
		}
	}
	return levels
}