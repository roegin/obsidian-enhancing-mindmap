interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
  }

interface GanttTask {
    id: string;
    text: string;
    start_date: string;
    end_date: string;
    duration: number;
    progress: number;
    parent: string;
}

export function transformAndSyncData(mindMapRoot: MindMapNode[]): GanttTask[] {
    const ganttTasks: GanttTask[] = [];
    const today = new Date().toISOString().split('T')[0]; // 当天日期，格式 YYYY-MM-DD
  
    function traverseMindMapNode(node: MindMapNode, parentId: string | null) {
      const ganttTask: GanttTask = {
        id: node.id,
        text: node.text,
        start_date: "2024-03-10 11:00",  // 示例起始日期
        end_date: "2024-03-15 11:00",    // 示例结束日期
        duration: 1,
        progress: 0,
        parent: parentId || ''
      };

      //console.log('ganttTask',ganttTask)
  
      ganttTasks.push(ganttTask);
  
      if (node.children) {
        node.children.forEach(child => traverseMindMapNode(child, node.id));
      }
    }
  
    traverseMindMapNode(mindMapRoot[0], null);
  
    //console.log('ganttTasks',ganttTasks)
    return ganttTasks;
  }
  