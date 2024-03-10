declare module 'domtoimage' {
    export function toPng(node: HTMLElement): Promise<string>;
    // 添加其他需要的导出声明
}
