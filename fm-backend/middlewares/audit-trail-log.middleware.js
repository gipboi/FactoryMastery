import AuditTrail from "../schemas/auditTrail.schema.js";

export function auditTrailLog(req, res, next) {
  const { method, url, body } = req;
  let originalSend = res.send;
  let responseData;

  res.send = function (data) {
    responseData = data;
    res.send = originalSend;
    return res.send(data);
  };

  next();

  res.on("finish", () => {
    //*TODO: Add json library to avoid leak of memory db
    const status = res.statusCode;
    const request = JSON.stringify(body);
    const response = JSON.stringify(responseData);

    // AuditTrail.create({
    //   method,
    //   route: url,
    //   status,
    //   request,
    //   response,
    // }).catch((error) => {
    //   console.error("AuditTrail logging error:", error);
    // });
  });
}
