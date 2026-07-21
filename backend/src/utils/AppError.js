// Erro de aplicação "esperado" (erro de negócio/validação), em oposição a
// erros inesperados (bugs). Carrega um statusCode HTTP, o que permite ao
// tratador global responder com o código certo sem adivinhar.

export class AppError extends Error {
  /**
   * @param {string} message  Mensagem legível para o cliente
   * @param {number} statusCode  Código HTTP (400, 404, 409...). Padrão: 400
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    // Marca como erro "operacional" (previsto), diferenciando de bugs reais.
    this.isOperational = true;

    // Mantém o stack trace limpo, apontando para onde o erro foi lançado.
    Error.captureStackTrace(this, this.constructor);
  }
}