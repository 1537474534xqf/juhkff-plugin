
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