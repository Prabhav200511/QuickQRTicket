function errorHandler(err, req, res, next) {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    message: err.message || 'Something went wrong!',
  });
}

module.exports = errorHandler;
