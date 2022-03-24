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

import type { AnyFunction, Nullable } from '@mds-core/mds-types'

export const ServiceErrorDescriptorTypes = [
  'BadParamsError',
  'ConflictError',
  'DependencyMissingError',
  'NotFoundError',
  'ServiceException',
  'UnsupportedTypeError',
  'ValidationError',
  'ServiceUnavailable',
  'AlreadyPublishedError',
  'AuthorizationError',
  'InsufficientPermissionsError'
] as const

export type ServiceErrorDescriptorType = typeof ServiceErrorDescriptorTypes[number]

export type ServiceErrorDescriptor<E extends string> = Readonly<{
  isServiceError: true
  type: E
  message: string
  details?: unknown
}>

export interface ServiceErrorType<E extends string = ServiceErrorDescriptorType> {
  error: ServiceErrorDescriptor<E>
}

export interface ServiceResultType<R> {
  error: null
  result: R
}

/**
 * Over-the-wire, Javascript Buffers are serialized into JSON, but then not converted back into Javascript Buffers when deserializing.
 * This helper type aims to mitigate type differences that could arise between a ServiceClient and ServiceProvider.
 *
 * Note: Prettier doesn't like parens around nested ternaries in typedefs. This is a two-level-deep ternary, where the outer ternary
 * is checking if we've bottomed out (important for recursive typing), and the second ternary is where the main logic for the type lives.
 *
 * @example ```typescript
            type Foo = { x: string; y: { z: Buffer } }

            type SerializedFoo = SerializedBuffers<Foo>

            const example: Foo = { x: 'hi', y: { z: Buffer.from([1, 2, 3]) } }
            const exampleSerialized: SerializedFoo = { x: 'hi', y: { z: { type: 'Buffer', data: [1, 2, 3] } } }
            ```
 */
export type SerializedBuffers<T> = {
  [K in keyof T]: T[K] extends Buffer
    ? ReturnType<Buffer['toJSON']>
    : T[K] extends never
    ? never
    : SerializedBuffers<T[K]>
}

export type ServiceResponse<R> = ServiceErrorType | ServiceResultType<R>

export type ServiceClient<Service> = {
  [Method in keyof Service]: Service[Method] extends AnyFunction<infer R>
    ? (...args: Parameters<Service[Method]>) => Promise<SerializedBuffers<R>>
    : never
}

export type ServiceProvider<Service, RequestContext extends {}> = {
  [Method in keyof Service]: Service[Method] extends (...args: infer P) => infer R
    ? (
        context: RequestContext,
        ...args: {
          [K in keyof P]: undefined extends P[K] ? Nullable<SerializedBuffers<P[K]>> : SerializedBuffers<P[K]>
        }
      ) => Promise<ServiceResponse<R>>
    : never
}

export type ServiceProviderResponse<Service, RequestContext extends {}, Method extends keyof Service> = ReturnType<
  ServiceProvider<Service, RequestContext>[Method]
>

export interface ProcessController {
  start: () => Promise<void>
  stop: () => Promise<void>
}
