import { Service } from "@volcengine/openapi";


/**
 * 原始请求方式的封装，获取服务api
 * @param {*} host
 * @param {*} accessKeyId 
 * @param {*} secretAccessKey 
 * @param {*} method 
 * @param {*} body 
 * @param {*} action 
 * @param {*} version 
 * @param {*} region 
 * @param {*} service 
 * @returns 
 */
export function getServiceApi(
  host,
  accessKeyId,
  secretAccessKey,
  method,
  action,
  version,
  region,
  service
) {
  const serviceApi = new Service({
    host: host,
    serviceName: service,
    region: region,
    accessKeyId: accessKeyId,
    secretKey: secretAccessKey,
  });

  const fetchApi = serviceApi.createAPI(action, {
    Version: version,
    method: method,
    contentType: "json",
  });

  return fetchApi;
}

/**
 * 原始请求方式，不推荐使用，最好封装一层
 * @param {*} host
 * @param {*} accessKeyId
 * @param {*} secretAccessKey
 * @param {*} method
 * @param {*} body
 * @param {*} action
 * @param {*} version
 * @param {*} region
 * @param {*} service
 */
export async function fetchDouBao(
  host,
  accessKeyId,
  secretAccessKey,
  method,
  body,
  action,
  version,
  region,
  service
) {
  const serviceApi = new Service({
    host: host,
    serviceName: service,
    region: region,
    accessKeyId: accessKeyId,
    secretKey: secretAccessKey,
  });

  const fetchApi = serviceApi.createAPI(action, {
    Version: version,
    method: method,
    contentType: "json",
  });

  const rr = await fetchApi(body, { timeout: 0 });

  return rr;
}
