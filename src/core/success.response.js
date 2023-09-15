"use strict";

const { ReasonPhrases, StatusCodes } = require("../utils/httpStatusCode");

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super({ message, metadata });
  }
}

class CREATED extends SuccessResponse {
  constructor({
    options = {},
    message,
    metadata,
    statusCode = StatusCodes.OK,
    reasonStatusCode = ReasonPhrases.OK,
  }) {
    super({ message, metadata, statusCode, reasonStatusCode });
    this.options = options;
  }
}

module.exports = {
  OK,
  SuccessResponse,
  CREATED,
};
