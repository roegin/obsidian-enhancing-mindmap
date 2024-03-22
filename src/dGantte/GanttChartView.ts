import { ItemView, WorkspaceLeaf } from "obsidian";
import { transformAndSyncData } from "./transformAndSyncData";
import { MindMapView } from "src/MindMapView";
import { INodeData } from "src/mindmap/INode";
import { getAPI, SListItem } from "obsidian-dataview";
import moment from 'moment';
// 功能: 引入 frappe-gantt 库
//@ts-ignore
import Gantt from '../frappe/index';
//@ts-ignore
import GanttSingleDay from './../frappeSingleDay/index';


interface MindMapNode {
    id: string;
    text: string;
    children?: MindMapNode[];
}
//
export class GanttChartView extends ItemView {
    gantt: any; // 保存 Gantt 实例的属性
    ganttSingleDay: any;
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
  
    getDisplayText() { //
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
    
        // 创建单日甘特图的SVG元素
        const svgElementSingleDay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElementSingleDay.id = 'gantt-svg-single-day';
        container.appendChild(svgElementSingleDay);

        // 创建普通甘特图的SVG元素
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.id = 'gantt-svg';
        container.appendChild(svgElement);
    
        // 获取思维导图数据
        /*
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
                date_format: 'YYYY-MM-DD-HH:mm',
                language: 'en',
                custom_popup_html: null
            });
        }
        */
        this.updateGanttChart()
        
    }
    


    getMindMapView(): MindMapView {
        // 此处的 `this.app` 应指向 Obsidian 应用程序实例
        // 可能需要通过插件实例或其他方式访问它
        return this.app.workspace.getActiveViewOfType(MindMapView);
    }
  
    getMindMapData(): INodeData[] {
        const mindMapView = this.getMindMapView();
        console.log('mindMapView',mindMapView)
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
        result.push({ id: node.id, text: node.text, children: node.children! ,...node});

        if (node.children) {
            node.children.forEach(child => {
                result = result.concat(this.traverseMindMap(child));
            });
        }

        //console.log('result',result)
        return result;
    }

      // 功能: 在甘特图视图中更新甘特图
    async updateGanttChart() {
        let ifSingle = this.ganttSingleDay 

        if(ifSingle){

            setTimeout(async () => {
                // 功能: 使用 Dataview API 获取包含 "#目标" 标签的列表项
                async function getTargetListItems(app: any): Promise<any[]> {
                    if (!app.plugins.enabledPlugins.has('dataview')) {
                        console.error('Dataview plugin is not enabled.');
                        return [];
                    }
                
                    const dataview = app.plugins.plugins.dataview.api;
                    let targetListItems: any[] = [];
                    // 匹配有时间和无时间的日期格式
                    const dateTimeRegex = /(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)/;
                
                    try {
                        const pages = dataview.pages();
                        for (let page of pages) {
                            if (!page.file || !page.file.lists) continue;
                            const lists = page.file.lists;
                            const filteredLists = lists.filter(list => {
                                const dateTimeMatch = dateTimeRegex.exec(list.text);
                                if (dateTimeMatch) {
                                    const startDateTimeStr = dateTimeMatch[1];
                                    const endDateTimeStr = dateTimeMatch[2];
                                    const format = startDateTimeStr.includes(':') ? "YYYY-MM-DD-HH:mm" : "YYYY-MM-DD";
                                    const startDateTime = moment(startDateTimeStr, format);
                                    const endDateTime = moment(endDateTimeStr, format);
                                    // 检查时间差是否在24小时内
                                    const duration = moment.duration(endDateTime.diff(startDateTime));
                                    return list.text.includes("#目标") && duration.asHours() <= 24;
                                }
                                return false;
                            }).map(list => {
                                // 提取文件名，去掉扩展名
                                const filename = list.path.split('/').pop().split('.').shift();
                                return {
                                    ...list,
                                    filename: filename
                                };
                            });
                            targetListItems.push(...filteredLists);
                        }
                    } catch (e) {
                        console.error('Error accessing Dataview API:', e);
                    }
                
                    return targetListItems;
                }

                /*!get方法介绍
                函数 `getTargetListItems` 返回一个数组，其中每个元素是一个对象，描述了一个特定的列表项。以下是返回对象的结构说明：

                    - `filename`: 字符串，表示列表项所在 Markdown 文件的名称（不包含扩展名）。
                    - `path`: 字符串，表示列表项所在 Markdown 文件的完整路径。
                    - `text`: 字符串，包含列表项的完整文本，可能包括特定标签和日期。
                    - `line`: 数字，表示列表项在其所在文件中的行号。
                    - `tags`: 数组，包含字符串类型的元素，每个元素是列表项中的一个标签。
                    - `position`: 对象，包含有关列表项在文件中位置的信息。
                    - `link`, `header`, `section`: 对象，提供列表项链接和上下文的详细信息。

                这些属性使得每个返回的列表项对象能够提供丰富的上下文信息，如所在文件的名称、位置和包含的标签等。
                */
                
                // 调用函数
                const singleDayTasks=await getTargetListItems(this.app)

                async function addDateInfoToListItems(listItems: any[]): Promise<any[]> {
                    const dateRegex = /(?:^|\s)(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)(?:\s|$)/;
                
                    return listItems.map(item => {
                        const dateMatch = dateRegex.exec(item.text);
                        const name=item.text
                        const start = dateMatch ? dateMatch[1] : null;
                        const end = dateMatch && dateMatch[2] ? dateMatch[2] : start; // 如果没有结束日期，使用开始日期
                        return { ...item, start, end ,name};
                    });
                }

                const tasksWithDateInfo = await addDateInfoToListItems(singleDayTasks);
                console.log('tasksWithDateInfo',tasksWithDateInfo)
                // 清空单日甘特图的容器
                const singleDayContainer = document.getElementById('gantt-svg-single-day');
                if (singleDayContainer) {
                    singleDayContainer.innerHTML = ''; // 清空容器中的内容
                }
                                
                this.ganttSingleDay = new GanttSingleDay('#gantt-svg-single-day', tasksWithDateInfo, {
                    header_height: 50,
                    column_width: 30,
                    step: 24,
                    view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                    bar_height: 20,
                    bar_corner_radius: 3,
                    arrow_curve: 5,
                    padding: 18,
                    view_mode: 'Day',
                    date_format: 'YYYY-MM-DD-HH:mm',
                    language: 'en',
                    custom_popup_html: null
                });
            }, 5000); // 设置延迟时间为1000毫秒（1秒钟）
        }else{
            // 功能: 使用 Dataview API 获取包含 "#目标" 标签的列表项
            async function getTargetListItems(app: any): Promise<any[]> {
                if (!app.plugins.enabledPlugins.has('dataview')) {
                    console.error('Dataview plugin is not enabled.');
                    return [];
                }
            
                const dataview = app.plugins.plugins.dataview.api;
                let targetListItems: any[] = [];
                // 匹配有时间和无时间的日期格式
                const dateTimeRegex = /(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)/;
            
                try {
                    const pages = dataview.pages();
                    for (let page of pages) {
                        if (!page.file || !page.file.lists) continue;
                        const lists = page.file.lists;
                        const filteredLists = lists.filter(list => {
                            const dateTimeMatch = dateTimeRegex.exec(list.text);
                            if (dateTimeMatch) {
                                const startDateTimeStr = dateTimeMatch[1];
                                const endDateTimeStr = dateTimeMatch[2];
                                const format = startDateTimeStr.includes(':') ? "YYYY-MM-DD-HH:mm" : "YYYY-MM-DD";
                                const startDateTime = moment(startDateTimeStr, format);
                                const endDateTime = moment(endDateTimeStr, format);
                                // 检查时间差是否在24小时内
                                const duration = moment.duration(endDateTime.diff(startDateTime));
                                return list.text.includes("#目标") && duration.asHours() <= 24;
                            }
                            return false;
                        }).map(list => {
                            // 提取文件名，去掉扩展名
                            const filename = list.path.split('/').pop().split('.').shift();
                            return {
                                ...list,
                                filename: filename
                            };
                        });
                        targetListItems.push(...filteredLists);
                    }
                } catch (e) {
                    console.error('Error accessing Dataview API:', e);
                }
            
                return targetListItems;
            }
            
            

            /*!get方法介绍
            函数 `getTargetListItems` 返回一个数组，其中每个元素是一个对象，描述了一个特定的列表项。以下是返回对象的结构说明：

                - `filename`: 字符串，表示列表项所在 Markdown 文件的名称（不包含扩展名）。
                - `path`: 字符串，表示列表项所在 Markdown 文件的完整路径。
                - `text`: 字符串，包含列表项的完整文本，可能包括特定标签和日期。
                - `line`: 数字，表示列表项在其所在文件中的行号。
                - `tags`: 数组，包含字符串类型的元素，每个元素是列表项中的一个标签。
                - `position`: 对象，包含有关列表项在文件中位置的信息。
                - `link`, `header`, `section`: 对象，提供列表项链接和上下文的详细信息。

            这些属性使得每个返回的列表项对象能够提供丰富的上下文信息，如所在文件的名称、位置和包含的标签等。
            */
            
            // 调用函数
            const singleDayTasks=await getTargetListItems(this.app)

            async function addDateInfoToListItems(listItems: any[]): Promise<any[]> {
                const dateRegex = /(?:^|\s)(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)-(\d{4}-\d{2}-\d{2}(?:-\d{2}:\d{2})?)(?:\s|$)/;
            
                return listItems.map(item => {
                    const dateMatch = dateRegex.exec(item.text);
                    const name=item.text
                    const start = dateMatch ? dateMatch[1] : null;
                    const end = dateMatch && dateMatch[2] ? dateMatch[2] : start; // 如果没有结束日期，使用开始日期
                    return { ...item, start, end ,name};
                });
            }

            const tasksWithDateInfo = await addDateInfoToListItems(singleDayTasks);
            console.log('singleDayTasks',singleDayTasks)
            
            this.ganttSingleDay = new GanttSingleDay('#gantt-svg-single-day', tasksWithDateInfo, {
                header_height: 50,
                column_width: 30,
                step: 24,
                view_modes: ['Quarter Day', 'Half Day', 'Day', 'Week', 'Month'],
                bar_height: 20,
                bar_corner_radius: 3,
                arrow_curve: 5,
                padding: 18,
                view_mode: 'Day',
                date_format: 'YYYY-MM-DD-HH:mm',
                language: 'en',
                custom_popup_html: null
            });
        }

        
        
        
        
        
  
        
        /*
        const container = this.containerEl.children[1];
        container.empty();
    

        //this.loadCSS(); // 加载 CSS
    
        // 创建 SVG 元素
        const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svgElement.id = 'gantt-svg';
        container.appendChild(svgElement);
        // 使用新数据重新渲染甘特图
        */
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
           // console.log('gantt-change',Gantt)
    
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
                date_format: 'YYYY-MM-DD-HH:mm',
                language: 'en',
                custom_popup_html: null
            });
        }
    }
  }