export function filterExceptionMiddleware(error, req, res, next) {
  console.error("filterExceptionMiddleware", JSON.stringify(error));
  console.error("filterExceptionMiddleware ~ error ~ detail", error);

  if (!error) {
    next();
  }

  if (res.headersSent) {
    return;
  }

  res &&
    res.status &&
    res.status(error?.status ?? error?.statusCode ?? 500).send({
      message: error?.response?.message ?? error?.message ?? "",
    });
}
