export {} // 该行不能去掉，否则会提示类型不存在

declare global {
    interface Window {
        turnstile: any;
        turnstileSuccessCallback: any;
    }
}

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}
