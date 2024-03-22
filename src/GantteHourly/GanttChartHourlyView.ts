import { ItemView, WorkspaceLeaf } from 'obsidian';


//@ts-ignore
import GanttHourly from './../FrappeHourly/index';
import { INodeData } from 'src/mindmap/INode';
import { MindMapView } from 'src/MindMapView';
import { transformAndSyncDataAtHourly } from './transformAndSyncDataAtHourly';
import Gantt from './../frappe/index';

interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}
//

export class GanttChartHourlyView extends ItemView {
    gantt: any; // 保存 Gantt 实例的属性

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }
  
    getViewType() {
        return "gantt-chart-hourly-view";
    }
  
    getDisplayText() {
        return "Hourly Gantt Chart";
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        // 创建单日甘特图的 SVG 元素
        const svgElementSingleDay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElementSingleDay.id = 'gantt-svg-hourly';
        container.appendChild(svgElementSingleDay);

        this.updateGanttChart()
    }

    // 功能: 加载单日甘特图的任务数据
    async loadSingleDayTasks(): Promise<any[]> {
        // 实现加载数据的逻辑
        // ...
        return []; // 返回模拟的任务数据
    }

    async updateGanttChart() {
        // 获取思维导图数据
        const mindMapData = this.getMindMapData(); 
        if (mindMapData.length > 0) {
            // 转换数据为甘特图格式
            const ganttData = transformAndSyncDataAtHourly(mindMapData); 
            console.log('ganttData2', ganttData);


            // 初始化并渲染甘特图
            this.gantt = new GanttHourly('#gantt-svg-hourly', ganttData, {

                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month','Fifteen Minutes'],

                view_mode: 'Quarter Day',
                date_format: 'YYYY-MM-DD-HH:mm',
                language: 'en',
                custom_popup_html: null
            });
        }

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

    getMindMapView(): MindMapView {
        // 此处的 `this.app` 应指向 Obsidian 应用程序实例
        // 可能需要通过插件实例或其他方式访问它
        return this.app.workspace.getActiveViewOfType(MindMapView);
    }

    traverseMindMap(node: INodeData): MindMapNode[] {
        // 遍历脑图节点，并构建需要的数据结构
        let result: MindMapNode[] = [];
        result.push({ id: node.id, text: node.text, children: node.children! ,...node});

        if (node.children) {
            node.children.forEach(child => {
                result = result.concat(this.traverseMindMap(child));
            });
        }

        //console.log('result',result)
        return result;
    }

}


