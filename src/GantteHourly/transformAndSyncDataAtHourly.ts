interface MindMapNode {
    id: string;                // 节点唯一标识
    text: string;              // 节点文本内容
    children?: MindMapNode[];  // 子节点数组
    startDate?: string;        // 开始日期，格式: "YYYY-MM-DD" 或 "YYYY-MM-DD-HH:MM"
    endDate?: string;          // 结束日期，格式: "YYYY-MM-DD" 或 "YYYY-MM-DD-HH:MM"
}


interface GanttTask {
    id: string;
    name: string;
    start: string;//
    end: string;
   // duration: number;
    progress: number;
    parent: string;
    dependencies?:string;
    custom_class?:string;
}

// 功能: 转换并同步数据，创建一个新的树结构，仅包含特定标签的节点，并更新父节点引用
export function transformAndSyncDataAtHourly(mindMapNodes: MindMapNode[]): GanttTask[] {
  const ganttTasks: GanttTask[] = [];
  const today = new Date().toISOString().split('T')[0]; // 当天日期，格式 YYYY-MM-DD
  const nodeIdMap = new Map<string, string>(); // 用于存储原始节点ID与新节点ID的映射

  // 功能: 查找节点的最近符合条件的祖先节点ID
  // 功能: 查找节点的最近符合条件的祖先节点ID
  function findClosestAncestorId(nodeId: string): string | null {
    let currentId = nodeId;
    while (currentId) {
        if (nodeIdMap.has(currentId)) {
            return nodeIdMap.get(currentId);
        }
        let currentNode = mindMapNodes.find(node => node.id === currentId);
        currentId = currentNode && currentNode.parent ? currentNode.parent : null;
    }
    return null;
  }

  // 功能: 递归遍历思维导图节点
  function traverseMindMapNode(node: MindMapNode, closestTargetAncestorId: string | null) {
    // 正则表达式来检查日期字符串是否包含时间部分
    const dateTimeRegex = /\d{4}-\d{2}-\d{2}-\d{2}:\d{2}/;
  
    // 检查节点是否包含指定标签，以及 startDate 或 endDate 是否包含具体的时间信息
    if (node.text.includes("#目标") && (dateTimeRegex.test(node.startDate || '') || dateTimeRegex.test(node.endDate || ''))) {
      const newId = node.id; // 使用现有的ID
      nodeIdMap.set(node.id, newId); // 存储映射
  
      const ganttTask: GanttTask = {
        id: newId,
        name: node.text,
        start: node.startDate || today,
        end: node.endDate || today,
        progress: 20,
        parent: closestTargetAncestorId || '', // 使用最近的符合条件的祖先节点ID
        dependencies: closestTargetAncestorId || ''
      };
  
      ganttTasks.push(ganttTask);
      closestTargetAncestorId = newId; // 更新最近的目标祖先节点ID
    }
  
    if (node.children) {
      node.children.forEach(child => traverseMindMapNode(child, closestTargetAncestorId));
    }
  }
  

  if (mindMapNodes.length > 0) {
    traverseMindMapNode(mindMapNodes[0], null); // 从根节点开始遍历
  }

  return ganttTasks;

}
