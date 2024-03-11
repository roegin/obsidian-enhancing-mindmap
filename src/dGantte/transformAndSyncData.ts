interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
  }

interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
   // duration: number;
    progress: number;
    parent: string;
    custom_class?:string;
}

export function transformAndSyncData(mindMapRoot: MindMapNode[]): GanttTask[] {
    const ganttTasks: GanttTask[] = [];
    const today = new Date().toISOString().split('T')[0]; // 当天日期，格式 YYYY-MM-DD
  
    function traverseMindMapNode(node: MindMapNode, parentId: string | null) {
      const ganttTask: GanttTask = {
        id: node.id,
        name: node.text,
        start: "2024-03-10",  // 示例起始日期
        end: "2024-03-15",    // 示例结束日期
       // duration: 1,
        progress: 20,
        parent: parentId || '',
        //custom_class: 'bar-milestone' // optional
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
  