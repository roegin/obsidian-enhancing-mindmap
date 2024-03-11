import { ItemView, WorkspaceLeaf } from "obsidian";
import { transformAndSyncData } from "./transformAndSyncData";
import { MindMapView } from "src/MindMapView";
import { INodeData } from "src/mindmap/INode";
// 功能: 引入 frappe-gantt 库
//@ts-ignore
import Gantt from '../frappe/index';



interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}
//
export class GanttChartView extends ItemView {
    gantt: any; // 保存 Gantt 实例的属性
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        /*
        this.gantt = new Gantt(this.containerEl, [], {
            on_click: (task:any) => {
                console.log(task);
            },
            // ...其他配置选项
        });
        */
        
    }
  
    getViewType() {
        return "gantt-chart-view";
    }
  
    getDisplayText() {
        return "Gantt Chart";
    }

    // 功能: 动态加载CSS文件
    loadCSS(): void {
        const link = document.createElement('link');
        link.href = 'node_modules/frappe-gantt/dist/frappe-gantt.css';
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      
      /*
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        
        this.loadCSS(); // 加载 CSS
    
        // 创建一个简单的 SVG 示例
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("width", "200");
        svgElement.setAttribute("height", "200");
        svgElement.style.border = "1px solid black"; // 为了可视化 SVG 边界
    
        // 创建一个简单的矩形
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "100");
        rect.setAttribute("height", "100");
        rect.setAttribute("x", "50");
        rect.setAttribute("y", "50");
        rect.setAttribute("fill", "green");
    
        // 将矩形添加到 SVG 中
        svgElement.appendChild(rect);
    
        // 将 SVG 元素添加到容器中
        container.appendChild(svgElement);
    }
    */
    
    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
    

        //this.loadCSS(); // 加载 CSS
    
        // 创建 SVG 元素
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.id = 'gantt-svg';
        container.appendChild(svgElement);
    
        // 获取思维导图数据
        const mindMapData = this.getMindMapData(); 
        if (mindMapData.length > 0) {
            // 转换数据为甘特图格式
            const ganttData = transformAndSyncData(mindMapData); 
            console.log('ganttData2', ganttData);

            var tasks = [
                {
                  id: 'Task 1',
                  name: 'Redesign website',
                  start: '2016-12-28',
                  end: '2016-12-31',
                  progress: 20,
                  dependencies: 'Task 2, Task 3'
                },
                
              ]
            console.log('gantte',Gantt)
    
            // 初始化并渲染甘特图
            this.gantt = new Gantt('#gantt-svg', ganttData, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Day',
                date_format: 'YYYY-MM-DD',
                language: 'en',
                custom_popup_html: null
            });
        }
        
    }
    


    getMindMapView(): MindMapView {
        // 此处的 `this.app` 应指向 Obsidian 应用程序实例
        // 可能需要通过插件实例或其他方式访问它
        return this.app.workspace.getActiveViewOfType(MindMapView);
    }
  
    getMindMapData(): INodeData[] {
        const mindMapView = this.getMindMapView();
        //console.log('mindMapView',mindMapView)
        if (!mindMapView) {
            return [];
        }

        const root =mindMapView.mindmap.data
        // 假设 `getMindMapView` 返回当前激活的脑图视图
        //const  = mindMapView.getRootNode(); // 获取脑图的根节点
        return this.traverseMindMap(root);
    }

    traverseMindMap(node: INodeData): MindMapNode[] {
        // 遍历脑图节点，并构建需要的数据结构
        let result: MindMapNode[] = [];
        result.push({ id: node.id, text: node.text, children: node.children! });

        if (node.children) {
            node.children.forEach(child => {
                result = result.concat(this.traverseMindMap(child));
            });
        }

        //console.log('result',result)
        return result;
    }
  }