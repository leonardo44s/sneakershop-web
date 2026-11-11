// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = errorHandler;
