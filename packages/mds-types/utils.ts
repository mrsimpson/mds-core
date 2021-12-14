export const Enum = <T extends string>(...keys: T[]) =>
  Object.freeze(
    keys.reduce((e, key) => {
      return { ...e, [key]: key }
    }, {}) as { [K in T]: K }
  )

export const isEnum = (enums: { [key: string]: string }, value: unknown) =>
  typeof value === 'string' && typeof enums === 'object' && enums[value] === value

export const TIME_FORMAT = 'HH:mm:ss'

export const DAYS_OF_WEEK = Enum('sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat')
export type DAY_OF_WEEK = keyof typeof DAYS_OF_WEEK
/**
 * @format uuid
 * @title A UUID used to uniquely identify an object
 * @examples ["3c9604d6-b5ee-11e8-96f8-529269fb1459"]
 * @pattern ^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$
 */
export type UUID = string

export type Timestamp = number
export type TimeRange = {
  start: Timestamp
  stop: Timestamp
}
export type TimestampInSeconds = number
/**
 * Sets the value for all properties in T to `string`.
 *
 * @example ```typescript
 * type Foo = Stringify<{ a: number, b: SomeRandomType }> // evaluates to { a: string, b: string}
 * const x: Foo = { a: 1, b: 'hello' } // compiler error, a must be a string
 * const y: Foo = { a: 'abc123', b: 'hello' } // OK!
 * ```
 */
export type Stringify<T> = { [P in keyof T]: string }
/**
 * Wrapper to set a property as nullable.
 *
 * @example
 * ```typescript
 * type Foo = Nullable<string> // evaluates to string | null
 * const x: Foo = 'hello' // OK!
 * const y: Foo = null // OK!
 * ```
 */
export type Nullable<T> = T | null
/**
 * Sets all properties in T to `nullable`.
 *
 * @example
 * ```typescript
 * type Foo = NullableProperties<{ a: string, b: string }> // evaluates to { a: string | null, b: string | null }
 * const x: Foo = { a: 'hello', b: 'world' } // OK!
 * const y: Foo = { a: null, b: 'world' } // OK!
 * ```
 */
export type NullableProperties<T extends object> = {
  [P in keyof T]-?: T[P] extends null ? T[P] : Nullable<T[P]>
}

/**
 * @param T The base type to use.
 * @param P The properties to pick for our new type.
 *
 * Takes type T and sets all properties enumerated in P to NonNullable.
 * The returned type will also include all properties not enumerated in P _without any modifications_.
 *
 * @example
 * ```typescript
 * type Foo = NonNullableProperties<{ a: Nullable<string>, b: Nullable<string> }, "a"> // evaluates to { a: string, b: string | null }
 * const x: Foo = { a: 'hello', b: 'world' } // OK!
 * const z: Foo = { a: 'hello', b: null } // OK!
 * const y: Foo = { a: null, b: 'world' } // compiler error! a must be a string
 * ```
 */
export type WithNonNullableKeys<T, P extends keyof T> = Omit<T, P> & {
  [K in keyof Pick<T, P>]: NonNullable<T[P]>
}

export type SingleOrArray<T> = T | T[]
/**
 * Extracts nullable keys from T.
 * @example
 * ```typescript
 * type Foo = NullableKeys<{ a: Nullable<string>, b: string, c: Nullable<number> }> // evaluates to 'a' | 'c'
 * ```
 */
export type NullableKeys<T> = {
  [P in keyof T]: null extends T[P] ? P : never
}[keyof T]

/**
 * @param T The base type to use.
 * @param P The properties to set to optional (undefinable).
 *
 * Make properties in T that are enumerated in P optional.
 * The returned type will also include all properties not enumerated in P _without any modifications_.
 *
 * @example
 * ```typescript
 * type Foo = Optional<{ a: string, b: string, c: string }, "a"> // evaluates to { a?: string, b: string, c: string }
 * const x: Foo = { a: 'hello', b: 'world', c: '!' } // OK!
 * const y: Foo = { b: 'world', c: '!' } // OK!
 * const z: Foo = { a: 'hello', b: 'potato' }
 */
export type Optional<T, P extends keyof T> = Omit<T, P> & Partial<Pick<T, P>>

export type NonEmptyArray<T> = [T, ...T[]]

/**
 * Returns all properties in T that are non-optional. This is the inverse of OptionalKeys.
 *
 * @example
 * ```typescript
 * type Foo = RequiredKeys<{ a: string, b: string, c?: string }> // evaluates to 'a' | 'b'
 */
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K }[keyof T]

/**
 * Returns all properties in T that are optional. This is the inverse of RequiredKeys.
 * @example
 * ```typescript
 * type Foo = OptionalKeys<{ a: string, b: string, c?: string }> // evaluates to 'c'
 * ```
 */
export type OptionalKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? K : never }[keyof T]

/**
 * Returns a new type derived from the properties of T that are non-optional. Inverse of PickOptional.
 * @example
 * ```typescript
 * type Foo = RequiredProperties<{ a: string, b: string, c?: string }> // evaluates to { a: string, b: string }
 * ```
 */
export type PickRequired<T> = Pick<T, RequiredKeys<T>>

/**
 * Returns a new type derived from the properties of T that are optional. Inverse of PickRequired.
 * @example
 * ```typescript
 * type Foo = PickOptional<{ a: string, b: string, c?: string }> // evaluates to { c?: string }
 * ```
 */
export type PickOptional<T> = Pick<T, OptionalKeys<T>>

/**
 * Turns any optional properties in T into nullable properties, in addition to being optional.
 *
 * @example
 * ```typescript
 * type Foo = NullableOptional<{ a: string, b?: string }> // evaluates to { a: string, b?: string | null }
 * const x: Foo = { a: 'hello', b: 'world' } // OK!
 * const y: Foo = { a: 'hello' } // OK!
 * const z: Foo = { a: 'hello', b: null } // OK!
 * const fail: Foo = { a: null, b: 'world' } // compiler error! a must be a string
 * const fail2: Foo = { b: 'world' } // compiler error! a must be a string
 * ```
 */
export type NullableOptional<T> = PickRequired<T> & NullableProperties<PickOptional<T>>

/**
 * An extension of the `Partial` type which recurses throughout the type, and sets *all* properties to optional.
 * @example
 * ```typescript
 * type MyDeepType = DeepPartial<{ a: { b: { c: string } } }> // evaluates to { a?: { b?: { c?: string } } }
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}
// eslint-reason recursive declarations require interfaces
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JsonArray extends Array<Json> {}

export interface JsonObject {
  [property: string]: Json
}

export type JsonValue = string | number | boolean | JsonArray | JsonObject

export type Json = Nullable<JsonValue>
// eslint-reason Function and constructor inference must use a single rest parameter of type 'any[]'
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyFunction<A = any> = (...args: any[]) => A
export type AnyConstructor<A = object> = new (...args: any[]) => A

/**
 * Intersection of T and U
 * @example
 * type A = SetIntersection<'a' | 'b', 'a' | 'c'> // 'a'
 */
export type SetIntersection<T extends keyof any, U extends keyof any> = T extends U ? T : never

/**
 * Extracts keys of T which have values that extend U
 * @examples ```typescript
 * type PickString<T> = ExtendedKeys<T, string>
 * type pickStringTest = PickString<{ a: string, b: number, c: boolean }> // 'a'
 *
 * type PickStringOrNumber<T> = ExtendedKeys<T, string | number>
 * type pickStringOrNumberTest = PickStringOrNumber<{ a: string, b: number, c: boolean }> // 'a' | 'b'
 * ```
 */
export type ExtendedKeys<T extends object, U> = {
  [K in keyof T]-?: T[K] extends U ? K : never
}[keyof T]

/**
 * Like ExtendedKeys, but traverses T deeply
 * @examples ```typescript
 * type DeepPickString<T> = DeepExtendedKeys<T, string>
 * type deepPickStringTest = DeepPickString<{ a: string, b: number, c: { d: string, e: number } }> // 'a' | 'd'
 * ```
 */
export type DeepExtendedKeys<T extends object, U> = {
  [K in keyof T]-?: T[K] extends U ? K : T[K] extends object ? DeepExtendedKeys<T[K], U> : never
}[keyof T]
