// Wrapper para controllers assíncronos. Sem ele, todo controller async
// precisaria de try/catch para não engolir erros de Promises. Aqui,
// qualquer rejeição é capturada e encaminhada ao errorHandler via next().

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};