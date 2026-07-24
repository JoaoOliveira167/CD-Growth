// Erro de aplicação "esperado" (validação/negócio), em oposição a bugs.
// Carrega statusCode HTTP e, opcionalmente, uma lista detalhada de erros
// de campo — permitindo que o frontend destaque cada input inválido.

export class AppError extends Error {
  /**
   * @param {string} message      Mensagem principal, legível para o cliente.
   * @param {number} statusCode   Código HTTP (400, 404, 409...). Padrão: 400.
   * @param {Array<object>} details  Lista opcional [{ field, message }].
   */
  constructor(message, statusCode = 400, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // marca como erro previsto, não bug

    Error.captureStackTrace(this, this.constructor);
  }
}