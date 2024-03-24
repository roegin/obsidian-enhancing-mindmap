import { ItemView, WorkspaceLeaf } from 'obsidian';


//@ts-ignore
import GanttHourly from './../FrappeHourly/index';
import { INodeData } from 'src/mindmap/INode';
import { MindMapView } from 'src/MindMapView';
import { transformAndSyncDataAtHourly } from './transformAndSyncDataAtHourly';
import Gantt from './../frappe/index';
import { DataViewModule } from 'src/dataView/dataViewModule';

interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}
//

export class GanttChartHourlyView extends ItemView {
    gantt: any; // 保存 Gantt 实例的属性
    refreshInterval: any;
    private updateTimer: any = null;


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

        // 确保只有一个定时器在运行
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

                // 设置定时器每五分钟刷新一次视图
        this.refreshInterval = setInterval(() => {
            this.updateGanttChart();
        }, 300000); // 300000 毫秒等于五分钟
        
    }

    async onClose() {
        // 清除定时器
        clearInterval(this.refreshInterval);
        clearInterval(this.updateTimer);
      }
    



      async updateGanttChart() {
        // 取消之前的定时器（如果存在）
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
            this.updateTimer = null;
        }


        const updateLogic = async () => {
            // 在更新视图前获取当前的滚动位置
            let currentScrollPosition
            if(this.gantt){
                currentScrollPosition = {
                    x: this.gantt.getScrollPositionX(),
                    y: this.gantt.getScrollPositionY()
                };
            }



            // 从 Data View 获取目标列表项
            let targetListItems = await DataViewModule.getTargetListItems(this.app);



            // 过滤掉当前脑图文件的数据
            // 获取当前脑图文件的路径
            const currentFilePath = this.getMindMapView()?.file?.path;
            if(currentFilePath){
                //console.log('targetListItems-currentFilePath',targetListItems)
                targetListItems = targetListItems.filter(item => item.path !== currentFilePath);
            }
            
            // 过滤出昨天、今天、明天的任务
            const filteredTasks = await DataViewModule.filterTasksForTargetDays(DataViewModule.addDateInfoToListItems(targetListItems));

            const filteredTasksToFull = DataViewModule.ensureFullDateTimeForTasks(filteredTasks)
            console.log('targetListItems',targetListItems)
            console.log('filteredTasks',filteredTasksToFull)

            // 从思维导图获取数据
            const mindMapData = this.getMindMapData();


            const mindMapGanttData = transformAndSyncDataAtHourly(mindMapData);
           // console.log('mindMapGanttData',mindMapGanttData)

            // 合并两组数据，DataViewModule 数据在前
            const combinedGanttData = [...filteredTasksToFull, ...mindMapGanttData];


            // 检查是否有任务数据
            if (combinedGanttData.length > 0) {
                // 清空甘特图容器
                const container = document.getElementById('gantt-svg-hourly');
                if (container) {



                    container.innerHTML = '';
                }

                

                // 初始化并渲染甘特图
                this.gantt = new GanttHourly('#gantt-svg-hourly', combinedGanttData, {
                    view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month', 'Fifteen Minutes'],
                    view_mode: 'Quarter Day',
                    date_format: 'YYYY-MM-DD-HH:mm',
                    language: 'en',
                    custom_popup_html: null
                });


            }

            // 视图更新后，使用之前记录的滚动位置来恢复状态
            if(this.gantt&&(currentScrollPosition.x&&currentScrollPosition.y)){
                this.gantt.set_scroll_position(currentScrollPosition.x, currentScrollPosition.y);
            }

                        // ...剩余的更新逻辑
        };

        // 立即执行一次更新
        await updateLogic();

        // 设置一个五秒后的延时，再次执行更新
        this.updateTimer = setTimeout(async () => {
            await updateLogic();
        }, 5000); // 5000 毫秒 = 5 秒

    }

    getMindMapData(): INodeData[] {
        const mindMapView = this.getMindMapView();
        // console.log('mindMapView',mindMapView) 
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


