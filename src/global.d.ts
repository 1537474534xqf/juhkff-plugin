/*-------------------------------- 声明全局变量 --------------------------------*/
// AI真好用
declare const Bot: import("events").EventEmitter & {
    /**
   * 机器人统计信息
   */
    stat: {
        start_time: number;
        online: number;
    };

    /**
     * 当前 Bot 实例自身引用
     */
    bot: this;

    /**
     * 所有 Bot 实例集合
     */
    bots: Record<string, any>;

    /**
     * UIN 列表，包含当前在线 Bot 的 ID
     */
    uin: Array<string | number> & {
        toJSON(): string;
        toString(raw?: boolean): string;
        includes(value: string | number): boolean;
    };

    /**
     * 适配器信息
     */
    adapter: any[];

    /**
     * Express 应用实例
     */
    express: express.Express;

    /**
     * HTTP 服务器实例
     */
    server: http.Server;

    /**
     * WebSocket 服务器实例
     */
    wss: WebSocketServer;

    /**
     * WebSocket 处理函数映射
     */
    wsf: Record<string, (conn: WebSocket, req: express.Request) => void>;

    /**
     * 文件服务缓存
     */
    fs: Record<string, any>;

    /**
     * 构造函数
     */
    constructor();

    /**
     * HTTP 请求鉴权中间件
     */
    serverAuth(req: express.Request): void;

    /**
     * 获取服务器状态接口
     */
    serverStatus(req: express.Request): void;

    /**
     * 处理所有 HTTP 请求日志
     */
    serverHandle(req: express.Request): void;

    /**
     * 退出服务器接口
     */
    serverExit(req: express.Request): void;

    /**
     * WebSocket 连接处理
     */
    wsConnect(req: express.Request, socket: any, head: any): void;

    /**
     * 端口占用错误处理
     */
    serverEADDRINUSE(err: Error, https: boolean): Promise<void>;

    /**
     * 启动 HTTP/HTTPS 服务
     */
    serverLoad(https?: boolean): Promise<void>;

    /**
     * 加载 HTTPS 配置并启动
     */
    httpsLoad(): Promise<void>;

    /**
     * 启动整个 Bot 服务
     */
    run(): Promise<void>;

    /**
     * 将文件转为 URL 提供访问
     */
    fileToUrl(file: any, opts?: {
        name?: string;
        time?: number;
        times?: number;
    }): Promise<string>;

    /**
     * 发送文件响应
     */
    fileSend(req: express.Request): void;

    /**
     * 准备事件数据上下文
     */
    prepareEvent(data: any): void;

    /**
     * 触发事件
     */
    em(name: string, data: any): void;

    /**
     * 获取好友数组列表
     */
    getFriendArray(): Array<any>;

    /**
     * 获取好友 ID 列表
     */
    getFriendList(): Array<string | number>;

    /**
     * 获取好友 Map 映射
     */
    getFriendMap(): Map<string | number, any>;

    /**
     * 获取群组数组列表
     */
    getGroupArray(): Array<any>;

    /**
     * 获取群组 ID 列表
     */
    getGroupList(): Array<string | number>;

    /**
     * 获取群组 Map 映射
     */
    getGroupMap(): Map<string | number, any>;

    /**
     * 获取群成员 Map 映射
     */
    gml: Map<string | number, Map<string | number, any>>;

    /**
     * 获取群成员 Map 映射（别名）
     */
    get gml(): Map<string | number, Map<string | number, any>>;

    /**
     * 挑选好友对象
     */
    pickFriend(user_id: string | number, strict?: boolean): any;

    /**
     * 挑选群对象
     */
    pickGroup(group_id: string | number, strict?: boolean): any;

    /**
     * 挑选群成员对象
     */
    pickMember(group_id: string | number, user_id: string | number): any;

    /**
     * 发送好友消息
     */
    sendFriendMsg(bot_id: string | number, user_id: string | number, ...args: any[]): Promise<any>;

    /**
     * 发送群消息
     */
    sendGroupMsg(bot_id: string | number, group_id: string | number, ...args: any[]): Promise<any>;

    /**
     * 获取文本消息
     */
    getTextMsg(fnc: (data: any) => boolean): Promise<string>;

    /**
     * 获取 Master 用户的消息
     */
    getMasterMsg(): Promise<string>;

    /**
     * 向 Master 用户发送消息
     */
    sendMasterMsg(msg: any, bot_array?: Array<string | number>, sleep?: number): Record<string, any>;

    /**
     * 创建转发消息结构
     */
    makeForwardMsg(msg: any): { type: 'node', data: any };

    /**
     * 创建转发消息数组结构
     */
    makeForwardArray(msg?: any[], node?: any): { type: 'node', data: any };

    /**
     * 发送转发消息
     */
    sendForwardMsg(send: Function, msg: any): Promise<any[]>;

    /**
     * Redis 退出处理
     */
    redisExit(): Promise<boolean>;

    /**
     * 关闭 Bot 服务
     */
    exit(code?: number): void;

    /**
     * 重启 Bot 服务
     */
    restart(): void;
};
declare const redis: import('redis').RedisClientType;
declare const logger: import('chalk').ChalkInstance & {
    defaultLogger: import('log4js').Logger,
    commandLogger: import('log4js').Logger,
    errorLogger: import('log4js').Logger,
    trace(message: any, ...args: any[]): void,
    debug(message: any, ...args: any[]): void,
    info(message: any, ...args: any[]): void,
    warn(message: any, ...args: any[]): void,
    error(message: any, ...args: any[]): void,
    fatal(message: any, ...args: any[]): void,
    mark(message: any, ...args: any[]): void,
};
declare const plugin: {
    new(options: {
        name?: string;
        dsc?: string;
        handler?: {
            key: string;
            fn: (e: any) => void;
        };
        namespace?: string;
        event?: string;
        priority?: number;
        rule?: Array<{
            reg: string;
            fnc: string;
            event?: string;
            log?: boolean;
            permission?: "master" | "owner" | "admin" | "all";
        }>;
        task?: {
            name: string;
            cron: string;
            fnc: () => void;
            log?: boolean;
        } | Array<{
            name: string;
            cron: string;
            fnc: () => void;
            log?: boolean;
        }>
    }): {
        reply(msg?: string, quote?: boolean, data?: Record<string, any>): boolean | void;
        conKey(isGroup?: boolean): string;
        setContext(type: string, isGroup: boolean, time?: number, timeout?: string): void;
        getContext(type: string, isGroup: boolean): {
            reply?(msg: string, quote?: boolean, data?: Record<string, any>): void;
            self_id?: number;
            group_id?: number;
            user_id?: number;
            e?: any;
        } | undefined;
        finish(type: string, isGroup: boolean): void;
        awaitContext(...args: any[]): Promise<any>;
        resolveContext(context: any): void;
        renderImg(plugin: string, tpl: string, data: any, cfg?: any): Promise<string | Buffer | null>;
    }
};
// 不需要
// declare const Renderer: any;
declare const segment: {
    custom<T>(type: string, data: T): { type: string } & T,
    raw(data): { type: "raw", data },
    button(...data): { type: "button", data },
    markdown(data): { type: "markdown", data };
    image(file, name?): { type: "image", file, name };
    at(qq, name?): { type: "at", qq, name };
    record(file, name?): { type: "record", file, name };
    video(file, name?): { type: "video", file, name };
    file(file, name?): { type: "file", file, name };
    reply(id, text?, qq?, time?, seq?): { type: "reply", id, text, qq, time, seq };
}
