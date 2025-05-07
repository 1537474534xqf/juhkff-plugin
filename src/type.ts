
export type CronExpression = string;

export type RequestBody = Record<string, any>;

export type RequestOptions = {
    method: "POST" | "GET" | "PUT" | "DELETE";
    headers: Record<string, string>;
    body: RequestBody | string;
}

export type Request = {
    url: string;
    options: RequestOptions;
};


export type SimpleJMsg = {
    id?: number,
    text?: string,
    data?: string,
    type: string,
} & Record<string, any>;

export type Role = "user" | "assistant" | "system";

export type ComplexJMsg = {
    sourceImg?: string[],
    sourceText?: string,
    img?: string[],
    text?: string,
    notProcessed?: (SimpleJMsg & { url?: string })[],
}

export type RequestMsg = {
    texts: string,
    images: string[],
    content: { type: string, text?: string, url?: string }[],
}

export type HelpType = {
    name?: string,
    type: "active" | "passive" | "group" | "sub",
    dsc?: string,
    enable?: boolean,
}