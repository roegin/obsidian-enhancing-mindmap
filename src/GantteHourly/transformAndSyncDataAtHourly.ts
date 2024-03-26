interface MindMapNode {
  isDayLevel?: boolean;
  id: string;
  text: string;
  children?: MindMapNode[];
  startDate?: string;
  endDate?: string;
  actionStartDate?: string;  // 新增
  actionEndDate?: string;    // 新增
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
    isDayLevel?: boolean;
}

// 功能: 转换并同步数据，创建一个新的树结构，仅包含特定标签的节点，并更新父节点引用
export function transformAndSyncDataAtHourly(mindMapNodes: MindMapNode[]): GanttTask[] {
  const ganttTasks: GanttTask[] = [];
  const today = new Date().toISOString().split('T')[0]; // 当天日期，格式 YYYY-MM-DD
  const nodeIdMap = new Map<string, string>(); // 用于存储原始节点ID与新节点ID的映射



  // 功能: 递归遍历思维导图节点
  function traverseMindMapNode(node: MindMapNode, closestTargetAncestorId: string | null) {
    // 正则表达式来检查日期字符串是否包含时间部分
    const dateTimeRegex = /\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?/;



  
    // 检查节点是否包含指定标签，以及 startDate 或 endDate 是否包含具体的时间信息
    if (node.text.includes("#目标")) {
      // 检查是否有具体的开始或结束时间
      let hasDateTime = dateTimeRegex.test(node.startDate || '') || dateTimeRegex.test(node.endDate || '') || dateTimeRegex.test(node.actionStartDate || '') || dateTimeRegex.test(node.actionEndDate || '');
      
      if (hasDateTime) {
        const newId = node.id; // 使用现有的ID
        nodeIdMap.set(node.id, newId); // 存储映射

        let taskStart = node.startDate || node.actionStartDate || today;
        let taskEnd = node.endDate || node.actionEndDate || taskStart;

        // 检查节点是否有startDate或endDate
        let isDayLevel
        if (node.startDate || node.endDate) {
           isDayLevel = true; // 设置isDayLevel为true
        }

        const ganttTask: GanttTask = {
          id: newId,
          name: node.text,
          start: taskStart,
          end: taskEnd,
          progress: 20,
          parent: closestTargetAncestorId || '', // 使用最近的符合条件的祖先节点ID
          dependencies: closestTargetAncestorId || '',
          isDayLevel:isDayLevel
        };

        ganttTasks.push(ganttTask);
        closestTargetAncestorId = newId; // 更新最近的目标祖先节点ID
      }
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
