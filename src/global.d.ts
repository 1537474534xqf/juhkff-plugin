/*-------------------------------- 声明全局变量 --------------------------------*/
// AI真好用

// 原本以代理形式访问，这里合并到 Bot 上
declare type util = {
    // 日志工具
    makeLogID(id?: string): string;
    makeLog(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'mark' | 'fatal', msg: any, id?: string | boolean, force?: boolean): void;

    // 文件系统
    fsStat(path: string, opts?: any): Promise<import('node:fs').Stats | false>;
    mkdir(dir: string, opts?: any): Promise<boolean>;
    rm(file: string, opts?: any): Promise<boolean>;
    glob(path: string, opts?: { recursive?: boolean; force?: boolean }): Promise<string[]>;
    download(url: string, file?: string, opts?: any): Promise<{ url: string; file: string; buffer: Buffer }>;
    fileType(data: { file: string | Buffer; name?: string }, opts?: any): Promise<{
        name: string;
        url: string;
        buffer: Buffer;
        type?: { ext: string; mime: string };
        md5?: string;
    }>;
    Buffer(data: any, opts?: { size?: number; file?: boolean; http?: boolean }): Promise<string | Buffer>;

    // 数据结构
    makeMap(parent_map: any, parent_key: string, map: Map<any, any>): Map<any, any>;
    setMap(map: Map<any, any>, set: Function, key: any, value: any): Promise<Map<any, any>>;
    delMap(map: Map<any, any>, del: Function, key: any): Promise<boolean>;
    importMap(dir: string, map: Map<any, any>): Promise<Map<any, any>>;
    getMap(dir: string): Promise<Map<any, any>>;

    // 字符串/对象处理
    StringOrNull(data: any): string;
    StringOrBuffer(data: any, base64?: boolean): string | Buffer;
    getCircularReplacer(): (key: string, value: any) => any;
    String(data: any, opts?: any): string;
    Loging(data: any, opts?: any): string;

    // 命令行工具
    exec(cmd: string | string[], opts?: { quiet?: boolean; encoding?: string }): Promise<{
        error?: Error;
        stdout: string | Buffer;
        stderr: string | Buffer;
        raw: { stdout: Buffer; stderr: Buffer };
    }>;
    cmdPath(cmd: string, opts?: any): Promise<string | false>;
    cmdStart(cmd: string, args?: string[], opts?: any): import("child_process").ChildProcess;

    // 时间/异步
    getTimeDiff(time1?: number, time2?: number): string;
    promiseEvent(event: import("events").EventEmitter, resolve: string, reject?: string, timeout?: number): Promise<any>;
    sleep(time: number): Promise<typeof Bot.sleepTimeout>;
    sleep(time: number, promise: Promise<any>): Promise<any>;
    debounce<T extends (...args: any[]) => any>(func: T, time?: number): T & { promise?: Promise<any> };
};

declare type E = {
    adapter_id: string,
    adapter_name: string,
    bot: {
        adapter: {
            echo: any,
            id: string,
            name: string,
            path: string,
            timeout: number
        },
        get avatar(): string,
        bkn: number,
        clients: any,
        cookies: { [key: string]: string },
        fl: Map<number, { age: number, birthday_day: number, birthday_month: number, birthday_year: number, category_id: number, email: string, level: number, nickname: string, phone_num: string, remark: string, sex: "male" | "female" | "unknown", user_id: number }>,
        getCookies: Function,
        getCsrfToken: Function,
        getFriendArray: Function,
        getFriendList: Function,
        getFriendMap: Function,
        getGroupArray: Function,
        getGroupList: Function,
        getGroupMap: Function,
        getGroupMemberMap: Function,
        getSystemMsg: Function,
        gl: Map<number, { group_all_shut: number, group_id: number, group_name: string, group_remark: string, max_member_count: number, member_count: number }>,
        gml: Map<number, Map<number, { age: number, area: string, card: string, card_changeable: boolean, group_id: number, is_robot: boolean, join_time: number, last_sent_time: number, level: string, nickname: string, qq_level: number, role: "owner" | "member" | string, sex: "male" | "female" | "unknown", shut_up_timestamp: number, title: string, title_expire_time: number, unfriendly: boolean, user_id: number }>>,
        guild_info: any,
        info: {
            nickname: string,
            user_id: number
        },
        model: "TRSS Yunzai" | string,
        get nickname(): string,
        pickFriend: Function,
        pickGroup: Function,
        pickMember: Function,
        pickUser: Function,
        removeEssenceMessage: Function,
        request_list: any[],
        sendApi: Function,
        setAvatar: Function,
        setEssenceMessage: Function,
        setFriendAddRequest: Function,
        setGroupAddRequest: Function,
        setNickname: (nickname: string) => void,
        setProfile: Function,
        stat: {
            good: boolean,
            lost_pkt_cnt: Function,
            lost_times: Function,
            online: boolean,
            recv_msg_cnt: Function,
            recv_pkt_cnt: Function,
            sent_msg_cnt: Function,
            sent_pkt_cnt: Function,
            start_time: number,
            stat: Object,
        },
        get uin(): number,
        version: {
            app_name: string,
            app_version: string,
            id: string,
            name: string,
            protocol_version: string,
            get version(): string
        },
        ws: WebSocket
    },
    font: number,
    group_id: number,
    group_name: string,
    isGroup: boolean,
    get isGs(): boolean,
    get isSr(): boolean,
    logFnc: string,
    logText: string,
    /** 随用随加 */
    message: {
        type: "at" | "record" | "reply" | "text" | "image" | "file" | "face" | "poke",
        text?: string,
        qq?: number | "all",
        file?: string,
        id?: number,
        time?: number
    },
    message_format: "array" | string,
    message_id: number,
    message_seq: number,
    message_type: "group" | string,
    msg: string,
    post_type: "message" | string,
    raw: string,
    raw_message: string,
    real_id: number,
    real_seq: string,
    recall: Function,
    reply: (msg?: string, quote?: boolean, data?: any) => Promise<void>,
    runtime: any,
    self_id: number,
    sender: {
        card: string,
        nickname: string,
        role: "owner" | "member" | string,
        user_id: number
    },
    sub_type: "normal" | string,
    time: number,
    user_id: number
} & { [key: string]: any };

declare const Bot: import("events").EventEmitter & util & {
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
    getFriendMap(): Map<string | number, { bot_id: number;[key: string]: any }>;

    /**
     * 获取好友 Map 映射（别名）
     */
    get fl(): Map<string | number, { bot_id: number;[key: string]: any }>;

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
     * 获取群组 Map 映射（别名）
     */
    get gl(): Map<string | number, { bot_id: number;[key: string]: any }>;

    /**
     * 获取群成员 Map 映射（别名）
     */
    get gml(): Map<number, { bot_id: number } & Map<string | number, any>>;

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
        setContext(type: string, isGroup?: boolean, time?: number, timeout?: string): void;
        getContext(type: string, isGroup?: boolean): any;
        finish(type: string, isGroup: boolean): void;
        awaitContext(isGroup?: boolean, time?: number, timeout?: string): Promise<boolean | E>;
        resolveContext(context: any): void;
        renderImg(plugin: string, tpl: string, data: any, cfg?: any): Promise<string | Buffer | null>;
        e: E
    },
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
