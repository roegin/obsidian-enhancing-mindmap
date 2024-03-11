interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
    startDate?:string;
    endDate?:string;
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
export function transformAndSyncData(mindMapNodes: MindMapNode[]): GanttTask[] {
  const ganttTasks: GanttTask[] = [];
  const today = new Date().toISOString().split('T')[0]; // 当天日期，格式 YYYY-MM-DD
  const nodeIdMap = new Map<string, string>(); // 用于存储原始节点ID与新节点ID的映射

  // 功能: 递归遍历思维导图节点
  function traverseMindMapNode(node: MindMapNode, parentId: string | null) {
    if (node.text.includes("#目标")) { // 过滤器，只处理包含特定标签的节点
      console.log('#目标',node)
      const newId = generateNewId(); // 生成新的ID
      nodeIdMap.set(node.id, newId); // 存储映射

      const ganttTask: GanttTask = {
        id: newId,
        name: node.text,
        start: node.startDate || today,
        end: node.endDate || today,
        progress: 20,
        parent: parentId ? nodeIdMap.get(parentId) || '' : '', // 更新父节点引用
        dependencies: parentId ? nodeIdMap.get(parentId) || '' : ''
      };

      ganttTasks.push(ganttTask);

      if (node.children) {
        console.log('node.children',node.children)
        node.children.forEach(child => traverseMindMapNode(child, node.id));
      }
    }
  }

  function generateNewId(): string {
    // 生成一个新的唯一ID
    return Math.random().toString(36).substring(2, 9);
  }

  if (mindMapNodes.length > 0) {
    traverseMindMapNode(mindMapNodes[0], null); // 从根节点开始遍历
  }

  return ganttTasks;
}
