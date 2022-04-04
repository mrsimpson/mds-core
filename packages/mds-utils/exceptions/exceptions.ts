/**
 * Copyright 2019 City of Los Angeles
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { hasOwnProperty } from '../hasOwnProperty'

export abstract class MdsError extends Error {
  public constructor(public name: string, public reason?: string, public info?: unknown) {
    super(reason)
    Error.captureStackTrace(this, MdsError)
  }
}

const reason = (error?: unknown) => {
  if (error) {
    if (typeof error === 'object') {
      if (hasOwnProperty(error, 'message') && typeof error.message === 'string') {
        return error.message
      }
    }

    if (typeof error === 'string') {
      return error
    }

    return JSON.stringify(error)
  }
}

/* istanbul ignore next */
export class ServerError extends MdsError {
  public constructor(error?: unknown, public info?: unknown) {
    super('ServerError', reason(error), info)
  }
}

/* istanbul ignore next */
export class NotFoundError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('NotFoundError', reason(error), info)
  }
}

/* istanbul ignore next */
export class ConflictError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('ConflictError', reason(error), info)
  }
}

/* istanbul ignore next */
export class AuthorizationError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('AuthorizationError', reason(error), info)
  }
}

/* istanbul ignore next */
export class RuntimeError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('RuntimeError', reason(error), info)
  }
}

export class IndexError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('IndexError', reason(error), info)
  }
}

/* istanbul ignore next */
export class ValidationError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('ValidationError', reason(error), info)
  }
}

/* istanbul ignore next */
export class BadParamsError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('BadParamsError', reason(error), info)
  }
}

export class AlreadyPublishedError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('AlreadyPublishedError', reason(error), info)
  }
}

export class UnsupportedTypeError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('UnsupportedTypeError', reason(error), info)
  }
}

export class ParseError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('ParseError', reason(error), info)
  }
}

export class DependencyMissingError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('DependencyMissingError', reason(error), info)
  }
}

export class InsufficientPermissionsError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('InsufficientPermissionsError', reason(error), info)
  }
}

export class ClientDisconnectedError extends MdsError {
  public constructor(error?: Error | string, public info?: unknown) {
    super('ClientDisconnectedError', reason(error), info)
  }
}
