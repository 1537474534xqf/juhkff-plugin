import { Service } from "@volcengine/openapi";

/**
 *
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
    host: "visual.volcengineapi.com",
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

  const rr = await fetchApi(body, { timeout: 60000 });

  return rr;
}
