import crypto from "crypto";


/**
 * 鉴权，包括生成签名过程
 * @param {string} x_date 遵循 ISO 8601 格式的 UTC+0 时间，精度为秒。格式为 YYYYMMDD'T'HHMMSS'Z' 。与请求头公共参数 X-Date 的取值相同
 * @param {string} accessKeyId accessKeyId
 * @param {string} secretAccessKey secretAccessKey
 * @param {Object.<string, string>} headers 必要的请求头 字典类型
 * @param {"GET" | "POST"} method 请求方法
 * @param {string} uri 请求地址，不包含查询部分（?xxx=yyy）
 * @param {Object.<string, string>} query 请求查询部分 字典类型
 * @param {Object} [body={}] 请求体，空即为{}
 */
export function generateAuthoration(x_date, accessKeyId, secretAccessKey, headers, method, uri, query, body, region, service) {
    // 步骤一：获取访问密钥
    // pass
    // 步骤二：创建规范请求（CanonicalRequest）
    var HTTPRequestMethod = method;
    var CanonicalURI = undefined;
    var CanonicalQueryString = undefined;
    var CanonicalHeaders = undefined;
    var SignedHeaders = undefined;
    var HexEncodeResult = undefined;

    //规范化 URI，即请求地址的资源路径部分经过编码后的结果
    CanonicalURI = encodeURI(uri);

    /**
     * 使用 UTF-8 字符集按照 RFC3986 规范对查询字符串的每个参数名称和参数值进行 URL 编码，例如空格会编码为%20。
     * 将参数按照参数名称的 ASCII 升序排序。
     * 使用等号（=）连接参数名称和参数值。
     * 多个参数之间使用 & 连接。
     */
    CanonicalQueryString = Object.keys(query)
        .sort()
        .map(function (key) {
            return encodeURIComponent(key) + "=" + encodeURIComponent(query[key]);
        })
        .join("&");

    /**
     * 生成方法如下所示：
     * 将所有需要签名的 Header 名称转换为小写。
     * 将 Header 的值去除首尾空格。
     * 将以上步骤的结果，即 Header 的名称和值，以冒号（:）连接，并在尾部添加换行符，组成规范化请求头。
     */
    CanonicalHeaders = Object.keys(headers)
        .sort()
        .map(function (key) {
            return key.toLowerCase() + ":" + headers[key].trim();
        })
        .join("\n");

    /**
     * 参与签名的 Header，与 CanonicalHeaders 中包含的 Header 一一对应，用于指明哪些 Header 参与签名计算
     * 生成方法如下所示：
     * 将所有需要签名的 Header 名称转换为小写。
     * 以分号（;）连接小写的 Header 名称。
     */
    SignedHeaders = Object.keys(headers)
        .sort()
        .map(function (key) {
            return key.toLowerCase();
        })
        .join(";");

    /**
     * 使用 SHA256 作为哈希函数，将 HTTP 请求 Body 中的数据作为哈希函数的输入，计算哈希值，并对哈希值进行小写十六进制编码
     * 由于 GET 请求不包含请求 Body，即 RequestPayload 为空字符串，因此 HexEncode(Hash(RequestPayload)) 的取值固定为 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
     */
    if (HTTPRequestMethod == "GET") {
        HexEncodeResult = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    } else {
        HexEncodeResult = crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex");
    }

    var CanonicalRequest =
        HTTPRequestMethod + '\n' +
        CanonicalURI + '\n' +
        CanonicalQueryString + '\n' +
        CanonicalHeaders + '\n\n' +
        SignedHeaders + '\n' +
        HexEncodeResult


    // 步骤三：创建待签名字符串（StringToSign）
    // 签名算法。目前火山引擎仅支持 HMAC-SHA256 算法。
    var Algorithm = "HMAC-SHA256";
    // 请求发起的时间， 遵循 ISO 8601 格式的 UTC+0 时间，精度为秒。格式为 YYYYMMDD'T'HHMMSS'Z' 。与请求头公共参数 X-Date 的取值相同。
    var RequestDate = x_date;
    /* 
    凭证范围，格式为 {YYYYMMDD}/{region}/{service}/request
    {YYYYMMDD}：请求头公共参数 X-Date 中的日期。
    {region}：请求的地域。当产品按 Region 提供服务时，该参数值为您实际要访问的 Region。如果产品不按 Region 提供服务，该参数值可为任一 Region。
    {service}：请求的服务名。您可以查看不同云产品的 API 文档，获取服务名。
    request：固定取值为 request
    */
    var CredentialScope =
        RequestDate.substring(0, 8) + '/' +
        region + '/' +
        service + '/' +
        'request';
    // 使用 SHA256 作为哈希函数，将上一步中创建的规范请求（CanonicalRequest）作为哈希函数的输入，计算哈希值，并对哈希值进行小写十六进制编码
    var Hash = function (data) {
        return crypto.createHash("sha256").update(data).digest("hex");
    }(CanonicalRequest);
    var StringToSign =
        Algorithm + '\n' +
        RequestDate + '\n' +
        CredentialScope + '\n' +
        Hash;

    // 步骤四：派生签名密钥（kSigning）
    /*
    将 Secret Access Key 作为 String 类型的密钥，将 Date 的取值作为哈希函数的输入。其中，Date 的取值与 CredentialScope 中的 {YYYYMMDD} 部分
    相同。在本文的 GET 和 POST 请求示例中，Secret Access Key 为 WkRZeE1EQmxPVGhsWWpWak5HVmtNbUUxTXpZeU9UVXlOMlE1TmpZeVlqTQ==，Date 为 
    20250329，则计算得出的哈希值为 069b1da2ba9c0ecbd8e8aaf2a5742696ebc22f3fe95a649983d31b433ba94ff3
    */
    var kDate = crypto.createHmac("sha256", secretAccessKey).update(RequestDate.substring(0, 8)).digest();
    var kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
    var kService = crypto.createHmac("sha256", kRegion).update(service).digest();
    var kSigning = crypto.createHmac("sha256", kService).update("request").digest();

    // 步骤五：计算签名（Signature）
    var Signature = crypto.createHmac("sha256", kSigning).update(StringToSign).digest("hex");

    return Algorithm + ' ' +
        'Credential=' + accessKeyId + '/' + CredentialScope + ', ' +
        'SignedHeaders=' + SignedHeaders + ', ' +
        'Signature=' + Signature
}