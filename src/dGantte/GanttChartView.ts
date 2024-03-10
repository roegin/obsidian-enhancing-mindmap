import { ItemView, WorkspaceLeaf } from "obsidian";
import { transformAndSyncData } from "./transformAndSyncData";
import { MindMapView } from "src/MindMapView";
import { INodeData } from "src/mindmap/INode";
import "./dhtmlxgantt.js";  // 确保路径是正确的
import "./dhtmlxgantt.css"; // 确保路径是正确的


interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}
//
export class GanttChartView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        
    }
  
    getViewType() {
        return "gantt-chart-view";
    }
  
    getDisplayText() {
        return "Gantt Chart";
    }

    // 功能: 动态加载CSS文件
    loadCSS(path: string) {
        const link = document.createElement('link');
        link.href = path;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        console.log('link',link)
    }
    
    async onOpen() {
     
            //console.log('打开甘特图')
        const container = this.containerEl.children[1];
        container.empty();

        this.loadCSS('dhtmlxgantt.css');

        // 假设 getMindMapData() 是一个函数，用来获取思维导图的数据
        const mindMapData = this.getMindMapData(); 
        console.log('mindMapData',mindMapData)
        if (mindMapData.length > 0) {
            const ganttData = transformAndSyncData(mindMapData); // 只传递第一个元素
            console.log('ganttData',ganttData)
            gantt.config.date_format = "%Y-%m-%d %H:%i";
            // 在这里初始化你的甘特图
                    // 初始化甘特图
            gantt.init(container);
            console.log('container')
            gantt.parse({data:ganttData});  // ganttData 是您的数据
            console.log('parse')
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