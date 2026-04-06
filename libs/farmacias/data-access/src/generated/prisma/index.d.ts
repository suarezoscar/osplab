/**
 * Client
 **/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types; // general types
import $Public = runtime.Types.Public;
import $Utils = runtime.Types.Utils;
import $Extensions = runtime.Types.Extensions;
import $Result = runtime.Types.Result;

export type PrismaPromise<T> = $Public.PrismaPromise<T>;

/**
 * Model Province
 *
 */
export type Province = $Result.DefaultSelection<Prisma.$ProvincePayload>;
/**
 * Model City
 *
 */
export type City = $Result.DefaultSelection<Prisma.$CityPayload>;
/**
 * Model Pharmacy
 *
 */
export type Pharmacy = $Result.DefaultSelection<Prisma.$PharmacyPayload>;
/**
 * Model DutySchedule
 *
 */
export type DutySchedule = $Result.DefaultSelection<Prisma.$DutySchedulePayload>;

/**
 * Enums
 */
export namespace $Enums {
  export const DutyType: {
    REGULAR: 'REGULAR';
    URGENT: 'URGENT';
    HOLIDAY: 'HOLIDAY';
  };

  export type DutyType = (typeof DutyType)[keyof typeof DutyType];
}

export type DutyType = $Enums.DutyType;

export const DutyType: typeof $Enums.DutyType;

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Provinces
 * const provinces = await prisma.province.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions
    ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition>
      ? Prisma.GetEvents<ClientOptions['log']>
      : never
    : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] };

  /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Provinces
   * const provinces = await prisma.province.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(
    eventType: V,
    callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void,
  ): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(
    query: TemplateStringsArray | Prisma.Sql,
    ...values: any[]
  ): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(
    arg: [...P],
    options?: { isolationLevel?: Prisma.TransactionIsolationLevel },
  ): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>;

  $transaction<R>(
    fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>,
    options?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    },
  ): $Utils.JsPromise<R>;

  $extends: $Extensions.ExtendsHook<
    'extends',
    Prisma.TypeMapCb<ClientOptions>,
    ExtArgs,
    $Utils.Call<
      Prisma.TypeMapCb<ClientOptions>,
      {
        extArgs: ExtArgs;
      }
    >
  >;

  /**
   * `prisma.province`: Exposes CRUD operations for the **Province** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Provinces
   * const provinces = await prisma.province.findMany()
   * ```
   */
  get province(): Prisma.ProvinceDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.city`: Exposes CRUD operations for the **City** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Cities
   * const cities = await prisma.city.findMany()
   * ```
   */
  get city(): Prisma.CityDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.pharmacy`: Exposes CRUD operations for the **Pharmacy** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more Pharmacies
   * const pharmacies = await prisma.pharmacy.findMany()
   * ```
   */
  get pharmacy(): Prisma.PharmacyDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dutySchedule`: Exposes CRUD operations for the **DutySchedule** model.
   * Example usage:
   * ```ts
   * // Fetch zero or more DutySchedules
   * const dutySchedules = await prisma.dutySchedule.findMany()
   * ```
   */
  get dutySchedule(): Prisma.DutyScheduleDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF;

  export type PrismaPromise<T> = $Public.PrismaPromise<T>;

  /**
   * Validator
   */
  export import validator = runtime.Public.validator;

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError;
  export import PrismaClientValidationError = runtime.PrismaClientValidationError;

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag;
  export import empty = runtime.empty;
  export import join = runtime.join;
  export import raw = runtime.raw;
  export import Sql = runtime.Sql;

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal;

  export type DecimalJsLike = runtime.DecimalJsLike;

  /**
   * Extensions
   */
  export import Extension = $Extensions.UserArgs;
  export import getExtensionContext = runtime.Extensions.getExtensionContext;
  export import Args = $Public.Args;
  export import Payload = $Public.Payload;
  export import Result = $Public.Result;
  export import Exact = $Public.Exact;

  /**
   * Prisma Client JS version: 7.6.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
   */
  export type PrismaVersion = {
    client: string;
    engine: string;
  };

  export const prismaVersion: PrismaVersion;

  /**
   * Utility Types
   */

  export import Bytes = runtime.Bytes;
  export import JsonObject = runtime.JsonObject;
  export import JsonArray = runtime.JsonArray;
  export import JsonValue = runtime.JsonValue;
  export import InputJsonObject = runtime.InputJsonObject;
  export import InputJsonArray = runtime.InputJsonArray;
  export import InputJsonValue = runtime.InputJsonValue;

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
     * Type of `Prisma.DbNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class DbNull {
      private DbNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.JsonNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class JsonNull {
      private JsonNull: never;
      private constructor();
    }

    /**
     * Type of `Prisma.AnyNull`.
     *
     * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
     *
     * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
     */
    class AnyNull {
      private AnyNull: never;
      private constructor();
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull;

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull;

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull;

  type SelectAndInclude = {
    select: any;
    include: any;
  };

  type SelectAndOmit = {
    select: any;
    omit: any;
  };

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<
    ReturnType<T>
  >;

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
  };

  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K;
  }[keyof T];

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K;
  };

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>;

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & (T extends SelectAndInclude
    ? 'Please either choose `select` or `include`.'
    : T extends SelectAndOmit
      ? 'Please either choose `select` or `omit`.'
      : {});

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  } & K;

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> = T extends object
    ? U extends object
      ? (Without<T, U> & U) | (Without<U, T> & T)
      : U
    : T;

  /**
   * Is T a Record?
   */
  type IsObject<T extends any> =
    T extends Array<any>
      ? False
      : T extends Date
        ? False
        : T extends Uint8Array
          ? False
          : T extends BigInt
            ? False
            : T extends object
              ? True
              : False;

  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O>; // With K possibilities
    }[K];

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;

  type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
  }[strict];

  type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown
    ? _Either<O, K, strict>
    : never;

  export type Union = any;

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
  } & {};

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (
    k: infer I,
  ) => void
    ? I
    : never;

  export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<
    Overwrite<
      U,
      {
        [K in keyof U]-?: At<U, K>;
      }
    >
  >;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function
    ? A
    : {
        [K in keyof A]: A[K];
      } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
      ?
          | (K extends keyof O ? { [P in K]: O[P] } & O : O)
          | ({ [P in keyof O as P extends K ? P : never]-?: O[P] } & O)
      : never
  >;

  type _Strict<U, _U = U> = U extends unknown
    ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>>
    : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False;

  // /**
  // 1
  // */
  export type True = 1;

  /**
  0
  */
  export type False = 0;

  export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
  }[B];

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
      ? 1
      : 0;

  export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0;
      1: 1;
    };
    1: {
      0: 1;
      1: 1;
    };
  }[B1][B2];

  export type Keys<U extends Union> = U extends unknown ? keyof U : never;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object
    ? {
        [P in keyof T]: P extends keyof O ? O[P] : never;
      }
    : never;

  type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> =
    IsObject<T> extends True ? U : T;

  type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
        ? never
        : K;
  }[keyof T];

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<
    T,
    MaybeTupleToUnion<K>
  >;

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;

  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;

  type FieldRefInputType<Model, FieldType> = Model extends never
    ? never
    : FieldRef<Model, FieldType>;

  export const ModelName: {
    Province: 'Province';
    City: 'City';
    Pharmacy: 'Pharmacy';
    DutySchedule: 'DutySchedule';
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName];

  interface TypeMapCb<ClientOptions = {}>
    extends $Utils.Fn<{ extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<
      this['params']['extArgs'],
      ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}
    >;
  }

  export type TypeMap<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > = {
    globalOmitOptions: {
      omit: GlobalOmitOptions;
    };
    meta: {
      modelProps: 'province' | 'city' | 'pharmacy' | 'dutySchedule';
      txIsolationLevel: Prisma.TransactionIsolationLevel;
    };
    model: {
      Province: {
        payload: Prisma.$ProvincePayload<ExtArgs>;
        fields: Prisma.ProvinceFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.ProvinceFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.ProvinceFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>;
          };
          findFirst: {
            args: Prisma.ProvinceFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.ProvinceFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>;
          };
          findMany: {
            args: Prisma.ProvinceFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>[];
          };
          create: {
            args: Prisma.ProvinceCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>;
          };
          createMany: {
            args: Prisma.ProvinceCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.ProvinceCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>[];
          };
          delete: {
            args: Prisma.ProvinceDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>;
          };
          update: {
            args: Prisma.ProvinceUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>;
          };
          deleteMany: {
            args: Prisma.ProvinceDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.ProvinceUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.ProvinceUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>[];
          };
          upsert: {
            args: Prisma.ProvinceUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$ProvincePayload>;
          };
          aggregate: {
            args: Prisma.ProvinceAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateProvince>;
          };
          groupBy: {
            args: Prisma.ProvinceGroupByArgs<ExtArgs>;
            result: $Utils.Optional<ProvinceGroupByOutputType>[];
          };
          count: {
            args: Prisma.ProvinceCountArgs<ExtArgs>;
            result: $Utils.Optional<ProvinceCountAggregateOutputType> | number;
          };
        };
      };
      City: {
        payload: Prisma.$CityPayload<ExtArgs>;
        fields: Prisma.CityFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.CityFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.CityFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>;
          };
          findFirst: {
            args: Prisma.CityFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.CityFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>;
          };
          findMany: {
            args: Prisma.CityFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>[];
          };
          create: {
            args: Prisma.CityCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>;
          };
          createMany: {
            args: Prisma.CityCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.CityCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>[];
          };
          delete: {
            args: Prisma.CityDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>;
          };
          update: {
            args: Prisma.CityUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>;
          };
          deleteMany: {
            args: Prisma.CityDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.CityUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.CityUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>[];
          };
          upsert: {
            args: Prisma.CityUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$CityPayload>;
          };
          aggregate: {
            args: Prisma.CityAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateCity>;
          };
          groupBy: {
            args: Prisma.CityGroupByArgs<ExtArgs>;
            result: $Utils.Optional<CityGroupByOutputType>[];
          };
          count: {
            args: Prisma.CityCountArgs<ExtArgs>;
            result: $Utils.Optional<CityCountAggregateOutputType> | number;
          };
        };
      };
      Pharmacy: {
        payload: Prisma.$PharmacyPayload<ExtArgs>;
        fields: Prisma.PharmacyFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.PharmacyFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.PharmacyFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>;
          };
          findFirst: {
            args: Prisma.PharmacyFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.PharmacyFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>;
          };
          findMany: {
            args: Prisma.PharmacyFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>[];
          };
          create: {
            args: Prisma.PharmacyCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>;
          };
          createMany: {
            args: Prisma.PharmacyCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.PharmacyCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>[];
          };
          delete: {
            args: Prisma.PharmacyDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>;
          };
          update: {
            args: Prisma.PharmacyUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>;
          };
          deleteMany: {
            args: Prisma.PharmacyDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.PharmacyUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.PharmacyUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>[];
          };
          upsert: {
            args: Prisma.PharmacyUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$PharmacyPayload>;
          };
          aggregate: {
            args: Prisma.PharmacyAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregatePharmacy>;
          };
          groupBy: {
            args: Prisma.PharmacyGroupByArgs<ExtArgs>;
            result: $Utils.Optional<PharmacyGroupByOutputType>[];
          };
          count: {
            args: Prisma.PharmacyCountArgs<ExtArgs>;
            result: $Utils.Optional<PharmacyCountAggregateOutputType> | number;
          };
        };
      };
      DutySchedule: {
        payload: Prisma.$DutySchedulePayload<ExtArgs>;
        fields: Prisma.DutyScheduleFieldRefs;
        operations: {
          findUnique: {
            args: Prisma.DutyScheduleFindUniqueArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload> | null;
          };
          findUniqueOrThrow: {
            args: Prisma.DutyScheduleFindUniqueOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>;
          };
          findFirst: {
            args: Prisma.DutyScheduleFindFirstArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload> | null;
          };
          findFirstOrThrow: {
            args: Prisma.DutyScheduleFindFirstOrThrowArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>;
          };
          findMany: {
            args: Prisma.DutyScheduleFindManyArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>[];
          };
          create: {
            args: Prisma.DutyScheduleCreateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>;
          };
          createMany: {
            args: Prisma.DutyScheduleCreateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          createManyAndReturn: {
            args: Prisma.DutyScheduleCreateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>[];
          };
          delete: {
            args: Prisma.DutyScheduleDeleteArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>;
          };
          update: {
            args: Prisma.DutyScheduleUpdateArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>;
          };
          deleteMany: {
            args: Prisma.DutyScheduleDeleteManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateMany: {
            args: Prisma.DutyScheduleUpdateManyArgs<ExtArgs>;
            result: BatchPayload;
          };
          updateManyAndReturn: {
            args: Prisma.DutyScheduleUpdateManyAndReturnArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>[];
          };
          upsert: {
            args: Prisma.DutyScheduleUpsertArgs<ExtArgs>;
            result: $Utils.PayloadToResult<Prisma.$DutySchedulePayload>;
          };
          aggregate: {
            args: Prisma.DutyScheduleAggregateArgs<ExtArgs>;
            result: $Utils.Optional<AggregateDutySchedule>;
          };
          groupBy: {
            args: Prisma.DutyScheduleGroupByArgs<ExtArgs>;
            result: $Utils.Optional<DutyScheduleGroupByOutputType>[];
          };
          count: {
            args: Prisma.DutyScheduleCountArgs<ExtArgs>;
            result: $Utils.Optional<DutyScheduleCountAggregateOutputType> | number;
          };
        };
      };
    };
  } & {
    other: {
      payload: any;
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]];
          result: any;
        };
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]];
          result: any;
        };
      };
    };
  };
  export const defineExtension: $Extensions.ExtendsHook<
    'define',
    Prisma.TypeMapCb,
    $Extensions.DefaultArgs
  >;
  export type DefaultPrismaClient = PrismaClient;
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     *
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     *
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     *
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[];
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number;
      timeout?: number;
      isolationLevel?: Prisma.TransactionIsolationLevel;
    };
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory;
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string;
    /**
     * Global configuration for omitting model fields by default.
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig;
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     *
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[];
  }
  export type GlobalOmitConfig = {
    province?: ProvinceOmit;
    city?: CityOmit;
    pharmacy?: PharmacyOmit;
    dutySchedule?: DutyScheduleOmit;
  };

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error';
  export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
  };

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;

  export type GetEvents<T extends any[]> =
    T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;

  export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
  };

  export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
  };
  /* End Types for Logging */

  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy';

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>;

  export type Datasource = {
    url?: string;
  };

  /**
   * Count Types
   */

  /**
   * Count Type ProvinceCountOutputType
   */

  export type ProvinceCountOutputType = {
    cities: number;
  };

  export type ProvinceCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    cities?: boolean | ProvinceCountOutputTypeCountCitiesArgs;
  };

  // Custom InputTypes
  /**
   * ProvinceCountOutputType without action
   */
  export type ProvinceCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the ProvinceCountOutputType
     */
    select?: ProvinceCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * ProvinceCountOutputType without action
   */
  export type ProvinceCountOutputTypeCountCitiesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: CityWhereInput;
  };

  /**
   * Count Type CityCountOutputType
   */

  export type CityCountOutputType = {
    pharmacies: number;
  };

  export type CityCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    pharmacies?: boolean | CityCountOutputTypeCountPharmaciesArgs;
  };

  // Custom InputTypes
  /**
   * CityCountOutputType without action
   */
  export type CityCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the CityCountOutputType
     */
    select?: CityCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * CityCountOutputType without action
   */
  export type CityCountOutputTypeCountPharmaciesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PharmacyWhereInput;
  };

  /**
   * Count Type PharmacyCountOutputType
   */

  export type PharmacyCountOutputType = {
    schedules: number;
  };

  export type PharmacyCountOutputTypeSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    schedules?: boolean | PharmacyCountOutputTypeCountSchedulesArgs;
  };

  // Custom InputTypes
  /**
   * PharmacyCountOutputType without action
   */
  export type PharmacyCountOutputTypeDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the PharmacyCountOutputType
     */
    select?: PharmacyCountOutputTypeSelect<ExtArgs> | null;
  };

  /**
   * PharmacyCountOutputType without action
   */
  export type PharmacyCountOutputTypeCountSchedulesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DutyScheduleWhereInput;
  };

  /**
   * Models
   */

  /**
   * Model Province
   */

  export type AggregateProvince = {
    _count: ProvinceCountAggregateOutputType | null;
    _min: ProvinceMinAggregateOutputType | null;
    _max: ProvinceMaxAggregateOutputType | null;
  };

  export type ProvinceMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    code: string | null;
  };

  export type ProvinceMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    code: string | null;
  };

  export type ProvinceCountAggregateOutputType = {
    id: number;
    name: number;
    code: number;
    _all: number;
  };

  export type ProvinceMinAggregateInputType = {
    id?: true;
    name?: true;
    code?: true;
  };

  export type ProvinceMaxAggregateInputType = {
    id?: true;
    name?: true;
    code?: true;
  };

  export type ProvinceCountAggregateInputType = {
    id?: true;
    name?: true;
    code?: true;
    _all?: true;
  };

  export type ProvinceAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Province to aggregate.
     */
    where?: ProvinceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Provinces to fetch.
     */
    orderBy?: ProvinceOrderByWithRelationInput | ProvinceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: ProvinceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Provinces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Provinces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Provinces
     **/
    _count?: true | ProvinceCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: ProvinceMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: ProvinceMaxAggregateInputType;
  };

  export type GetProvinceAggregateType<T extends ProvinceAggregateArgs> = {
    [P in keyof T & keyof AggregateProvince]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProvince[P]>
      : GetScalarType<T[P], AggregateProvince[P]>;
  };

  export type ProvinceGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: ProvinceWhereInput;
    orderBy?: ProvinceOrderByWithAggregationInput | ProvinceOrderByWithAggregationInput[];
    by: ProvinceScalarFieldEnum[] | ProvinceScalarFieldEnum;
    having?: ProvinceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProvinceCountAggregateInputType | true;
    _min?: ProvinceMinAggregateInputType;
    _max?: ProvinceMaxAggregateInputType;
  };

  export type ProvinceGroupByOutputType = {
    id: string;
    name: string;
    code: string;
    _count: ProvinceCountAggregateOutputType | null;
    _min: ProvinceMinAggregateOutputType | null;
    _max: ProvinceMaxAggregateOutputType | null;
  };

  type GetProvinceGroupByPayload<T extends ProvinceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProvinceGroupByOutputType, T['by']> & {
        [P in keyof T & keyof ProvinceGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], ProvinceGroupByOutputType[P]>
          : GetScalarType<T[P], ProvinceGroupByOutputType[P]>;
      }
    >
  >;

  export type ProvinceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        name?: boolean;
        code?: boolean;
        cities?: boolean | Province$citiesArgs<ExtArgs>;
        _count?: boolean | ProvinceCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['province']
    >;

  export type ProvinceSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      code?: boolean;
    },
    ExtArgs['result']['province']
  >;

  export type ProvinceSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      code?: boolean;
    },
    ExtArgs['result']['province']
  >;

  export type ProvinceSelectScalar = {
    id?: boolean;
    name?: boolean;
    code?: boolean;
  };

  export type ProvinceOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<'id' | 'name' | 'code', ExtArgs['result']['province']>;
  export type ProvinceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      cities?: boolean | Province$citiesArgs<ExtArgs>;
      _count?: boolean | ProvinceCountOutputTypeDefaultArgs<ExtArgs>;
    };
  export type ProvinceIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};
  export type ProvinceIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {};

  export type $ProvincePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      name: 'Province';
      objects: {
        cities: Prisma.$CityPayload<ExtArgs>[];
      };
      scalars: $Extensions.GetPayloadResult<
        {
          id: string;
          name: string;
          code: string;
        },
        ExtArgs['result']['province']
      >;
      composites: {};
    };

  type ProvinceGetPayload<S extends boolean | null | undefined | ProvinceDefaultArgs> =
    $Result.GetResult<Prisma.$ProvincePayload, S>;

  type ProvinceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    ProvinceFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: ProvinceCountAggregateInputType | true;
  };

  export interface ProvinceDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Province'];
      meta: { name: 'Province' };
    };
    /**
     * Find zero or one Province that matches the filter.
     * @param {ProvinceFindUniqueArgs} args - Arguments to find a Province
     * @example
     * // Get one Province
     * const province = await prisma.province.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProvinceFindUniqueArgs>(
      args: SelectSubset<T, ProvinceFindUniqueArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<
        Prisma.$ProvincePayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Province that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProvinceFindUniqueOrThrowArgs} args - Arguments to find a Province
     * @example
     * // Get one Province
     * const province = await prisma.province.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProvinceFindUniqueOrThrowArgs>(
      args: SelectSubset<T, ProvinceFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<
        Prisma.$ProvincePayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Province that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceFindFirstArgs} args - Arguments to find a Province
     * @example
     * // Get one Province
     * const province = await prisma.province.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProvinceFindFirstArgs>(
      args?: SelectSubset<T, ProvinceFindFirstArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Province that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceFindFirstOrThrowArgs} args - Arguments to find a Province
     * @example
     * // Get one Province
     * const province = await prisma.province.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProvinceFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ProvinceFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Provinces that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Provinces
     * const provinces = await prisma.province.findMany()
     *
     * // Get first 10 Provinces
     * const provinces = await prisma.province.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const provinceWithIdOnly = await prisma.province.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ProvinceFindManyArgs>(
      args?: SelectSubset<T, ProvinceFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a Province.
     * @param {ProvinceCreateArgs} args - Arguments to create a Province.
     * @example
     * // Create one Province
     * const Province = await prisma.province.create({
     *   data: {
     *     // ... data to create a Province
     *   }
     * })
     *
     */
    create<T extends ProvinceCreateArgs>(
      args: SelectSubset<T, ProvinceCreateArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Provinces.
     * @param {ProvinceCreateManyArgs} args - Arguments to create many Provinces.
     * @example
     * // Create many Provinces
     * const province = await prisma.province.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ProvinceCreateManyArgs>(
      args?: SelectSubset<T, ProvinceCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Provinces and returns the data saved in the database.
     * @param {ProvinceCreateManyAndReturnArgs} args - Arguments to create many Provinces.
     * @example
     * // Create many Provinces
     * const province = await prisma.province.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Provinces and only return the `id`
     * const provinceWithIdOnly = await prisma.province.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ProvinceCreateManyAndReturnArgs>(
      args?: SelectSubset<T, ProvinceCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ProvincePayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Province.
     * @param {ProvinceDeleteArgs} args - Arguments to delete one Province.
     * @example
     * // Delete one Province
     * const Province = await prisma.province.delete({
     *   where: {
     *     // ... filter to delete one Province
     *   }
     * })
     *
     */
    delete<T extends ProvinceDeleteArgs>(
      args: SelectSubset<T, ProvinceDeleteArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Province.
     * @param {ProvinceUpdateArgs} args - Arguments to update one Province.
     * @example
     * // Update one Province
     * const province = await prisma.province.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ProvinceUpdateArgs>(
      args: SelectSubset<T, ProvinceUpdateArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Provinces.
     * @param {ProvinceDeleteManyArgs} args - Arguments to filter Provinces to delete.
     * @example
     * // Delete a few Provinces
     * const { count } = await prisma.province.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ProvinceDeleteManyArgs>(
      args?: SelectSubset<T, ProvinceDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Provinces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Provinces
     * const province = await prisma.province.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ProvinceUpdateManyArgs>(
      args: SelectSubset<T, ProvinceUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Provinces and returns the data updated in the database.
     * @param {ProvinceUpdateManyAndReturnArgs} args - Arguments to update many Provinces.
     * @example
     * // Update many Provinces
     * const province = await prisma.province.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Provinces and only return the `id`
     * const provinceWithIdOnly = await prisma.province.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ProvinceUpdateManyAndReturnArgs>(
      args: SelectSubset<T, ProvinceUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$ProvincePayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Province.
     * @param {ProvinceUpsertArgs} args - Arguments to update or create a Province.
     * @example
     * // Update or create a Province
     * const province = await prisma.province.upsert({
     *   create: {
     *     // ... data to create a Province
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Province we want to update
     *   }
     * })
     */
    upsert<T extends ProvinceUpsertArgs>(
      args: SelectSubset<T, ProvinceUpsertArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      $Result.GetResult<Prisma.$ProvincePayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Provinces.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceCountArgs} args - Arguments to filter Provinces to count.
     * @example
     * // Count the number of Provinces
     * const count = await prisma.province.count({
     *   where: {
     *     // ... the filter for the Provinces we want to count
     *   }
     * })
     **/
    count<T extends ProvinceCountArgs>(
      args?: Subset<T, ProvinceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProvinceCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Province.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends ProvinceAggregateArgs>(
      args: Subset<T, ProvinceAggregateArgs>,
    ): Prisma.PrismaPromise<GetProvinceAggregateType<T>>;

    /**
     * Group by Province.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProvinceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends ProvinceGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProvinceGroupByArgs['orderBy'] }
        : { orderBy?: ProvinceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, ProvinceGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetProvinceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Province model
     */
    readonly fields: ProvinceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Province.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProvinceClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    cities<T extends Province$citiesArgs<ExtArgs> = {}>(
      args?: Subset<T, Province$citiesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Province model
   */
  interface ProvinceFieldRefs {
    readonly id: FieldRef<'Province', 'String'>;
    readonly name: FieldRef<'Province', 'String'>;
    readonly code: FieldRef<'Province', 'String'>;
  }

  // Custom InputTypes
  /**
   * Province findUnique
   */
  export type ProvinceFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * Filter, which Province to fetch.
     */
    where: ProvinceWhereUniqueInput;
  };

  /**
   * Province findUniqueOrThrow
   */
  export type ProvinceFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * Filter, which Province to fetch.
     */
    where: ProvinceWhereUniqueInput;
  };

  /**
   * Province findFirst
   */
  export type ProvinceFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * Filter, which Province to fetch.
     */
    where?: ProvinceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Provinces to fetch.
     */
    orderBy?: ProvinceOrderByWithRelationInput | ProvinceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Provinces.
     */
    cursor?: ProvinceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Provinces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Provinces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Provinces.
     */
    distinct?: ProvinceScalarFieldEnum | ProvinceScalarFieldEnum[];
  };

  /**
   * Province findFirstOrThrow
   */
  export type ProvinceFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * Filter, which Province to fetch.
     */
    where?: ProvinceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Provinces to fetch.
     */
    orderBy?: ProvinceOrderByWithRelationInput | ProvinceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Provinces.
     */
    cursor?: ProvinceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Provinces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Provinces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Provinces.
     */
    distinct?: ProvinceScalarFieldEnum | ProvinceScalarFieldEnum[];
  };

  /**
   * Province findMany
   */
  export type ProvinceFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * Filter, which Provinces to fetch.
     */
    where?: ProvinceWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Provinces to fetch.
     */
    orderBy?: ProvinceOrderByWithRelationInput | ProvinceOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Provinces.
     */
    cursor?: ProvinceWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Provinces from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Provinces.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Provinces.
     */
    distinct?: ProvinceScalarFieldEnum | ProvinceScalarFieldEnum[];
  };

  /**
   * Province create
   */
  export type ProvinceCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * The data needed to create a Province.
     */
    data: XOR<ProvinceCreateInput, ProvinceUncheckedCreateInput>;
  };

  /**
   * Province createMany
   */
  export type ProvinceCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Provinces.
     */
    data: ProvinceCreateManyInput | ProvinceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Province createManyAndReturn
   */
  export type ProvinceCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * The data used to create many Provinces.
     */
    data: ProvinceCreateManyInput | ProvinceCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Province update
   */
  export type ProvinceUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * The data needed to update a Province.
     */
    data: XOR<ProvinceUpdateInput, ProvinceUncheckedUpdateInput>;
    /**
     * Choose, which Province to update.
     */
    where: ProvinceWhereUniqueInput;
  };

  /**
   * Province updateMany
   */
  export type ProvinceUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Provinces.
     */
    data: XOR<ProvinceUpdateManyMutationInput, ProvinceUncheckedUpdateManyInput>;
    /**
     * Filter which Provinces to update
     */
    where?: ProvinceWhereInput;
    /**
     * Limit how many Provinces to update.
     */
    limit?: number;
  };

  /**
   * Province updateManyAndReturn
   */
  export type ProvinceUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * The data used to update Provinces.
     */
    data: XOR<ProvinceUpdateManyMutationInput, ProvinceUncheckedUpdateManyInput>;
    /**
     * Filter which Provinces to update
     */
    where?: ProvinceWhereInput;
    /**
     * Limit how many Provinces to update.
     */
    limit?: number;
  };

  /**
   * Province upsert
   */
  export type ProvinceUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * The filter to search for the Province to update in case it exists.
     */
    where: ProvinceWhereUniqueInput;
    /**
     * In case the Province found by the `where` argument doesn't exist, create a new Province with this data.
     */
    create: XOR<ProvinceCreateInput, ProvinceUncheckedCreateInput>;
    /**
     * In case the Province was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProvinceUpdateInput, ProvinceUncheckedUpdateInput>;
  };

  /**
   * Province delete
   */
  export type ProvinceDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
    /**
     * Filter which Province to delete.
     */
    where: ProvinceWhereUniqueInput;
  };

  /**
   * Province deleteMany
   */
  export type ProvinceDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Provinces to delete
     */
    where?: ProvinceWhereInput;
    /**
     * Limit how many Provinces to delete.
     */
    limit?: number;
  };

  /**
   * Province.cities
   */
  export type Province$citiesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    where?: CityWhereInput;
    orderBy?: CityOrderByWithRelationInput | CityOrderByWithRelationInput[];
    cursor?: CityWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: CityScalarFieldEnum | CityScalarFieldEnum[];
  };

  /**
   * Province without action
   */
  export type ProvinceDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Province
     */
    select?: ProvinceSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Province
     */
    omit?: ProvinceOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProvinceInclude<ExtArgs> | null;
  };

  /**
   * Model City
   */

  export type AggregateCity = {
    _count: CityCountAggregateOutputType | null;
    _min: CityMinAggregateOutputType | null;
    _max: CityMaxAggregateOutputType | null;
  };

  export type CityMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    provinceId: string | null;
  };

  export type CityMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    provinceId: string | null;
  };

  export type CityCountAggregateOutputType = {
    id: number;
    name: number;
    provinceId: number;
    _all: number;
  };

  export type CityMinAggregateInputType = {
    id?: true;
    name?: true;
    provinceId?: true;
  };

  export type CityMaxAggregateInputType = {
    id?: true;
    name?: true;
    provinceId?: true;
  };

  export type CityCountAggregateInputType = {
    id?: true;
    name?: true;
    provinceId?: true;
    _all?: true;
  };

  export type CityAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which City to aggregate.
     */
    where?: CityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cities to fetch.
     */
    orderBy?: CityOrderByWithRelationInput | CityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: CityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Cities
     **/
    _count?: true | CityCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: CityMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: CityMaxAggregateInputType;
  };

  export type GetCityAggregateType<T extends CityAggregateArgs> = {
    [P in keyof T & keyof AggregateCity]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCity[P]>
      : GetScalarType<T[P], AggregateCity[P]>;
  };

  export type CityGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      where?: CityWhereInput;
      orderBy?: CityOrderByWithAggregationInput | CityOrderByWithAggregationInput[];
      by: CityScalarFieldEnum[] | CityScalarFieldEnum;
      having?: CityScalarWhereWithAggregatesInput;
      take?: number;
      skip?: number;
      _count?: CityCountAggregateInputType | true;
      _min?: CityMinAggregateInputType;
      _max?: CityMaxAggregateInputType;
    };

  export type CityGroupByOutputType = {
    id: string;
    name: string;
    provinceId: string;
    _count: CityCountAggregateOutputType | null;
    _min: CityMinAggregateOutputType | null;
    _max: CityMaxAggregateOutputType | null;
  };

  type GetCityGroupByPayload<T extends CityGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CityGroupByOutputType, T['by']> & {
        [P in keyof T & keyof CityGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], CityGroupByOutputType[P]>
          : GetScalarType<T[P], CityGroupByOutputType[P]>;
      }
    >
  >;

  export type CitySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        name?: boolean;
        provinceId?: boolean;
        province?: boolean | ProvinceDefaultArgs<ExtArgs>;
        pharmacies?: boolean | City$pharmaciesArgs<ExtArgs>;
        _count?: boolean | CityCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['city']
    >;

  export type CitySelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      provinceId?: boolean;
      province?: boolean | ProvinceDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['city']
  >;

  export type CitySelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      provinceId?: boolean;
      province?: boolean | ProvinceDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['city']
  >;

  export type CitySelectScalar = {
    id?: boolean;
    name?: boolean;
    provinceId?: boolean;
  };

  export type CityOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<'id' | 'name' | 'provinceId', ExtArgs['result']['city']>;
  export type CityInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    province?: boolean | ProvinceDefaultArgs<ExtArgs>;
    pharmacies?: boolean | City$pharmaciesArgs<ExtArgs>;
    _count?: boolean | CityCountOutputTypeDefaultArgs<ExtArgs>;
  };
  export type CityIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    province?: boolean | ProvinceDefaultArgs<ExtArgs>;
  };
  export type CityIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    province?: boolean | ProvinceDefaultArgs<ExtArgs>;
  };

  export type $CityPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: 'City';
    objects: {
      province: Prisma.$ProvincePayload<ExtArgs>;
      pharmacies: Prisma.$PharmacyPayload<ExtArgs>[];
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        name: string;
        provinceId: string;
      },
      ExtArgs['result']['city']
    >;
    composites: {};
  };

  type CityGetPayload<S extends boolean | null | undefined | CityDefaultArgs> = $Result.GetResult<
    Prisma.$CityPayload,
    S
  >;

  type CityCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    CityFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: CityCountAggregateInputType | true;
  };

  export interface CityDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['City']; meta: { name: 'City' } };
    /**
     * Find zero or one City that matches the filter.
     * @param {CityFindUniqueArgs} args - Arguments to find a City
     * @example
     * // Get one City
     * const city = await prisma.city.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends CityFindUniqueArgs>(
      args: SelectSubset<T, CityFindUniqueArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one City that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {CityFindUniqueOrThrowArgs} args - Arguments to find a City
     * @example
     * // Get one City
     * const city = await prisma.city.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends CityFindUniqueOrThrowArgs>(
      args: SelectSubset<T, CityFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first City that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityFindFirstArgs} args - Arguments to find a City
     * @example
     * // Get one City
     * const city = await prisma.city.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends CityFindFirstArgs>(
      args?: SelectSubset<T, CityFindFirstArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first City that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityFindFirstOrThrowArgs} args - Arguments to find a City
     * @example
     * // Get one City
     * const city = await prisma.city.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends CityFindFirstOrThrowArgs>(
      args?: SelectSubset<T, CityFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Cities that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cities
     * const cities = await prisma.city.findMany()
     *
     * // Get first 10 Cities
     * const cities = await prisma.city.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const cityWithIdOnly = await prisma.city.findMany({ select: { id: true } })
     *
     */
    findMany<T extends CityFindManyArgs>(
      args?: SelectSubset<T, CityFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a City.
     * @param {CityCreateArgs} args - Arguments to create a City.
     * @example
     * // Create one City
     * const City = await prisma.city.create({
     *   data: {
     *     // ... data to create a City
     *   }
     * })
     *
     */
    create<T extends CityCreateArgs>(
      args: SelectSubset<T, CityCreateArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Cities.
     * @param {CityCreateManyArgs} args - Arguments to create many Cities.
     * @example
     * // Create many Cities
     * const city = await prisma.city.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends CityCreateManyArgs>(
      args?: SelectSubset<T, CityCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Cities and returns the data saved in the database.
     * @param {CityCreateManyAndReturnArgs} args - Arguments to create many Cities.
     * @example
     * // Create many Cities
     * const city = await prisma.city.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Cities and only return the `id`
     * const cityWithIdOnly = await prisma.city.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends CityCreateManyAndReturnArgs>(
      args?: SelectSubset<T, CityCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>
    >;

    /**
     * Delete a City.
     * @param {CityDeleteArgs} args - Arguments to delete one City.
     * @example
     * // Delete one City
     * const City = await prisma.city.delete({
     *   where: {
     *     // ... filter to delete one City
     *   }
     * })
     *
     */
    delete<T extends CityDeleteArgs>(
      args: SelectSubset<T, CityDeleteArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one City.
     * @param {CityUpdateArgs} args - Arguments to update one City.
     * @example
     * // Update one City
     * const city = await prisma.city.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends CityUpdateArgs>(
      args: SelectSubset<T, CityUpdateArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Cities.
     * @param {CityDeleteManyArgs} args - Arguments to filter Cities to delete.
     * @example
     * // Delete a few Cities
     * const { count } = await prisma.city.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends CityDeleteManyArgs>(
      args?: SelectSubset<T, CityDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Cities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cities
     * const city = await prisma.city.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends CityUpdateManyArgs>(
      args: SelectSubset<T, CityUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Cities and returns the data updated in the database.
     * @param {CityUpdateManyAndReturnArgs} args - Arguments to update many Cities.
     * @example
     * // Update many Cities
     * const city = await prisma.city.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Cities and only return the `id`
     * const cityWithIdOnly = await prisma.city.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends CityUpdateManyAndReturnArgs>(
      args: SelectSubset<T, CityUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>
    >;

    /**
     * Create or update one City.
     * @param {CityUpsertArgs} args - Arguments to update or create a City.
     * @example
     * // Update or create a City
     * const city = await prisma.city.upsert({
     *   create: {
     *     // ... data to create a City
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the City we want to update
     *   }
     * })
     */
    upsert<T extends CityUpsertArgs>(
      args: SelectSubset<T, CityUpsertArgs<ExtArgs>>,
    ): Prisma__CityClient<
      $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Cities.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityCountArgs} args - Arguments to filter Cities to count.
     * @example
     * // Count the number of Cities
     * const count = await prisma.city.count({
     *   where: {
     *     // ... the filter for the Cities we want to count
     *   }
     * })
     **/
    count<T extends CityCountArgs>(
      args?: Subset<T, CityCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CityCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a City.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends CityAggregateArgs>(
      args: Subset<T, CityAggregateArgs>,
    ): Prisma.PrismaPromise<GetCityAggregateType<T>>;

    /**
     * Group by City.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CityGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends CityGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: CityGroupByArgs['orderBy'] }
        : { orderBy?: CityGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, CityGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetCityGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the City model
     */
    readonly fields: CityFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for City.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__CityClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    province<T extends ProvinceDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, ProvinceDefaultArgs<ExtArgs>>,
    ): Prisma__ProvinceClient<
      | $Result.GetResult<
          Prisma.$ProvincePayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    pharmacies<T extends City$pharmaciesArgs<ExtArgs> = {}>(
      args?: Subset<T, City$pharmaciesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions> | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the City model
   */
  interface CityFieldRefs {
    readonly id: FieldRef<'City', 'String'>;
    readonly name: FieldRef<'City', 'String'>;
    readonly provinceId: FieldRef<'City', 'String'>;
  }

  // Custom InputTypes
  /**
   * City findUnique
   */
  export type CityFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * Filter, which City to fetch.
     */
    where: CityWhereUniqueInput;
  };

  /**
   * City findUniqueOrThrow
   */
  export type CityFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * Filter, which City to fetch.
     */
    where: CityWhereUniqueInput;
  };

  /**
   * City findFirst
   */
  export type CityFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * Filter, which City to fetch.
     */
    where?: CityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cities to fetch.
     */
    orderBy?: CityOrderByWithRelationInput | CityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Cities.
     */
    cursor?: CityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Cities.
     */
    distinct?: CityScalarFieldEnum | CityScalarFieldEnum[];
  };

  /**
   * City findFirstOrThrow
   */
  export type CityFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * Filter, which City to fetch.
     */
    where?: CityWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Cities to fetch.
     */
    orderBy?: CityOrderByWithRelationInput | CityOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Cities.
     */
    cursor?: CityWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Cities from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Cities.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Cities.
     */
    distinct?: CityScalarFieldEnum | CityScalarFieldEnum[];
  };

  /**
   * City findMany
   */
  export type CityFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the City
       */
      select?: CitySelect<ExtArgs> | null;
      /**
       * Omit specific fields from the City
       */
      omit?: CityOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: CityInclude<ExtArgs> | null;
      /**
       * Filter, which Cities to fetch.
       */
      where?: CityWhereInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
       *
       * Determine the order of Cities to fetch.
       */
      orderBy?: CityOrderByWithRelationInput | CityOrderByWithRelationInput[];
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
       *
       * Sets the position for listing Cities.
       */
      cursor?: CityWhereUniqueInput;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Take `±n` Cities from the position of the cursor.
       */
      take?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
       *
       * Skip the first `n` Cities.
       */
      skip?: number;
      /**
       * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
       *
       * Filter by unique combinations of Cities.
       */
      distinct?: CityScalarFieldEnum | CityScalarFieldEnum[];
    };

  /**
   * City create
   */
  export type CityCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * The data needed to create a City.
     */
    data: XOR<CityCreateInput, CityUncheckedCreateInput>;
  };

  /**
   * City createMany
   */
  export type CityCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Cities.
     */
    data: CityCreateManyInput | CityCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * City createManyAndReturn
   */
  export type CityCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * The data used to create many Cities.
     */
    data: CityCreateManyInput | CityCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * City update
   */
  export type CityUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * The data needed to update a City.
     */
    data: XOR<CityUpdateInput, CityUncheckedUpdateInput>;
    /**
     * Choose, which City to update.
     */
    where: CityWhereUniqueInput;
  };

  /**
   * City updateMany
   */
  export type CityUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Cities.
     */
    data: XOR<CityUpdateManyMutationInput, CityUncheckedUpdateManyInput>;
    /**
     * Filter which Cities to update
     */
    where?: CityWhereInput;
    /**
     * Limit how many Cities to update.
     */
    limit?: number;
  };

  /**
   * City updateManyAndReturn
   */
  export type CityUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * The data used to update Cities.
     */
    data: XOR<CityUpdateManyMutationInput, CityUncheckedUpdateManyInput>;
    /**
     * Filter which Cities to update
     */
    where?: CityWhereInput;
    /**
     * Limit how many Cities to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * City upsert
   */
  export type CityUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * The filter to search for the City to update in case it exists.
     */
    where: CityWhereUniqueInput;
    /**
     * In case the City found by the `where` argument doesn't exist, create a new City with this data.
     */
    create: XOR<CityCreateInput, CityUncheckedCreateInput>;
    /**
     * In case the City was found with the provided `where` argument, update it with this data.
     */
    update: XOR<CityUpdateInput, CityUncheckedUpdateInput>;
  };

  /**
   * City delete
   */
  export type CityDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the City
     */
    select?: CitySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the City
     */
    omit?: CityOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: CityInclude<ExtArgs> | null;
    /**
     * Filter which City to delete.
     */
    where: CityWhereUniqueInput;
  };

  /**
   * City deleteMany
   */
  export type CityDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Cities to delete
     */
    where?: CityWhereInput;
    /**
     * Limit how many Cities to delete.
     */
    limit?: number;
  };

  /**
   * City.pharmacies
   */
  export type City$pharmaciesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    where?: PharmacyWhereInput;
    orderBy?: PharmacyOrderByWithRelationInput | PharmacyOrderByWithRelationInput[];
    cursor?: PharmacyWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: PharmacyScalarFieldEnum | PharmacyScalarFieldEnum[];
  };

  /**
   * City without action
   */
  export type CityDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      /**
       * Select specific fields to fetch from the City
       */
      select?: CitySelect<ExtArgs> | null;
      /**
       * Omit specific fields from the City
       */
      omit?: CityOmit<ExtArgs> | null;
      /**
       * Choose, which related nodes to fetch as well
       */
      include?: CityInclude<ExtArgs> | null;
    };

  /**
   * Model Pharmacy
   */

  export type AggregatePharmacy = {
    _count: PharmacyCountAggregateOutputType | null;
    _min: PharmacyMinAggregateOutputType | null;
    _max: PharmacyMaxAggregateOutputType | null;
  };

  export type PharmacyMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    ownerName: string | null;
    address: string | null;
    phone: string | null;
    cityId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PharmacyMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    ownerName: string | null;
    address: string | null;
    phone: string | null;
    cityId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  };

  export type PharmacyCountAggregateOutputType = {
    id: number;
    name: number;
    ownerName: number;
    address: number;
    phone: number;
    cityId: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
  };

  export type PharmacyMinAggregateInputType = {
    id?: true;
    name?: true;
    ownerName?: true;
    address?: true;
    phone?: true;
    cityId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PharmacyMaxAggregateInputType = {
    id?: true;
    name?: true;
    ownerName?: true;
    address?: true;
    phone?: true;
    cityId?: true;
    createdAt?: true;
    updatedAt?: true;
  };

  export type PharmacyCountAggregateInputType = {
    id?: true;
    name?: true;
    ownerName?: true;
    address?: true;
    phone?: true;
    cityId?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
  };

  export type PharmacyAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Pharmacy to aggregate.
     */
    where?: PharmacyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pharmacies to fetch.
     */
    orderBy?: PharmacyOrderByWithRelationInput | PharmacyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: PharmacyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pharmacies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pharmacies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Pharmacies
     **/
    _count?: true | PharmacyCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: PharmacyMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: PharmacyMaxAggregateInputType;
  };

  export type GetPharmacyAggregateType<T extends PharmacyAggregateArgs> = {
    [P in keyof T & keyof AggregatePharmacy]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePharmacy[P]>
      : GetScalarType<T[P], AggregatePharmacy[P]>;
  };

  export type PharmacyGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: PharmacyWhereInput;
    orderBy?: PharmacyOrderByWithAggregationInput | PharmacyOrderByWithAggregationInput[];
    by: PharmacyScalarFieldEnum[] | PharmacyScalarFieldEnum;
    having?: PharmacyScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PharmacyCountAggregateInputType | true;
    _min?: PharmacyMinAggregateInputType;
    _max?: PharmacyMaxAggregateInputType;
  };

  export type PharmacyGroupByOutputType = {
    id: string;
    name: string;
    ownerName: string | null;
    address: string;
    phone: string | null;
    cityId: string;
    createdAt: Date;
    updatedAt: Date;
    _count: PharmacyCountAggregateOutputType | null;
    _min: PharmacyMinAggregateOutputType | null;
    _max: PharmacyMaxAggregateOutputType | null;
  };

  type GetPharmacyGroupByPayload<T extends PharmacyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PharmacyGroupByOutputType, T['by']> & {
        [P in keyof T & keyof PharmacyGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], PharmacyGroupByOutputType[P]>
          : GetScalarType<T[P], PharmacyGroupByOutputType[P]>;
      }
    >
  >;

  export type PharmacySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetSelect<
      {
        id?: boolean;
        name?: boolean;
        ownerName?: boolean;
        address?: boolean;
        phone?: boolean;
        cityId?: boolean;
        createdAt?: boolean;
        updatedAt?: boolean;
        city?: boolean | CityDefaultArgs<ExtArgs>;
        schedules?: boolean | Pharmacy$schedulesArgs<ExtArgs>;
        _count?: boolean | PharmacyCountOutputTypeDefaultArgs<ExtArgs>;
      },
      ExtArgs['result']['pharmacy']
    >;

  export type PharmacySelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      ownerName?: boolean;
      address?: boolean;
      phone?: boolean;
      cityId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      city?: boolean | CityDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['pharmacy']
  >;

  export type PharmacySelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      name?: boolean;
      ownerName?: boolean;
      address?: boolean;
      phone?: boolean;
      cityId?: boolean;
      createdAt?: boolean;
      updatedAt?: boolean;
      city?: boolean | CityDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['pharmacy']
  >;

  export type PharmacySelectScalar = {
    id?: boolean;
    name?: boolean;
    ownerName?: boolean;
    address?: boolean;
    phone?: boolean;
    cityId?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
  };

  export type PharmacyOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      'id' | 'name' | 'ownerName' | 'address' | 'phone' | 'cityId' | 'createdAt' | 'updatedAt',
      ExtArgs['result']['pharmacy']
    >;
  export type PharmacyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      city?: boolean | CityDefaultArgs<ExtArgs>;
      schedules?: boolean | Pharmacy$schedulesArgs<ExtArgs>;
      _count?: boolean | PharmacyCountOutputTypeDefaultArgs<ExtArgs>;
    };
  export type PharmacyIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    city?: boolean | CityDefaultArgs<ExtArgs>;
  };
  export type PharmacyIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    city?: boolean | CityDefaultArgs<ExtArgs>;
  };

  export type $PharmacyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    {
      name: 'Pharmacy';
      objects: {
        city: Prisma.$CityPayload<ExtArgs>;
        schedules: Prisma.$DutySchedulePayload<ExtArgs>[];
      };
      scalars: $Extensions.GetPayloadResult<
        {
          id: string;
          name: string;
          /**
           * Nombre del titular/propietario cuando la fuente lo distingue del nombre comercial.
           * Ejemplo (Ourense): name="FARMACIA GARCÍA", ownerName="María García López"
           */
          ownerName: string | null;
          address: string;
          phone: string | null;
          cityId: string;
          createdAt: Date;
          updatedAt: Date;
        },
        ExtArgs['result']['pharmacy']
      >;
      composites: {};
    };

  type PharmacyGetPayload<S extends boolean | null | undefined | PharmacyDefaultArgs> =
    $Result.GetResult<Prisma.$PharmacyPayload, S>;

  type PharmacyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = Omit<
    PharmacyFindManyArgs,
    'select' | 'include' | 'distinct' | 'omit'
  > & {
    select?: PharmacyCountAggregateInputType | true;
  };

  export interface PharmacyDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['Pharmacy'];
      meta: { name: 'Pharmacy' };
    };
    /**
     * Find zero or one Pharmacy that matches the filter.
     * @param {PharmacyFindUniqueArgs} args - Arguments to find a Pharmacy
     * @example
     * // Get one Pharmacy
     * const pharmacy = await prisma.pharmacy.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PharmacyFindUniqueArgs>(
      args: SelectSubset<T, PharmacyFindUniqueArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<
        Prisma.$PharmacyPayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one Pharmacy that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PharmacyFindUniqueOrThrowArgs} args - Arguments to find a Pharmacy
     * @example
     * // Get one Pharmacy
     * const pharmacy = await prisma.pharmacy.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PharmacyFindUniqueOrThrowArgs>(
      args: SelectSubset<T, PharmacyFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<
        Prisma.$PharmacyPayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Pharmacy that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyFindFirstArgs} args - Arguments to find a Pharmacy
     * @example
     * // Get one Pharmacy
     * const pharmacy = await prisma.pharmacy.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PharmacyFindFirstArgs>(
      args?: SelectSubset<T, PharmacyFindFirstArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first Pharmacy that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyFindFirstOrThrowArgs} args - Arguments to find a Pharmacy
     * @example
     * // Get one Pharmacy
     * const pharmacy = await prisma.pharmacy.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PharmacyFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PharmacyFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more Pharmacies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pharmacies
     * const pharmacies = await prisma.pharmacy.findMany()
     *
     * // Get first 10 Pharmacies
     * const pharmacies = await prisma.pharmacy.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const pharmacyWithIdOnly = await prisma.pharmacy.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PharmacyFindManyArgs>(
      args?: SelectSubset<T, PharmacyFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a Pharmacy.
     * @param {PharmacyCreateArgs} args - Arguments to create a Pharmacy.
     * @example
     * // Create one Pharmacy
     * const Pharmacy = await prisma.pharmacy.create({
     *   data: {
     *     // ... data to create a Pharmacy
     *   }
     * })
     *
     */
    create<T extends PharmacyCreateArgs>(
      args: SelectSubset<T, PharmacyCreateArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many Pharmacies.
     * @param {PharmacyCreateManyArgs} args - Arguments to create many Pharmacies.
     * @example
     * // Create many Pharmacies
     * const pharmacy = await prisma.pharmacy.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PharmacyCreateManyArgs>(
      args?: SelectSubset<T, PharmacyCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many Pharmacies and returns the data saved in the database.
     * @param {PharmacyCreateManyAndReturnArgs} args - Arguments to create many Pharmacies.
     * @example
     * // Create many Pharmacies
     * const pharmacy = await prisma.pharmacy.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Pharmacies and only return the `id`
     * const pharmacyWithIdOnly = await prisma.pharmacy.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PharmacyCreateManyAndReturnArgs>(
      args?: SelectSubset<T, PharmacyCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PharmacyPayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a Pharmacy.
     * @param {PharmacyDeleteArgs} args - Arguments to delete one Pharmacy.
     * @example
     * // Delete one Pharmacy
     * const Pharmacy = await prisma.pharmacy.delete({
     *   where: {
     *     // ... filter to delete one Pharmacy
     *   }
     * })
     *
     */
    delete<T extends PharmacyDeleteArgs>(
      args: SelectSubset<T, PharmacyDeleteArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one Pharmacy.
     * @param {PharmacyUpdateArgs} args - Arguments to update one Pharmacy.
     * @example
     * // Update one Pharmacy
     * const pharmacy = await prisma.pharmacy.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PharmacyUpdateArgs>(
      args: SelectSubset<T, PharmacyUpdateArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more Pharmacies.
     * @param {PharmacyDeleteManyArgs} args - Arguments to filter Pharmacies to delete.
     * @example
     * // Delete a few Pharmacies
     * const { count } = await prisma.pharmacy.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PharmacyDeleteManyArgs>(
      args?: SelectSubset<T, PharmacyDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Pharmacies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pharmacies
     * const pharmacy = await prisma.pharmacy.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PharmacyUpdateManyArgs>(
      args: SelectSubset<T, PharmacyUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more Pharmacies and returns the data updated in the database.
     * @param {PharmacyUpdateManyAndReturnArgs} args - Arguments to update many Pharmacies.
     * @example
     * // Update many Pharmacies
     * const pharmacy = await prisma.pharmacy.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Pharmacies and only return the `id`
     * const pharmacyWithIdOnly = await prisma.pharmacy.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PharmacyUpdateManyAndReturnArgs>(
      args: SelectSubset<T, PharmacyUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$PharmacyPayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one Pharmacy.
     * @param {PharmacyUpsertArgs} args - Arguments to update or create a Pharmacy.
     * @example
     * // Update or create a Pharmacy
     * const pharmacy = await prisma.pharmacy.upsert({
     *   create: {
     *     // ... data to create a Pharmacy
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pharmacy we want to update
     *   }
     * })
     */
    upsert<T extends PharmacyUpsertArgs>(
      args: SelectSubset<T, PharmacyUpsertArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      $Result.GetResult<Prisma.$PharmacyPayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of Pharmacies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyCountArgs} args - Arguments to filter Pharmacies to count.
     * @example
     * // Count the number of Pharmacies
     * const count = await prisma.pharmacy.count({
     *   where: {
     *     // ... the filter for the Pharmacies we want to count
     *   }
     * })
     **/
    count<T extends PharmacyCountArgs>(
      args?: Subset<T, PharmacyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PharmacyCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a Pharmacy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends PharmacyAggregateArgs>(
      args: Subset<T, PharmacyAggregateArgs>,
    ): Prisma.PrismaPromise<GetPharmacyAggregateType<T>>;

    /**
     * Group by Pharmacy.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PharmacyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends PharmacyGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PharmacyGroupByArgs['orderBy'] }
        : { orderBy?: PharmacyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, PharmacyGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors ? GetPharmacyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Pharmacy model
     */
    readonly fields: PharmacyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pharmacy.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PharmacyClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    city<T extends CityDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, CityDefaultArgs<ExtArgs>>,
    ): Prisma__CityClient<
      | $Result.GetResult<Prisma.$CityPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    schedules<T extends Pharmacy$schedulesArgs<ExtArgs> = {}>(
      args?: Subset<T, Pharmacy$schedulesArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      | $Result.GetResult<Prisma.$DutySchedulePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
      | Null
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the Pharmacy model
   */
  interface PharmacyFieldRefs {
    readonly id: FieldRef<'Pharmacy', 'String'>;
    readonly name: FieldRef<'Pharmacy', 'String'>;
    readonly ownerName: FieldRef<'Pharmacy', 'String'>;
    readonly address: FieldRef<'Pharmacy', 'String'>;
    readonly phone: FieldRef<'Pharmacy', 'String'>;
    readonly cityId: FieldRef<'Pharmacy', 'String'>;
    readonly createdAt: FieldRef<'Pharmacy', 'DateTime'>;
    readonly updatedAt: FieldRef<'Pharmacy', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * Pharmacy findUnique
   */
  export type PharmacyFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * Filter, which Pharmacy to fetch.
     */
    where: PharmacyWhereUniqueInput;
  };

  /**
   * Pharmacy findUniqueOrThrow
   */
  export type PharmacyFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * Filter, which Pharmacy to fetch.
     */
    where: PharmacyWhereUniqueInput;
  };

  /**
   * Pharmacy findFirst
   */
  export type PharmacyFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * Filter, which Pharmacy to fetch.
     */
    where?: PharmacyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pharmacies to fetch.
     */
    orderBy?: PharmacyOrderByWithRelationInput | PharmacyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Pharmacies.
     */
    cursor?: PharmacyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pharmacies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pharmacies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pharmacies.
     */
    distinct?: PharmacyScalarFieldEnum | PharmacyScalarFieldEnum[];
  };

  /**
   * Pharmacy findFirstOrThrow
   */
  export type PharmacyFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * Filter, which Pharmacy to fetch.
     */
    where?: PharmacyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pharmacies to fetch.
     */
    orderBy?: PharmacyOrderByWithRelationInput | PharmacyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Pharmacies.
     */
    cursor?: PharmacyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pharmacies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pharmacies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pharmacies.
     */
    distinct?: PharmacyScalarFieldEnum | PharmacyScalarFieldEnum[];
  };

  /**
   * Pharmacy findMany
   */
  export type PharmacyFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * Filter, which Pharmacies to fetch.
     */
    where?: PharmacyWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pharmacies to fetch.
     */
    orderBy?: PharmacyOrderByWithRelationInput | PharmacyOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Pharmacies.
     */
    cursor?: PharmacyWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pharmacies from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pharmacies.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pharmacies.
     */
    distinct?: PharmacyScalarFieldEnum | PharmacyScalarFieldEnum[];
  };

  /**
   * Pharmacy create
   */
  export type PharmacyCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * The data needed to create a Pharmacy.
     */
    data: XOR<PharmacyCreateInput, PharmacyUncheckedCreateInput>;
  };

  /**
   * Pharmacy createMany
   */
  export type PharmacyCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many Pharmacies.
     */
    data: PharmacyCreateManyInput | PharmacyCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * Pharmacy createManyAndReturn
   */
  export type PharmacyCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * The data used to create many Pharmacies.
     */
    data: PharmacyCreateManyInput | PharmacyCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Pharmacy update
   */
  export type PharmacyUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * The data needed to update a Pharmacy.
     */
    data: XOR<PharmacyUpdateInput, PharmacyUncheckedUpdateInput>;
    /**
     * Choose, which Pharmacy to update.
     */
    where: PharmacyWhereUniqueInput;
  };

  /**
   * Pharmacy updateMany
   */
  export type PharmacyUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update Pharmacies.
     */
    data: XOR<PharmacyUpdateManyMutationInput, PharmacyUncheckedUpdateManyInput>;
    /**
     * Filter which Pharmacies to update
     */
    where?: PharmacyWhereInput;
    /**
     * Limit how many Pharmacies to update.
     */
    limit?: number;
  };

  /**
   * Pharmacy updateManyAndReturn
   */
  export type PharmacyUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * The data used to update Pharmacies.
     */
    data: XOR<PharmacyUpdateManyMutationInput, PharmacyUncheckedUpdateManyInput>;
    /**
     * Filter which Pharmacies to update
     */
    where?: PharmacyWhereInput;
    /**
     * Limit how many Pharmacies to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * Pharmacy upsert
   */
  export type PharmacyUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * The filter to search for the Pharmacy to update in case it exists.
     */
    where: PharmacyWhereUniqueInput;
    /**
     * In case the Pharmacy found by the `where` argument doesn't exist, create a new Pharmacy with this data.
     */
    create: XOR<PharmacyCreateInput, PharmacyUncheckedCreateInput>;
    /**
     * In case the Pharmacy was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PharmacyUpdateInput, PharmacyUncheckedUpdateInput>;
  };

  /**
   * Pharmacy delete
   */
  export type PharmacyDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
    /**
     * Filter which Pharmacy to delete.
     */
    where: PharmacyWhereUniqueInput;
  };

  /**
   * Pharmacy deleteMany
   */
  export type PharmacyDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which Pharmacies to delete
     */
    where?: PharmacyWhereInput;
    /**
     * Limit how many Pharmacies to delete.
     */
    limit?: number;
  };

  /**
   * Pharmacy.schedules
   */
  export type Pharmacy$schedulesArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    where?: DutyScheduleWhereInput;
    orderBy?: DutyScheduleOrderByWithRelationInput | DutyScheduleOrderByWithRelationInput[];
    cursor?: DutyScheduleWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: DutyScheduleScalarFieldEnum | DutyScheduleScalarFieldEnum[];
  };

  /**
   * Pharmacy without action
   */
  export type PharmacyDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the Pharmacy
     */
    select?: PharmacySelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pharmacy
     */
    omit?: PharmacyOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PharmacyInclude<ExtArgs> | null;
  };

  /**
   * Model DutySchedule
   */

  export type AggregateDutySchedule = {
    _count: DutyScheduleCountAggregateOutputType | null;
    _min: DutyScheduleMinAggregateOutputType | null;
    _max: DutyScheduleMaxAggregateOutputType | null;
  };

  export type DutyScheduleMinAggregateOutputType = {
    id: string | null;
    pharmacyId: string | null;
    date: Date | null;
    startTime: string | null;
    endTime: string | null;
    type: $Enums.DutyType | null;
    source: string | null;
    createdAt: Date | null;
  };

  export type DutyScheduleMaxAggregateOutputType = {
    id: string | null;
    pharmacyId: string | null;
    date: Date | null;
    startTime: string | null;
    endTime: string | null;
    type: $Enums.DutyType | null;
    source: string | null;
    createdAt: Date | null;
  };

  export type DutyScheduleCountAggregateOutputType = {
    id: number;
    pharmacyId: number;
    date: number;
    startTime: number;
    endTime: number;
    type: number;
    source: number;
    createdAt: number;
    _all: number;
  };

  export type DutyScheduleMinAggregateInputType = {
    id?: true;
    pharmacyId?: true;
    date?: true;
    startTime?: true;
    endTime?: true;
    type?: true;
    source?: true;
    createdAt?: true;
  };

  export type DutyScheduleMaxAggregateInputType = {
    id?: true;
    pharmacyId?: true;
    date?: true;
    startTime?: true;
    endTime?: true;
    type?: true;
    source?: true;
    createdAt?: true;
  };

  export type DutyScheduleCountAggregateInputType = {
    id?: true;
    pharmacyId?: true;
    date?: true;
    startTime?: true;
    endTime?: true;
    type?: true;
    source?: true;
    createdAt?: true;
    _all?: true;
  };

  export type DutyScheduleAggregateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DutySchedule to aggregate.
     */
    where?: DutyScheduleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DutySchedules to fetch.
     */
    orderBy?: DutyScheduleOrderByWithRelationInput | DutyScheduleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: DutyScheduleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DutySchedules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DutySchedules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned DutySchedules
     **/
    _count?: true | DutyScheduleCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
     **/
    _min?: DutyScheduleMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
     **/
    _max?: DutyScheduleMaxAggregateInputType;
  };

  export type GetDutyScheduleAggregateType<T extends DutyScheduleAggregateArgs> = {
    [P in keyof T & keyof AggregateDutySchedule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDutySchedule[P]>
      : GetScalarType<T[P], AggregateDutySchedule[P]>;
  };

  export type DutyScheduleGroupByArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    where?: DutyScheduleWhereInput;
    orderBy?: DutyScheduleOrderByWithAggregationInput | DutyScheduleOrderByWithAggregationInput[];
    by: DutyScheduleScalarFieldEnum[] | DutyScheduleScalarFieldEnum;
    having?: DutyScheduleScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DutyScheduleCountAggregateInputType | true;
    _min?: DutyScheduleMinAggregateInputType;
    _max?: DutyScheduleMaxAggregateInputType;
  };

  export type DutyScheduleGroupByOutputType = {
    id: string;
    pharmacyId: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: $Enums.DutyType;
    source: string | null;
    createdAt: Date;
    _count: DutyScheduleCountAggregateOutputType | null;
    _min: DutyScheduleMinAggregateOutputType | null;
    _max: DutyScheduleMaxAggregateOutputType | null;
  };

  type GetDutyScheduleGroupByPayload<T extends DutyScheduleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DutyScheduleGroupByOutputType, T['by']> & {
        [P in keyof T & keyof DutyScheduleGroupByOutputType]: P extends '_count'
          ? T[P] extends boolean
            ? number
            : GetScalarType<T[P], DutyScheduleGroupByOutputType[P]>
          : GetScalarType<T[P], DutyScheduleGroupByOutputType[P]>;
      }
    >
  >;

  export type DutyScheduleSelect<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      pharmacyId?: boolean;
      date?: boolean;
      startTime?: boolean;
      endTime?: boolean;
      type?: boolean;
      source?: boolean;
      createdAt?: boolean;
      pharmacy?: boolean | PharmacyDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['dutySchedule']
  >;

  export type DutyScheduleSelectCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      pharmacyId?: boolean;
      date?: boolean;
      startTime?: boolean;
      endTime?: boolean;
      type?: boolean;
      source?: boolean;
      createdAt?: boolean;
      pharmacy?: boolean | PharmacyDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['dutySchedule']
  >;

  export type DutyScheduleSelectUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = $Extensions.GetSelect<
    {
      id?: boolean;
      pharmacyId?: boolean;
      date?: boolean;
      startTime?: boolean;
      endTime?: boolean;
      type?: boolean;
      source?: boolean;
      createdAt?: boolean;
      pharmacy?: boolean | PharmacyDefaultArgs<ExtArgs>;
    },
    ExtArgs['result']['dutySchedule']
  >;

  export type DutyScheduleSelectScalar = {
    id?: boolean;
    pharmacyId?: boolean;
    date?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    type?: boolean;
    source?: boolean;
    createdAt?: boolean;
  };

  export type DutyScheduleOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    $Extensions.GetOmit<
      'id' | 'pharmacyId' | 'date' | 'startTime' | 'endTime' | 'type' | 'source' | 'createdAt',
      ExtArgs['result']['dutySchedule']
    >;
  export type DutyScheduleInclude<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    pharmacy?: boolean | PharmacyDefaultArgs<ExtArgs>;
  };
  export type DutyScheduleIncludeCreateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    pharmacy?: boolean | PharmacyDefaultArgs<ExtArgs>;
  };
  export type DutyScheduleIncludeUpdateManyAndReturn<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    pharmacy?: boolean | PharmacyDefaultArgs<ExtArgs>;
  };

  export type $DutySchedulePayload<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    name: 'DutySchedule';
    objects: {
      pharmacy: Prisma.$PharmacyPayload<ExtArgs>;
    };
    scalars: $Extensions.GetPayloadResult<
      {
        id: string;
        pharmacyId: string;
        date: Date;
        startTime: string;
        endTime: string;
        type: $Enums.DutyType;
        source: string | null;
        createdAt: Date;
      },
      ExtArgs['result']['dutySchedule']
    >;
    composites: {};
  };

  type DutyScheduleGetPayload<S extends boolean | null | undefined | DutyScheduleDefaultArgs> =
    $Result.GetResult<Prisma.$DutySchedulePayload, S>;

  type DutyScheduleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DutyScheduleFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DutyScheduleCountAggregateInputType | true;
    };

  export interface DutyScheduleDelegate<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > {
    [K: symbol]: {
      types: Prisma.TypeMap<ExtArgs>['model']['DutySchedule'];
      meta: { name: 'DutySchedule' };
    };
    /**
     * Find zero or one DutySchedule that matches the filter.
     * @param {DutyScheduleFindUniqueArgs} args - Arguments to find a DutySchedule
     * @example
     * // Get one DutySchedule
     * const dutySchedule = await prisma.dutySchedule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DutyScheduleFindUniqueArgs>(
      args: SelectSubset<T, DutyScheduleFindUniqueArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<
        Prisma.$DutySchedulePayload<ExtArgs>,
        T,
        'findUnique',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find one DutySchedule that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DutyScheduleFindUniqueOrThrowArgs} args - Arguments to find a DutySchedule
     * @example
     * // Get one DutySchedule
     * const dutySchedule = await prisma.dutySchedule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DutyScheduleFindUniqueOrThrowArgs>(
      args: SelectSubset<T, DutyScheduleFindUniqueOrThrowArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<
        Prisma.$DutySchedulePayload<ExtArgs>,
        T,
        'findUniqueOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first DutySchedule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleFindFirstArgs} args - Arguments to find a DutySchedule
     * @example
     * // Get one DutySchedule
     * const dutySchedule = await prisma.dutySchedule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DutyScheduleFindFirstArgs>(
      args?: SelectSubset<T, DutyScheduleFindFirstArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<
        Prisma.$DutySchedulePayload<ExtArgs>,
        T,
        'findFirst',
        GlobalOmitOptions
      > | null,
      null,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find the first DutySchedule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleFindFirstOrThrowArgs} args - Arguments to find a DutySchedule
     * @example
     * // Get one DutySchedule
     * const dutySchedule = await prisma.dutySchedule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DutyScheduleFindFirstOrThrowArgs>(
      args?: SelectSubset<T, DutyScheduleFindFirstOrThrowArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<
        Prisma.$DutySchedulePayload<ExtArgs>,
        T,
        'findFirstOrThrow',
        GlobalOmitOptions
      >,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Find zero or more DutySchedules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DutySchedules
     * const dutySchedules = await prisma.dutySchedule.findMany()
     *
     * // Get first 10 DutySchedules
     * const dutySchedules = await prisma.dutySchedule.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const dutyScheduleWithIdOnly = await prisma.dutySchedule.findMany({ select: { id: true } })
     *
     */
    findMany<T extends DutyScheduleFindManyArgs>(
      args?: SelectSubset<T, DutyScheduleFindManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<Prisma.$DutySchedulePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>
    >;

    /**
     * Create a DutySchedule.
     * @param {DutyScheduleCreateArgs} args - Arguments to create a DutySchedule.
     * @example
     * // Create one DutySchedule
     * const DutySchedule = await prisma.dutySchedule.create({
     *   data: {
     *     // ... data to create a DutySchedule
     *   }
     * })
     *
     */
    create<T extends DutyScheduleCreateArgs>(
      args: SelectSubset<T, DutyScheduleCreateArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<Prisma.$DutySchedulePayload<ExtArgs>, T, 'create', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Create many DutySchedules.
     * @param {DutyScheduleCreateManyArgs} args - Arguments to create many DutySchedules.
     * @example
     * // Create many DutySchedules
     * const dutySchedule = await prisma.dutySchedule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends DutyScheduleCreateManyArgs>(
      args?: SelectSubset<T, DutyScheduleCreateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Create many DutySchedules and returns the data saved in the database.
     * @param {DutyScheduleCreateManyAndReturnArgs} args - Arguments to create many DutySchedules.
     * @example
     * // Create many DutySchedules
     * const dutySchedule = await prisma.dutySchedule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many DutySchedules and only return the `id`
     * const dutyScheduleWithIdOnly = await prisma.dutySchedule.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends DutyScheduleCreateManyAndReturnArgs>(
      args?: SelectSubset<T, DutyScheduleCreateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DutySchedulePayload<ExtArgs>,
        T,
        'createManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Delete a DutySchedule.
     * @param {DutyScheduleDeleteArgs} args - Arguments to delete one DutySchedule.
     * @example
     * // Delete one DutySchedule
     * const DutySchedule = await prisma.dutySchedule.delete({
     *   where: {
     *     // ... filter to delete one DutySchedule
     *   }
     * })
     *
     */
    delete<T extends DutyScheduleDeleteArgs>(
      args: SelectSubset<T, DutyScheduleDeleteArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<Prisma.$DutySchedulePayload<ExtArgs>, T, 'delete', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Update one DutySchedule.
     * @param {DutyScheduleUpdateArgs} args - Arguments to update one DutySchedule.
     * @example
     * // Update one DutySchedule
     * const dutySchedule = await prisma.dutySchedule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends DutyScheduleUpdateArgs>(
      args: SelectSubset<T, DutyScheduleUpdateArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<Prisma.$DutySchedulePayload<ExtArgs>, T, 'update', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Delete zero or more DutySchedules.
     * @param {DutyScheduleDeleteManyArgs} args - Arguments to filter DutySchedules to delete.
     * @example
     * // Delete a few DutySchedules
     * const { count } = await prisma.dutySchedule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends DutyScheduleDeleteManyArgs>(
      args?: SelectSubset<T, DutyScheduleDeleteManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more DutySchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DutySchedules
     * const dutySchedule = await prisma.dutySchedule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends DutyScheduleUpdateManyArgs>(
      args: SelectSubset<T, DutyScheduleUpdateManyArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<BatchPayload>;

    /**
     * Update zero or more DutySchedules and returns the data updated in the database.
     * @param {DutyScheduleUpdateManyAndReturnArgs} args - Arguments to update many DutySchedules.
     * @example
     * // Update many DutySchedules
     * const dutySchedule = await prisma.dutySchedule.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more DutySchedules and only return the `id`
     * const dutyScheduleWithIdOnly = await prisma.dutySchedule.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends DutyScheduleUpdateManyAndReturnArgs>(
      args: SelectSubset<T, DutyScheduleUpdateManyAndReturnArgs<ExtArgs>>,
    ): Prisma.PrismaPromise<
      $Result.GetResult<
        Prisma.$DutySchedulePayload<ExtArgs>,
        T,
        'updateManyAndReturn',
        GlobalOmitOptions
      >
    >;

    /**
     * Create or update one DutySchedule.
     * @param {DutyScheduleUpsertArgs} args - Arguments to update or create a DutySchedule.
     * @example
     * // Update or create a DutySchedule
     * const dutySchedule = await prisma.dutySchedule.upsert({
     *   create: {
     *     // ... data to create a DutySchedule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DutySchedule we want to update
     *   }
     * })
     */
    upsert<T extends DutyScheduleUpsertArgs>(
      args: SelectSubset<T, DutyScheduleUpsertArgs<ExtArgs>>,
    ): Prisma__DutyScheduleClient<
      $Result.GetResult<Prisma.$DutySchedulePayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>,
      never,
      ExtArgs,
      GlobalOmitOptions
    >;

    /**
     * Count the number of DutySchedules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleCountArgs} args - Arguments to filter DutySchedules to count.
     * @example
     * // Count the number of DutySchedules
     * const count = await prisma.dutySchedule.count({
     *   where: {
     *     // ... the filter for the DutySchedules we want to count
     *   }
     * })
     **/
    count<T extends DutyScheduleCountArgs>(
      args?: Subset<T, DutyScheduleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DutyScheduleCountAggregateOutputType>
        : number
    >;

    /**
     * Allows you to perform aggregations operations on a DutySchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
     **/
    aggregate<T extends DutyScheduleAggregateArgs>(
      args: Subset<T, DutyScheduleAggregateArgs>,
    ): Prisma.PrismaPromise<GetDutyScheduleAggregateType<T>>;

    /**
     * Group by DutySchedule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DutyScheduleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
     **/
    groupBy<
      T extends DutyScheduleGroupByArgs,
      HasSelectOrTake extends Or<Extends<'skip', Keys<T>>, Extends<'take', Keys<T>>>,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DutyScheduleGroupByArgs['orderBy'] }
        : { orderBy?: DutyScheduleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
        ? `Error: "by" must not be empty.`
        : HavingValid extends False
          ? {
              [P in HavingFields]: P extends ByFields
                ? never
                : P extends string
                  ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
                  : [Error, 'Field ', P, ` in "having" needs to be provided in "by"`];
            }[HavingFields]
          : 'take' extends Keys<T>
            ? 'orderBy' extends Keys<T>
              ? ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields]
              : 'Error: If you provide "take", you also need to provide "orderBy"'
            : 'skip' extends Keys<T>
              ? 'orderBy' extends Keys<T>
                ? ByValid extends True
                  ? {}
                  : {
                      [P in OrderFields]: P extends ByFields
                        ? never
                        : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                    }[OrderFields]
                : 'Error: If you provide "skip", you also need to provide "orderBy"'
              : ByValid extends True
                ? {}
                : {
                    [P in OrderFields]: P extends ByFields
                      ? never
                      : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
                  }[OrderFields],
    >(
      args: SubsetIntersection<T, DutyScheduleGroupByArgs, OrderByArg> & InputErrors,
    ): {} extends InputErrors
      ? GetDutyScheduleGroupByPayload<T>
      : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the DutySchedule model
     */
    readonly fields: DutyScheduleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DutySchedule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DutyScheduleClient<
    T,
    Null = never,
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
    GlobalOmitOptions = {},
  > extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    pharmacy<T extends PharmacyDefaultArgs<ExtArgs> = {}>(
      args?: Subset<T, PharmacyDefaultArgs<ExtArgs>>,
    ): Prisma__PharmacyClient<
      | $Result.GetResult<
          Prisma.$PharmacyPayload<ExtArgs>,
          T,
          'findUniqueOrThrow',
          GlobalOmitOptions
        >
      | Null,
      Null,
      ExtArgs,
      GlobalOmitOptions
    >;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(
      onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
      onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
    ): $Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(
      onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
    ): $Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>;
  }

  /**
   * Fields of the DutySchedule model
   */
  interface DutyScheduleFieldRefs {
    readonly id: FieldRef<'DutySchedule', 'String'>;
    readonly pharmacyId: FieldRef<'DutySchedule', 'String'>;
    readonly date: FieldRef<'DutySchedule', 'DateTime'>;
    readonly startTime: FieldRef<'DutySchedule', 'String'>;
    readonly endTime: FieldRef<'DutySchedule', 'String'>;
    readonly type: FieldRef<'DutySchedule', 'DutyType'>;
    readonly source: FieldRef<'DutySchedule', 'String'>;
    readonly createdAt: FieldRef<'DutySchedule', 'DateTime'>;
  }

  // Custom InputTypes
  /**
   * DutySchedule findUnique
   */
  export type DutyScheduleFindUniqueArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * Filter, which DutySchedule to fetch.
     */
    where: DutyScheduleWhereUniqueInput;
  };

  /**
   * DutySchedule findUniqueOrThrow
   */
  export type DutyScheduleFindUniqueOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * Filter, which DutySchedule to fetch.
     */
    where: DutyScheduleWhereUniqueInput;
  };

  /**
   * DutySchedule findFirst
   */
  export type DutyScheduleFindFirstArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * Filter, which DutySchedule to fetch.
     */
    where?: DutyScheduleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DutySchedules to fetch.
     */
    orderBy?: DutyScheduleOrderByWithRelationInput | DutyScheduleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DutySchedules.
     */
    cursor?: DutyScheduleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DutySchedules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DutySchedules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DutySchedules.
     */
    distinct?: DutyScheduleScalarFieldEnum | DutyScheduleScalarFieldEnum[];
  };

  /**
   * DutySchedule findFirstOrThrow
   */
  export type DutyScheduleFindFirstOrThrowArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * Filter, which DutySchedule to fetch.
     */
    where?: DutyScheduleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DutySchedules to fetch.
     */
    orderBy?: DutyScheduleOrderByWithRelationInput | DutyScheduleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for DutySchedules.
     */
    cursor?: DutyScheduleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DutySchedules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DutySchedules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DutySchedules.
     */
    distinct?: DutyScheduleScalarFieldEnum | DutyScheduleScalarFieldEnum[];
  };

  /**
   * DutySchedule findMany
   */
  export type DutyScheduleFindManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * Filter, which DutySchedules to fetch.
     */
    where?: DutyScheduleWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of DutySchedules to fetch.
     */
    orderBy?: DutyScheduleOrderByWithRelationInput | DutyScheduleOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing DutySchedules.
     */
    cursor?: DutyScheduleWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` DutySchedules from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` DutySchedules.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of DutySchedules.
     */
    distinct?: DutyScheduleScalarFieldEnum | DutyScheduleScalarFieldEnum[];
  };

  /**
   * DutySchedule create
   */
  export type DutyScheduleCreateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * The data needed to create a DutySchedule.
     */
    data: XOR<DutyScheduleCreateInput, DutyScheduleUncheckedCreateInput>;
  };

  /**
   * DutySchedule createMany
   */
  export type DutyScheduleCreateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to create many DutySchedules.
     */
    data: DutyScheduleCreateManyInput | DutyScheduleCreateManyInput[];
    skipDuplicates?: boolean;
  };

  /**
   * DutySchedule createManyAndReturn
   */
  export type DutyScheduleCreateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * The data used to create many DutySchedules.
     */
    data: DutyScheduleCreateManyInput | DutyScheduleCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleIncludeCreateManyAndReturn<ExtArgs> | null;
  };

  /**
   * DutySchedule update
   */
  export type DutyScheduleUpdateArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * The data needed to update a DutySchedule.
     */
    data: XOR<DutyScheduleUpdateInput, DutyScheduleUncheckedUpdateInput>;
    /**
     * Choose, which DutySchedule to update.
     */
    where: DutyScheduleWhereUniqueInput;
  };

  /**
   * DutySchedule updateMany
   */
  export type DutyScheduleUpdateManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * The data used to update DutySchedules.
     */
    data: XOR<DutyScheduleUpdateManyMutationInput, DutyScheduleUncheckedUpdateManyInput>;
    /**
     * Filter which DutySchedules to update
     */
    where?: DutyScheduleWhereInput;
    /**
     * Limit how many DutySchedules to update.
     */
    limit?: number;
  };

  /**
   * DutySchedule updateManyAndReturn
   */
  export type DutyScheduleUpdateManyAndReturnArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * The data used to update DutySchedules.
     */
    data: XOR<DutyScheduleUpdateManyMutationInput, DutyScheduleUncheckedUpdateManyInput>;
    /**
     * Filter which DutySchedules to update
     */
    where?: DutyScheduleWhereInput;
    /**
     * Limit how many DutySchedules to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleIncludeUpdateManyAndReturn<ExtArgs> | null;
  };

  /**
   * DutySchedule upsert
   */
  export type DutyScheduleUpsertArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * The filter to search for the DutySchedule to update in case it exists.
     */
    where: DutyScheduleWhereUniqueInput;
    /**
     * In case the DutySchedule found by the `where` argument doesn't exist, create a new DutySchedule with this data.
     */
    create: XOR<DutyScheduleCreateInput, DutyScheduleUncheckedCreateInput>;
    /**
     * In case the DutySchedule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DutyScheduleUpdateInput, DutyScheduleUncheckedUpdateInput>;
  };

  /**
   * DutySchedule delete
   */
  export type DutyScheduleDeleteArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
    /**
     * Filter which DutySchedule to delete.
     */
    where: DutyScheduleWhereUniqueInput;
  };

  /**
   * DutySchedule deleteMany
   */
  export type DutyScheduleDeleteManyArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Filter which DutySchedules to delete
     */
    where?: DutyScheduleWhereInput;
    /**
     * Limit how many DutySchedules to delete.
     */
    limit?: number;
  };

  /**
   * DutySchedule without action
   */
  export type DutyScheduleDefaultArgs<
    ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs,
  > = {
    /**
     * Select specific fields to fetch from the DutySchedule
     */
    select?: DutyScheduleSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DutySchedule
     */
    omit?: DutyScheduleOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: DutyScheduleInclude<ExtArgs> | null;
  };

  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };

  export type TransactionIsolationLevel =
    (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];

  export const ProvinceScalarFieldEnum: {
    id: 'id';
    name: 'name';
    code: 'code';
  };

  export type ProvinceScalarFieldEnum =
    (typeof ProvinceScalarFieldEnum)[keyof typeof ProvinceScalarFieldEnum];

  export const CityScalarFieldEnum: {
    id: 'id';
    name: 'name';
    provinceId: 'provinceId';
  };

  export type CityScalarFieldEnum = (typeof CityScalarFieldEnum)[keyof typeof CityScalarFieldEnum];

  export const PharmacyScalarFieldEnum: {
    id: 'id';
    name: 'name';
    ownerName: 'ownerName';
    address: 'address';
    phone: 'phone';
    cityId: 'cityId';
    createdAt: 'createdAt';
    updatedAt: 'updatedAt';
  };

  export type PharmacyScalarFieldEnum =
    (typeof PharmacyScalarFieldEnum)[keyof typeof PharmacyScalarFieldEnum];

  export const DutyScheduleScalarFieldEnum: {
    id: 'id';
    pharmacyId: 'pharmacyId';
    date: 'date';
    startTime: 'startTime';
    endTime: 'endTime';
    type: 'type';
    source: 'source';
    createdAt: 'createdAt';
  };

  export type DutyScheduleScalarFieldEnum =
    (typeof DutyScheduleScalarFieldEnum)[keyof typeof DutyScheduleScalarFieldEnum];

  export const SortOrder: {
    asc: 'asc';
    desc: 'desc';
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

  export const QueryMode: {
    default: 'default';
    insensitive: 'insensitive';
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];

  export const NullsOrder: {
    first: 'first';
    last: 'last';
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];

  /**
   * Field references
   */

  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;

  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;

  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;

  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DateTime[]'
  >;

  /**
   * Reference to a field of type 'DutyType'
   */
  export type EnumDutyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DutyType'>;

  /**
   * Reference to a field of type 'DutyType[]'
   */
  export type ListEnumDutyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<
    $PrismaModel,
    'DutyType[]'
  >;

  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;

  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;

  /**
   * Deep Input Types
   */

  export type ProvinceWhereInput = {
    AND?: ProvinceWhereInput | ProvinceWhereInput[];
    OR?: ProvinceWhereInput[];
    NOT?: ProvinceWhereInput | ProvinceWhereInput[];
    id?: StringFilter<'Province'> | string;
    name?: StringFilter<'Province'> | string;
    code?: StringFilter<'Province'> | string;
    cities?: CityListRelationFilter;
  };

  export type ProvinceOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    code?: SortOrder;
    cities?: CityOrderByRelationAggregateInput;
  };

  export type ProvinceWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      name?: string;
      code?: string;
      AND?: ProvinceWhereInput | ProvinceWhereInput[];
      OR?: ProvinceWhereInput[];
      NOT?: ProvinceWhereInput | ProvinceWhereInput[];
      cities?: CityListRelationFilter;
    },
    'id' | 'name' | 'code'
  >;

  export type ProvinceOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    code?: SortOrder;
    _count?: ProvinceCountOrderByAggregateInput;
    _max?: ProvinceMaxOrderByAggregateInput;
    _min?: ProvinceMinOrderByAggregateInput;
  };

  export type ProvinceScalarWhereWithAggregatesInput = {
    AND?: ProvinceScalarWhereWithAggregatesInput | ProvinceScalarWhereWithAggregatesInput[];
    OR?: ProvinceScalarWhereWithAggregatesInput[];
    NOT?: ProvinceScalarWhereWithAggregatesInput | ProvinceScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Province'> | string;
    name?: StringWithAggregatesFilter<'Province'> | string;
    code?: StringWithAggregatesFilter<'Province'> | string;
  };

  export type CityWhereInput = {
    AND?: CityWhereInput | CityWhereInput[];
    OR?: CityWhereInput[];
    NOT?: CityWhereInput | CityWhereInput[];
    id?: StringFilter<'City'> | string;
    name?: StringFilter<'City'> | string;
    provinceId?: StringFilter<'City'> | string;
    province?: XOR<ProvinceScalarRelationFilter, ProvinceWhereInput>;
    pharmacies?: PharmacyListRelationFilter;
  };

  export type CityOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    provinceId?: SortOrder;
    province?: ProvinceOrderByWithRelationInput;
    pharmacies?: PharmacyOrderByRelationAggregateInput;
  };

  export type CityWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      name_provinceId?: CityNameProvinceIdCompoundUniqueInput;
      AND?: CityWhereInput | CityWhereInput[];
      OR?: CityWhereInput[];
      NOT?: CityWhereInput | CityWhereInput[];
      name?: StringFilter<'City'> | string;
      provinceId?: StringFilter<'City'> | string;
      province?: XOR<ProvinceScalarRelationFilter, ProvinceWhereInput>;
      pharmacies?: PharmacyListRelationFilter;
    },
    'id' | 'name_provinceId'
  >;

  export type CityOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    provinceId?: SortOrder;
    _count?: CityCountOrderByAggregateInput;
    _max?: CityMaxOrderByAggregateInput;
    _min?: CityMinOrderByAggregateInput;
  };

  export type CityScalarWhereWithAggregatesInput = {
    AND?: CityScalarWhereWithAggregatesInput | CityScalarWhereWithAggregatesInput[];
    OR?: CityScalarWhereWithAggregatesInput[];
    NOT?: CityScalarWhereWithAggregatesInput | CityScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'City'> | string;
    name?: StringWithAggregatesFilter<'City'> | string;
    provinceId?: StringWithAggregatesFilter<'City'> | string;
  };

  export type PharmacyWhereInput = {
    AND?: PharmacyWhereInput | PharmacyWhereInput[];
    OR?: PharmacyWhereInput[];
    NOT?: PharmacyWhereInput | PharmacyWhereInput[];
    id?: StringFilter<'Pharmacy'> | string;
    name?: StringFilter<'Pharmacy'> | string;
    ownerName?: StringNullableFilter<'Pharmacy'> | string | null;
    address?: StringFilter<'Pharmacy'> | string;
    phone?: StringNullableFilter<'Pharmacy'> | string | null;
    cityId?: StringFilter<'Pharmacy'> | string;
    createdAt?: DateTimeFilter<'Pharmacy'> | Date | string;
    updatedAt?: DateTimeFilter<'Pharmacy'> | Date | string;
    city?: XOR<CityScalarRelationFilter, CityWhereInput>;
    schedules?: DutyScheduleListRelationFilter;
  };

  export type PharmacyOrderByWithRelationInput = {
    id?: SortOrder;
    name?: SortOrder;
    ownerName?: SortOrderInput | SortOrder;
    address?: SortOrder;
    phone?: SortOrderInput | SortOrder;
    cityId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    city?: CityOrderByWithRelationInput;
    schedules?: DutyScheduleOrderByRelationAggregateInput;
  };

  export type PharmacyWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      AND?: PharmacyWhereInput | PharmacyWhereInput[];
      OR?: PharmacyWhereInput[];
      NOT?: PharmacyWhereInput | PharmacyWhereInput[];
      name?: StringFilter<'Pharmacy'> | string;
      ownerName?: StringNullableFilter<'Pharmacy'> | string | null;
      address?: StringFilter<'Pharmacy'> | string;
      phone?: StringNullableFilter<'Pharmacy'> | string | null;
      cityId?: StringFilter<'Pharmacy'> | string;
      createdAt?: DateTimeFilter<'Pharmacy'> | Date | string;
      updatedAt?: DateTimeFilter<'Pharmacy'> | Date | string;
      city?: XOR<CityScalarRelationFilter, CityWhereInput>;
      schedules?: DutyScheduleListRelationFilter;
    },
    'id'
  >;

  export type PharmacyOrderByWithAggregationInput = {
    id?: SortOrder;
    name?: SortOrder;
    ownerName?: SortOrderInput | SortOrder;
    address?: SortOrder;
    phone?: SortOrderInput | SortOrder;
    cityId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
    _count?: PharmacyCountOrderByAggregateInput;
    _max?: PharmacyMaxOrderByAggregateInput;
    _min?: PharmacyMinOrderByAggregateInput;
  };

  export type PharmacyScalarWhereWithAggregatesInput = {
    AND?: PharmacyScalarWhereWithAggregatesInput | PharmacyScalarWhereWithAggregatesInput[];
    OR?: PharmacyScalarWhereWithAggregatesInput[];
    NOT?: PharmacyScalarWhereWithAggregatesInput | PharmacyScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'Pharmacy'> | string;
    name?: StringWithAggregatesFilter<'Pharmacy'> | string;
    ownerName?: StringNullableWithAggregatesFilter<'Pharmacy'> | string | null;
    address?: StringWithAggregatesFilter<'Pharmacy'> | string;
    phone?: StringNullableWithAggregatesFilter<'Pharmacy'> | string | null;
    cityId?: StringWithAggregatesFilter<'Pharmacy'> | string;
    createdAt?: DateTimeWithAggregatesFilter<'Pharmacy'> | Date | string;
    updatedAt?: DateTimeWithAggregatesFilter<'Pharmacy'> | Date | string;
  };

  export type DutyScheduleWhereInput = {
    AND?: DutyScheduleWhereInput | DutyScheduleWhereInput[];
    OR?: DutyScheduleWhereInput[];
    NOT?: DutyScheduleWhereInput | DutyScheduleWhereInput[];
    id?: StringFilter<'DutySchedule'> | string;
    pharmacyId?: StringFilter<'DutySchedule'> | string;
    date?: DateTimeFilter<'DutySchedule'> | Date | string;
    startTime?: StringFilter<'DutySchedule'> | string;
    endTime?: StringFilter<'DutySchedule'> | string;
    type?: EnumDutyTypeFilter<'DutySchedule'> | $Enums.DutyType;
    source?: StringNullableFilter<'DutySchedule'> | string | null;
    createdAt?: DateTimeFilter<'DutySchedule'> | Date | string;
    pharmacy?: XOR<PharmacyScalarRelationFilter, PharmacyWhereInput>;
  };

  export type DutyScheduleOrderByWithRelationInput = {
    id?: SortOrder;
    pharmacyId?: SortOrder;
    date?: SortOrder;
    startTime?: SortOrder;
    endTime?: SortOrder;
    type?: SortOrder;
    source?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    pharmacy?: PharmacyOrderByWithRelationInput;
  };

  export type DutyScheduleWhereUniqueInput = Prisma.AtLeast<
    {
      id?: string;
      pharmacyId_date?: DutySchedulePharmacyIdDateCompoundUniqueInput;
      AND?: DutyScheduleWhereInput | DutyScheduleWhereInput[];
      OR?: DutyScheduleWhereInput[];
      NOT?: DutyScheduleWhereInput | DutyScheduleWhereInput[];
      pharmacyId?: StringFilter<'DutySchedule'> | string;
      date?: DateTimeFilter<'DutySchedule'> | Date | string;
      startTime?: StringFilter<'DutySchedule'> | string;
      endTime?: StringFilter<'DutySchedule'> | string;
      type?: EnumDutyTypeFilter<'DutySchedule'> | $Enums.DutyType;
      source?: StringNullableFilter<'DutySchedule'> | string | null;
      createdAt?: DateTimeFilter<'DutySchedule'> | Date | string;
      pharmacy?: XOR<PharmacyScalarRelationFilter, PharmacyWhereInput>;
    },
    'id' | 'pharmacyId_date'
  >;

  export type DutyScheduleOrderByWithAggregationInput = {
    id?: SortOrder;
    pharmacyId?: SortOrder;
    date?: SortOrder;
    startTime?: SortOrder;
    endTime?: SortOrder;
    type?: SortOrder;
    source?: SortOrderInput | SortOrder;
    createdAt?: SortOrder;
    _count?: DutyScheduleCountOrderByAggregateInput;
    _max?: DutyScheduleMaxOrderByAggregateInput;
    _min?: DutyScheduleMinOrderByAggregateInput;
  };

  export type DutyScheduleScalarWhereWithAggregatesInput = {
    AND?: DutyScheduleScalarWhereWithAggregatesInput | DutyScheduleScalarWhereWithAggregatesInput[];
    OR?: DutyScheduleScalarWhereWithAggregatesInput[];
    NOT?: DutyScheduleScalarWhereWithAggregatesInput | DutyScheduleScalarWhereWithAggregatesInput[];
    id?: StringWithAggregatesFilter<'DutySchedule'> | string;
    pharmacyId?: StringWithAggregatesFilter<'DutySchedule'> | string;
    date?: DateTimeWithAggregatesFilter<'DutySchedule'> | Date | string;
    startTime?: StringWithAggregatesFilter<'DutySchedule'> | string;
    endTime?: StringWithAggregatesFilter<'DutySchedule'> | string;
    type?: EnumDutyTypeWithAggregatesFilter<'DutySchedule'> | $Enums.DutyType;
    source?: StringNullableWithAggregatesFilter<'DutySchedule'> | string | null;
    createdAt?: DateTimeWithAggregatesFilter<'DutySchedule'> | Date | string;
  };

  export type ProvinceCreateInput = {
    id?: string;
    name: string;
    code: string;
    cities?: CityCreateNestedManyWithoutProvinceInput;
  };

  export type ProvinceUncheckedCreateInput = {
    id?: string;
    name: string;
    code: string;
    cities?: CityUncheckedCreateNestedManyWithoutProvinceInput;
  };

  export type ProvinceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
    cities?: CityUpdateManyWithoutProvinceNestedInput;
  };

  export type ProvinceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
    cities?: CityUncheckedUpdateManyWithoutProvinceNestedInput;
  };

  export type ProvinceCreateManyInput = {
    id?: string;
    name: string;
    code: string;
  };

  export type ProvinceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
  };

  export type ProvinceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
  };

  export type CityCreateInput = {
    id?: string;
    name: string;
    province: ProvinceCreateNestedOneWithoutCitiesInput;
    pharmacies?: PharmacyCreateNestedManyWithoutCityInput;
  };

  export type CityUncheckedCreateInput = {
    id?: string;
    name: string;
    provinceId: string;
    pharmacies?: PharmacyUncheckedCreateNestedManyWithoutCityInput;
  };

  export type CityUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    province?: ProvinceUpdateOneRequiredWithoutCitiesNestedInput;
    pharmacies?: PharmacyUpdateManyWithoutCityNestedInput;
  };

  export type CityUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    provinceId?: StringFieldUpdateOperationsInput | string;
    pharmacies?: PharmacyUncheckedUpdateManyWithoutCityNestedInput;
  };

  export type CityCreateManyInput = {
    id?: string;
    name: string;
    provinceId: string;
  };

  export type CityUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type CityUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    provinceId?: StringFieldUpdateOperationsInput | string;
  };

  export type PharmacyCreateInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    city: CityCreateNestedOneWithoutPharmaciesInput;
    schedules?: DutyScheduleCreateNestedManyWithoutPharmacyInput;
  };

  export type PharmacyUncheckedCreateInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    cityId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    schedules?: DutyScheduleUncheckedCreateNestedManyWithoutPharmacyInput;
  };

  export type PharmacyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    city?: CityUpdateOneRequiredWithoutPharmaciesNestedInput;
    schedules?: DutyScheduleUpdateManyWithoutPharmacyNestedInput;
  };

  export type PharmacyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    cityId?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    schedules?: DutyScheduleUncheckedUpdateManyWithoutPharmacyNestedInput;
  };

  export type PharmacyCreateManyInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    cityId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PharmacyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type PharmacyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    cityId?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DutyScheduleCreateInput = {
    id?: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    type?: $Enums.DutyType;
    source?: string | null;
    createdAt?: Date | string;
    pharmacy: PharmacyCreateNestedOneWithoutSchedulesInput;
  };

  export type DutyScheduleUncheckedCreateInput = {
    id?: string;
    pharmacyId: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    type?: $Enums.DutyType;
    source?: string | null;
    createdAt?: Date | string;
  };

  export type DutyScheduleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    pharmacy?: PharmacyUpdateOneRequiredWithoutSchedulesNestedInput;
  };

  export type DutyScheduleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pharmacyId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DutyScheduleCreateManyInput = {
    id?: string;
    pharmacyId: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    type?: $Enums.DutyType;
    source?: string | null;
    createdAt?: Date | string;
  };

  export type DutyScheduleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DutyScheduleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    pharmacyId?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type CityListRelationFilter = {
    every?: CityWhereInput;
    some?: CityWhereInput;
    none?: CityWhereInput;
  };

  export type CityOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type ProvinceCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    code?: SortOrder;
  };

  export type ProvinceMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    code?: SortOrder;
  };

  export type ProvinceMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    code?: SortOrder;
  };

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type ProvinceScalarRelationFilter = {
    is?: ProvinceWhereInput;
    isNot?: ProvinceWhereInput;
  };

  export type PharmacyListRelationFilter = {
    every?: PharmacyWhereInput;
    some?: PharmacyWhereInput;
    none?: PharmacyWhereInput;
  };

  export type PharmacyOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type CityNameProvinceIdCompoundUniqueInput = {
    name: string;
    provinceId: string;
  };

  export type CityCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    provinceId?: SortOrder;
  };

  export type CityMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    provinceId?: SortOrder;
  };

  export type CityMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    provinceId?: SortOrder;
  };

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type CityScalarRelationFilter = {
    is?: CityWhereInput;
    isNot?: CityWhereInput;
  };

  export type DutyScheduleListRelationFilter = {
    every?: DutyScheduleWhereInput;
    some?: DutyScheduleWhereInput;
    none?: DutyScheduleWhereInput;
  };

  export type SortOrderInput = {
    sort: SortOrder;
    nulls?: NullsOrder;
  };

  export type DutyScheduleOrderByRelationAggregateInput = {
    _count?: SortOrder;
  };

  export type PharmacyCountOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    ownerName?: SortOrder;
    address?: SortOrder;
    phone?: SortOrder;
    cityId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PharmacyMaxOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    ownerName?: SortOrder;
    address?: SortOrder;
    phone?: SortOrder;
    cityId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type PharmacyMinOrderByAggregateInput = {
    id?: SortOrder;
    name?: SortOrder;
    ownerName?: SortOrder;
    address?: SortOrder;
    phone?: SortOrder;
    cityId?: SortOrder;
    createdAt?: SortOrder;
    updatedAt?: SortOrder;
  };

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    mode?: QueryMode;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type EnumDutyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DutyType | EnumDutyTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumDutyTypeFilter<$PrismaModel> | $Enums.DutyType;
  };

  export type PharmacyScalarRelationFilter = {
    is?: PharmacyWhereInput;
    isNot?: PharmacyWhereInput;
  };

  export type DutySchedulePharmacyIdDateCompoundUniqueInput = {
    pharmacyId: string;
    date: Date | string;
  };

  export type DutyScheduleCountOrderByAggregateInput = {
    id?: SortOrder;
    pharmacyId?: SortOrder;
    date?: SortOrder;
    startTime?: SortOrder;
    endTime?: SortOrder;
    type?: SortOrder;
    source?: SortOrder;
    createdAt?: SortOrder;
  };

  export type DutyScheduleMaxOrderByAggregateInput = {
    id?: SortOrder;
    pharmacyId?: SortOrder;
    date?: SortOrder;
    startTime?: SortOrder;
    endTime?: SortOrder;
    type?: SortOrder;
    source?: SortOrder;
    createdAt?: SortOrder;
  };

  export type DutyScheduleMinOrderByAggregateInput = {
    id?: SortOrder;
    pharmacyId?: SortOrder;
    date?: SortOrder;
    startTime?: SortOrder;
    endTime?: SortOrder;
    type?: SortOrder;
    source?: SortOrder;
    createdAt?: SortOrder;
  };

  export type EnumDutyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DutyType | EnumDutyTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumDutyTypeWithAggregatesFilter<$PrismaModel> | $Enums.DutyType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumDutyTypeFilter<$PrismaModel>;
    _max?: NestedEnumDutyTypeFilter<$PrismaModel>;
  };

  export type CityCreateNestedManyWithoutProvinceInput = {
    create?:
      | XOR<CityCreateWithoutProvinceInput, CityUncheckedCreateWithoutProvinceInput>
      | CityCreateWithoutProvinceInput[]
      | CityUncheckedCreateWithoutProvinceInput[];
    connectOrCreate?:
      | CityCreateOrConnectWithoutProvinceInput
      | CityCreateOrConnectWithoutProvinceInput[];
    createMany?: CityCreateManyProvinceInputEnvelope;
    connect?: CityWhereUniqueInput | CityWhereUniqueInput[];
  };

  export type CityUncheckedCreateNestedManyWithoutProvinceInput = {
    create?:
      | XOR<CityCreateWithoutProvinceInput, CityUncheckedCreateWithoutProvinceInput>
      | CityCreateWithoutProvinceInput[]
      | CityUncheckedCreateWithoutProvinceInput[];
    connectOrCreate?:
      | CityCreateOrConnectWithoutProvinceInput
      | CityCreateOrConnectWithoutProvinceInput[];
    createMany?: CityCreateManyProvinceInputEnvelope;
    connect?: CityWhereUniqueInput | CityWhereUniqueInput[];
  };

  export type StringFieldUpdateOperationsInput = {
    set?: string;
  };

  export type CityUpdateManyWithoutProvinceNestedInput = {
    create?:
      | XOR<CityCreateWithoutProvinceInput, CityUncheckedCreateWithoutProvinceInput>
      | CityCreateWithoutProvinceInput[]
      | CityUncheckedCreateWithoutProvinceInput[];
    connectOrCreate?:
      | CityCreateOrConnectWithoutProvinceInput
      | CityCreateOrConnectWithoutProvinceInput[];
    upsert?:
      | CityUpsertWithWhereUniqueWithoutProvinceInput
      | CityUpsertWithWhereUniqueWithoutProvinceInput[];
    createMany?: CityCreateManyProvinceInputEnvelope;
    set?: CityWhereUniqueInput | CityWhereUniqueInput[];
    disconnect?: CityWhereUniqueInput | CityWhereUniqueInput[];
    delete?: CityWhereUniqueInput | CityWhereUniqueInput[];
    connect?: CityWhereUniqueInput | CityWhereUniqueInput[];
    update?:
      | CityUpdateWithWhereUniqueWithoutProvinceInput
      | CityUpdateWithWhereUniqueWithoutProvinceInput[];
    updateMany?:
      | CityUpdateManyWithWhereWithoutProvinceInput
      | CityUpdateManyWithWhereWithoutProvinceInput[];
    deleteMany?: CityScalarWhereInput | CityScalarWhereInput[];
  };

  export type CityUncheckedUpdateManyWithoutProvinceNestedInput = {
    create?:
      | XOR<CityCreateWithoutProvinceInput, CityUncheckedCreateWithoutProvinceInput>
      | CityCreateWithoutProvinceInput[]
      | CityUncheckedCreateWithoutProvinceInput[];
    connectOrCreate?:
      | CityCreateOrConnectWithoutProvinceInput
      | CityCreateOrConnectWithoutProvinceInput[];
    upsert?:
      | CityUpsertWithWhereUniqueWithoutProvinceInput
      | CityUpsertWithWhereUniqueWithoutProvinceInput[];
    createMany?: CityCreateManyProvinceInputEnvelope;
    set?: CityWhereUniqueInput | CityWhereUniqueInput[];
    disconnect?: CityWhereUniqueInput | CityWhereUniqueInput[];
    delete?: CityWhereUniqueInput | CityWhereUniqueInput[];
    connect?: CityWhereUniqueInput | CityWhereUniqueInput[];
    update?:
      | CityUpdateWithWhereUniqueWithoutProvinceInput
      | CityUpdateWithWhereUniqueWithoutProvinceInput[];
    updateMany?:
      | CityUpdateManyWithWhereWithoutProvinceInput
      | CityUpdateManyWithWhereWithoutProvinceInput[];
    deleteMany?: CityScalarWhereInput | CityScalarWhereInput[];
  };

  export type ProvinceCreateNestedOneWithoutCitiesInput = {
    create?: XOR<ProvinceCreateWithoutCitiesInput, ProvinceUncheckedCreateWithoutCitiesInput>;
    connectOrCreate?: ProvinceCreateOrConnectWithoutCitiesInput;
    connect?: ProvinceWhereUniqueInput;
  };

  export type PharmacyCreateNestedManyWithoutCityInput = {
    create?:
      | XOR<PharmacyCreateWithoutCityInput, PharmacyUncheckedCreateWithoutCityInput>
      | PharmacyCreateWithoutCityInput[]
      | PharmacyUncheckedCreateWithoutCityInput[];
    connectOrCreate?:
      | PharmacyCreateOrConnectWithoutCityInput
      | PharmacyCreateOrConnectWithoutCityInput[];
    createMany?: PharmacyCreateManyCityInputEnvelope;
    connect?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
  };

  export type PharmacyUncheckedCreateNestedManyWithoutCityInput = {
    create?:
      | XOR<PharmacyCreateWithoutCityInput, PharmacyUncheckedCreateWithoutCityInput>
      | PharmacyCreateWithoutCityInput[]
      | PharmacyUncheckedCreateWithoutCityInput[];
    connectOrCreate?:
      | PharmacyCreateOrConnectWithoutCityInput
      | PharmacyCreateOrConnectWithoutCityInput[];
    createMany?: PharmacyCreateManyCityInputEnvelope;
    connect?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
  };

  export type ProvinceUpdateOneRequiredWithoutCitiesNestedInput = {
    create?: XOR<ProvinceCreateWithoutCitiesInput, ProvinceUncheckedCreateWithoutCitiesInput>;
    connectOrCreate?: ProvinceCreateOrConnectWithoutCitiesInput;
    upsert?: ProvinceUpsertWithoutCitiesInput;
    connect?: ProvinceWhereUniqueInput;
    update?: XOR<
      XOR<ProvinceUpdateToOneWithWhereWithoutCitiesInput, ProvinceUpdateWithoutCitiesInput>,
      ProvinceUncheckedUpdateWithoutCitiesInput
    >;
  };

  export type PharmacyUpdateManyWithoutCityNestedInput = {
    create?:
      | XOR<PharmacyCreateWithoutCityInput, PharmacyUncheckedCreateWithoutCityInput>
      | PharmacyCreateWithoutCityInput[]
      | PharmacyUncheckedCreateWithoutCityInput[];
    connectOrCreate?:
      | PharmacyCreateOrConnectWithoutCityInput
      | PharmacyCreateOrConnectWithoutCityInput[];
    upsert?:
      | PharmacyUpsertWithWhereUniqueWithoutCityInput
      | PharmacyUpsertWithWhereUniqueWithoutCityInput[];
    createMany?: PharmacyCreateManyCityInputEnvelope;
    set?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    disconnect?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    delete?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    connect?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    update?:
      | PharmacyUpdateWithWhereUniqueWithoutCityInput
      | PharmacyUpdateWithWhereUniqueWithoutCityInput[];
    updateMany?:
      | PharmacyUpdateManyWithWhereWithoutCityInput
      | PharmacyUpdateManyWithWhereWithoutCityInput[];
    deleteMany?: PharmacyScalarWhereInput | PharmacyScalarWhereInput[];
  };

  export type PharmacyUncheckedUpdateManyWithoutCityNestedInput = {
    create?:
      | XOR<PharmacyCreateWithoutCityInput, PharmacyUncheckedCreateWithoutCityInput>
      | PharmacyCreateWithoutCityInput[]
      | PharmacyUncheckedCreateWithoutCityInput[];
    connectOrCreate?:
      | PharmacyCreateOrConnectWithoutCityInput
      | PharmacyCreateOrConnectWithoutCityInput[];
    upsert?:
      | PharmacyUpsertWithWhereUniqueWithoutCityInput
      | PharmacyUpsertWithWhereUniqueWithoutCityInput[];
    createMany?: PharmacyCreateManyCityInputEnvelope;
    set?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    disconnect?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    delete?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    connect?: PharmacyWhereUniqueInput | PharmacyWhereUniqueInput[];
    update?:
      | PharmacyUpdateWithWhereUniqueWithoutCityInput
      | PharmacyUpdateWithWhereUniqueWithoutCityInput[];
    updateMany?:
      | PharmacyUpdateManyWithWhereWithoutCityInput
      | PharmacyUpdateManyWithWhereWithoutCityInput[];
    deleteMany?: PharmacyScalarWhereInput | PharmacyScalarWhereInput[];
  };

  export type CityCreateNestedOneWithoutPharmaciesInput = {
    create?: XOR<CityCreateWithoutPharmaciesInput, CityUncheckedCreateWithoutPharmaciesInput>;
    connectOrCreate?: CityCreateOrConnectWithoutPharmaciesInput;
    connect?: CityWhereUniqueInput;
  };

  export type DutyScheduleCreateNestedManyWithoutPharmacyInput = {
    create?:
      | XOR<DutyScheduleCreateWithoutPharmacyInput, DutyScheduleUncheckedCreateWithoutPharmacyInput>
      | DutyScheduleCreateWithoutPharmacyInput[]
      | DutyScheduleUncheckedCreateWithoutPharmacyInput[];
    connectOrCreate?:
      | DutyScheduleCreateOrConnectWithoutPharmacyInput
      | DutyScheduleCreateOrConnectWithoutPharmacyInput[];
    createMany?: DutyScheduleCreateManyPharmacyInputEnvelope;
    connect?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
  };

  export type DutyScheduleUncheckedCreateNestedManyWithoutPharmacyInput = {
    create?:
      | XOR<DutyScheduleCreateWithoutPharmacyInput, DutyScheduleUncheckedCreateWithoutPharmacyInput>
      | DutyScheduleCreateWithoutPharmacyInput[]
      | DutyScheduleUncheckedCreateWithoutPharmacyInput[];
    connectOrCreate?:
      | DutyScheduleCreateOrConnectWithoutPharmacyInput
      | DutyScheduleCreateOrConnectWithoutPharmacyInput[];
    createMany?: DutyScheduleCreateManyPharmacyInputEnvelope;
    connect?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
  };

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
  };

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
  };

  export type CityUpdateOneRequiredWithoutPharmaciesNestedInput = {
    create?: XOR<CityCreateWithoutPharmaciesInput, CityUncheckedCreateWithoutPharmaciesInput>;
    connectOrCreate?: CityCreateOrConnectWithoutPharmaciesInput;
    upsert?: CityUpsertWithoutPharmaciesInput;
    connect?: CityWhereUniqueInput;
    update?: XOR<
      XOR<CityUpdateToOneWithWhereWithoutPharmaciesInput, CityUpdateWithoutPharmaciesInput>,
      CityUncheckedUpdateWithoutPharmaciesInput
    >;
  };

  export type DutyScheduleUpdateManyWithoutPharmacyNestedInput = {
    create?:
      | XOR<DutyScheduleCreateWithoutPharmacyInput, DutyScheduleUncheckedCreateWithoutPharmacyInput>
      | DutyScheduleCreateWithoutPharmacyInput[]
      | DutyScheduleUncheckedCreateWithoutPharmacyInput[];
    connectOrCreate?:
      | DutyScheduleCreateOrConnectWithoutPharmacyInput
      | DutyScheduleCreateOrConnectWithoutPharmacyInput[];
    upsert?:
      | DutyScheduleUpsertWithWhereUniqueWithoutPharmacyInput
      | DutyScheduleUpsertWithWhereUniqueWithoutPharmacyInput[];
    createMany?: DutyScheduleCreateManyPharmacyInputEnvelope;
    set?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    disconnect?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    delete?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    connect?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    update?:
      | DutyScheduleUpdateWithWhereUniqueWithoutPharmacyInput
      | DutyScheduleUpdateWithWhereUniqueWithoutPharmacyInput[];
    updateMany?:
      | DutyScheduleUpdateManyWithWhereWithoutPharmacyInput
      | DutyScheduleUpdateManyWithWhereWithoutPharmacyInput[];
    deleteMany?: DutyScheduleScalarWhereInput | DutyScheduleScalarWhereInput[];
  };

  export type DutyScheduleUncheckedUpdateManyWithoutPharmacyNestedInput = {
    create?:
      | XOR<DutyScheduleCreateWithoutPharmacyInput, DutyScheduleUncheckedCreateWithoutPharmacyInput>
      | DutyScheduleCreateWithoutPharmacyInput[]
      | DutyScheduleUncheckedCreateWithoutPharmacyInput[];
    connectOrCreate?:
      | DutyScheduleCreateOrConnectWithoutPharmacyInput
      | DutyScheduleCreateOrConnectWithoutPharmacyInput[];
    upsert?:
      | DutyScheduleUpsertWithWhereUniqueWithoutPharmacyInput
      | DutyScheduleUpsertWithWhereUniqueWithoutPharmacyInput[];
    createMany?: DutyScheduleCreateManyPharmacyInputEnvelope;
    set?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    disconnect?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    delete?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    connect?: DutyScheduleWhereUniqueInput | DutyScheduleWhereUniqueInput[];
    update?:
      | DutyScheduleUpdateWithWhereUniqueWithoutPharmacyInput
      | DutyScheduleUpdateWithWhereUniqueWithoutPharmacyInput[];
    updateMany?:
      | DutyScheduleUpdateManyWithWhereWithoutPharmacyInput
      | DutyScheduleUpdateManyWithWhereWithoutPharmacyInput[];
    deleteMany?: DutyScheduleScalarWhereInput | DutyScheduleScalarWhereInput[];
  };

  export type PharmacyCreateNestedOneWithoutSchedulesInput = {
    create?: XOR<PharmacyCreateWithoutSchedulesInput, PharmacyUncheckedCreateWithoutSchedulesInput>;
    connectOrCreate?: PharmacyCreateOrConnectWithoutSchedulesInput;
    connect?: PharmacyWhereUniqueInput;
  };

  export type EnumDutyTypeFieldUpdateOperationsInput = {
    set?: $Enums.DutyType;
  };

  export type PharmacyUpdateOneRequiredWithoutSchedulesNestedInput = {
    create?: XOR<PharmacyCreateWithoutSchedulesInput, PharmacyUncheckedCreateWithoutSchedulesInput>;
    connectOrCreate?: PharmacyCreateOrConnectWithoutSchedulesInput;
    upsert?: PharmacyUpsertWithoutSchedulesInput;
    connect?: PharmacyWhereUniqueInput;
    update?: XOR<
      XOR<PharmacyUpdateToOneWithWhereWithoutSchedulesInput, PharmacyUpdateWithoutSchedulesInput>,
      PharmacyUncheckedUpdateWithoutSchedulesInput
    >;
  };

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringFilter<$PrismaModel> | string;
  };

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>;
    in?: string[] | ListStringFieldRefInput<$PrismaModel>;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedStringFilter<$PrismaModel>;
    _max?: NestedStringFilter<$PrismaModel>;
  };

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>;
    in?: number[] | ListIntFieldRefInput<$PrismaModel>;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntFilter<$PrismaModel> | number;
  };

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableFilter<$PrismaModel> | string | null;
  };

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string;
  };

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null;
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null;
    lt?: string | StringFieldRefInput<$PrismaModel>;
    lte?: string | StringFieldRefInput<$PrismaModel>;
    gt?: string | StringFieldRefInput<$PrismaModel>;
    gte?: string | StringFieldRefInput<$PrismaModel>;
    contains?: string | StringFieldRefInput<$PrismaModel>;
    startsWith?: string | StringFieldRefInput<$PrismaModel>;
    endsWith?: string | StringFieldRefInput<$PrismaModel>;
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null;
    _count?: NestedIntNullableFilter<$PrismaModel>;
    _min?: NestedStringNullableFilter<$PrismaModel>;
    _max?: NestedStringNullableFilter<$PrismaModel>;
  };

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null;
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null;
    lt?: number | IntFieldRefInput<$PrismaModel>;
    lte?: number | IntFieldRefInput<$PrismaModel>;
    gt?: number | IntFieldRefInput<$PrismaModel>;
    gte?: number | IntFieldRefInput<$PrismaModel>;
    not?: NestedIntNullableFilter<$PrismaModel> | number | null;
  };

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>;
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>;
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedDateTimeFilter<$PrismaModel>;
    _max?: NestedDateTimeFilter<$PrismaModel>;
  };

  export type NestedEnumDutyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.DutyType | EnumDutyTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumDutyTypeFilter<$PrismaModel> | $Enums.DutyType;
  };

  export type NestedEnumDutyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.DutyType | EnumDutyTypeFieldRefInput<$PrismaModel>;
    in?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    notIn?: $Enums.DutyType[] | ListEnumDutyTypeFieldRefInput<$PrismaModel>;
    not?: NestedEnumDutyTypeWithAggregatesFilter<$PrismaModel> | $Enums.DutyType;
    _count?: NestedIntFilter<$PrismaModel>;
    _min?: NestedEnumDutyTypeFilter<$PrismaModel>;
    _max?: NestedEnumDutyTypeFilter<$PrismaModel>;
  };

  export type CityCreateWithoutProvinceInput = {
    id?: string;
    name: string;
    pharmacies?: PharmacyCreateNestedManyWithoutCityInput;
  };

  export type CityUncheckedCreateWithoutProvinceInput = {
    id?: string;
    name: string;
    pharmacies?: PharmacyUncheckedCreateNestedManyWithoutCityInput;
  };

  export type CityCreateOrConnectWithoutProvinceInput = {
    where: CityWhereUniqueInput;
    create: XOR<CityCreateWithoutProvinceInput, CityUncheckedCreateWithoutProvinceInput>;
  };

  export type CityCreateManyProvinceInputEnvelope = {
    data: CityCreateManyProvinceInput | CityCreateManyProvinceInput[];
    skipDuplicates?: boolean;
  };

  export type CityUpsertWithWhereUniqueWithoutProvinceInput = {
    where: CityWhereUniqueInput;
    update: XOR<CityUpdateWithoutProvinceInput, CityUncheckedUpdateWithoutProvinceInput>;
    create: XOR<CityCreateWithoutProvinceInput, CityUncheckedCreateWithoutProvinceInput>;
  };

  export type CityUpdateWithWhereUniqueWithoutProvinceInput = {
    where: CityWhereUniqueInput;
    data: XOR<CityUpdateWithoutProvinceInput, CityUncheckedUpdateWithoutProvinceInput>;
  };

  export type CityUpdateManyWithWhereWithoutProvinceInput = {
    where: CityScalarWhereInput;
    data: XOR<CityUpdateManyMutationInput, CityUncheckedUpdateManyWithoutProvinceInput>;
  };

  export type CityScalarWhereInput = {
    AND?: CityScalarWhereInput | CityScalarWhereInput[];
    OR?: CityScalarWhereInput[];
    NOT?: CityScalarWhereInput | CityScalarWhereInput[];
    id?: StringFilter<'City'> | string;
    name?: StringFilter<'City'> | string;
    provinceId?: StringFilter<'City'> | string;
  };

  export type ProvinceCreateWithoutCitiesInput = {
    id?: string;
    name: string;
    code: string;
  };

  export type ProvinceUncheckedCreateWithoutCitiesInput = {
    id?: string;
    name: string;
    code: string;
  };

  export type ProvinceCreateOrConnectWithoutCitiesInput = {
    where: ProvinceWhereUniqueInput;
    create: XOR<ProvinceCreateWithoutCitiesInput, ProvinceUncheckedCreateWithoutCitiesInput>;
  };

  export type PharmacyCreateWithoutCityInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    schedules?: DutyScheduleCreateNestedManyWithoutPharmacyInput;
  };

  export type PharmacyUncheckedCreateWithoutCityInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    schedules?: DutyScheduleUncheckedCreateNestedManyWithoutPharmacyInput;
  };

  export type PharmacyCreateOrConnectWithoutCityInput = {
    where: PharmacyWhereUniqueInput;
    create: XOR<PharmacyCreateWithoutCityInput, PharmacyUncheckedCreateWithoutCityInput>;
  };

  export type PharmacyCreateManyCityInputEnvelope = {
    data: PharmacyCreateManyCityInput | PharmacyCreateManyCityInput[];
    skipDuplicates?: boolean;
  };

  export type ProvinceUpsertWithoutCitiesInput = {
    update: XOR<ProvinceUpdateWithoutCitiesInput, ProvinceUncheckedUpdateWithoutCitiesInput>;
    create: XOR<ProvinceCreateWithoutCitiesInput, ProvinceUncheckedCreateWithoutCitiesInput>;
    where?: ProvinceWhereInput;
  };

  export type ProvinceUpdateToOneWithWhereWithoutCitiesInput = {
    where?: ProvinceWhereInput;
    data: XOR<ProvinceUpdateWithoutCitiesInput, ProvinceUncheckedUpdateWithoutCitiesInput>;
  };

  export type ProvinceUpdateWithoutCitiesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
  };

  export type ProvinceUncheckedUpdateWithoutCitiesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    code?: StringFieldUpdateOperationsInput | string;
  };

  export type PharmacyUpsertWithWhereUniqueWithoutCityInput = {
    where: PharmacyWhereUniqueInput;
    update: XOR<PharmacyUpdateWithoutCityInput, PharmacyUncheckedUpdateWithoutCityInput>;
    create: XOR<PharmacyCreateWithoutCityInput, PharmacyUncheckedCreateWithoutCityInput>;
  };

  export type PharmacyUpdateWithWhereUniqueWithoutCityInput = {
    where: PharmacyWhereUniqueInput;
    data: XOR<PharmacyUpdateWithoutCityInput, PharmacyUncheckedUpdateWithoutCityInput>;
  };

  export type PharmacyUpdateManyWithWhereWithoutCityInput = {
    where: PharmacyScalarWhereInput;
    data: XOR<PharmacyUpdateManyMutationInput, PharmacyUncheckedUpdateManyWithoutCityInput>;
  };

  export type PharmacyScalarWhereInput = {
    AND?: PharmacyScalarWhereInput | PharmacyScalarWhereInput[];
    OR?: PharmacyScalarWhereInput[];
    NOT?: PharmacyScalarWhereInput | PharmacyScalarWhereInput[];
    id?: StringFilter<'Pharmacy'> | string;
    name?: StringFilter<'Pharmacy'> | string;
    ownerName?: StringNullableFilter<'Pharmacy'> | string | null;
    address?: StringFilter<'Pharmacy'> | string;
    phone?: StringNullableFilter<'Pharmacy'> | string | null;
    cityId?: StringFilter<'Pharmacy'> | string;
    createdAt?: DateTimeFilter<'Pharmacy'> | Date | string;
    updatedAt?: DateTimeFilter<'Pharmacy'> | Date | string;
  };

  export type CityCreateWithoutPharmaciesInput = {
    id?: string;
    name: string;
    province: ProvinceCreateNestedOneWithoutCitiesInput;
  };

  export type CityUncheckedCreateWithoutPharmaciesInput = {
    id?: string;
    name: string;
    provinceId: string;
  };

  export type CityCreateOrConnectWithoutPharmaciesInput = {
    where: CityWhereUniqueInput;
    create: XOR<CityCreateWithoutPharmaciesInput, CityUncheckedCreateWithoutPharmaciesInput>;
  };

  export type DutyScheduleCreateWithoutPharmacyInput = {
    id?: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    type?: $Enums.DutyType;
    source?: string | null;
    createdAt?: Date | string;
  };

  export type DutyScheduleUncheckedCreateWithoutPharmacyInput = {
    id?: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    type?: $Enums.DutyType;
    source?: string | null;
    createdAt?: Date | string;
  };

  export type DutyScheduleCreateOrConnectWithoutPharmacyInput = {
    where: DutyScheduleWhereUniqueInput;
    create: XOR<
      DutyScheduleCreateWithoutPharmacyInput,
      DutyScheduleUncheckedCreateWithoutPharmacyInput
    >;
  };

  export type DutyScheduleCreateManyPharmacyInputEnvelope = {
    data: DutyScheduleCreateManyPharmacyInput | DutyScheduleCreateManyPharmacyInput[];
    skipDuplicates?: boolean;
  };

  export type CityUpsertWithoutPharmaciesInput = {
    update: XOR<CityUpdateWithoutPharmaciesInput, CityUncheckedUpdateWithoutPharmaciesInput>;
    create: XOR<CityCreateWithoutPharmaciesInput, CityUncheckedCreateWithoutPharmaciesInput>;
    where?: CityWhereInput;
  };

  export type CityUpdateToOneWithWhereWithoutPharmaciesInput = {
    where?: CityWhereInput;
    data: XOR<CityUpdateWithoutPharmaciesInput, CityUncheckedUpdateWithoutPharmaciesInput>;
  };

  export type CityUpdateWithoutPharmaciesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    province?: ProvinceUpdateOneRequiredWithoutCitiesNestedInput;
  };

  export type CityUncheckedUpdateWithoutPharmaciesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    provinceId?: StringFieldUpdateOperationsInput | string;
  };

  export type DutyScheduleUpsertWithWhereUniqueWithoutPharmacyInput = {
    where: DutyScheduleWhereUniqueInput;
    update: XOR<
      DutyScheduleUpdateWithoutPharmacyInput,
      DutyScheduleUncheckedUpdateWithoutPharmacyInput
    >;
    create: XOR<
      DutyScheduleCreateWithoutPharmacyInput,
      DutyScheduleUncheckedCreateWithoutPharmacyInput
    >;
  };

  export type DutyScheduleUpdateWithWhereUniqueWithoutPharmacyInput = {
    where: DutyScheduleWhereUniqueInput;
    data: XOR<
      DutyScheduleUpdateWithoutPharmacyInput,
      DutyScheduleUncheckedUpdateWithoutPharmacyInput
    >;
  };

  export type DutyScheduleUpdateManyWithWhereWithoutPharmacyInput = {
    where: DutyScheduleScalarWhereInput;
    data: XOR<
      DutyScheduleUpdateManyMutationInput,
      DutyScheduleUncheckedUpdateManyWithoutPharmacyInput
    >;
  };

  export type DutyScheduleScalarWhereInput = {
    AND?: DutyScheduleScalarWhereInput | DutyScheduleScalarWhereInput[];
    OR?: DutyScheduleScalarWhereInput[];
    NOT?: DutyScheduleScalarWhereInput | DutyScheduleScalarWhereInput[];
    id?: StringFilter<'DutySchedule'> | string;
    pharmacyId?: StringFilter<'DutySchedule'> | string;
    date?: DateTimeFilter<'DutySchedule'> | Date | string;
    startTime?: StringFilter<'DutySchedule'> | string;
    endTime?: StringFilter<'DutySchedule'> | string;
    type?: EnumDutyTypeFilter<'DutySchedule'> | $Enums.DutyType;
    source?: StringNullableFilter<'DutySchedule'> | string | null;
    createdAt?: DateTimeFilter<'DutySchedule'> | Date | string;
  };

  export type PharmacyCreateWithoutSchedulesInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    city: CityCreateNestedOneWithoutPharmaciesInput;
  };

  export type PharmacyUncheckedCreateWithoutSchedulesInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    cityId: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PharmacyCreateOrConnectWithoutSchedulesInput = {
    where: PharmacyWhereUniqueInput;
    create: XOR<PharmacyCreateWithoutSchedulesInput, PharmacyUncheckedCreateWithoutSchedulesInput>;
  };

  export type PharmacyUpsertWithoutSchedulesInput = {
    update: XOR<PharmacyUpdateWithoutSchedulesInput, PharmacyUncheckedUpdateWithoutSchedulesInput>;
    create: XOR<PharmacyCreateWithoutSchedulesInput, PharmacyUncheckedCreateWithoutSchedulesInput>;
    where?: PharmacyWhereInput;
  };

  export type PharmacyUpdateToOneWithWhereWithoutSchedulesInput = {
    where?: PharmacyWhereInput;
    data: XOR<PharmacyUpdateWithoutSchedulesInput, PharmacyUncheckedUpdateWithoutSchedulesInput>;
  };

  export type PharmacyUpdateWithoutSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    city?: CityUpdateOneRequiredWithoutPharmaciesNestedInput;
  };

  export type PharmacyUncheckedUpdateWithoutSchedulesInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    cityId?: StringFieldUpdateOperationsInput | string;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type CityCreateManyProvinceInput = {
    id?: string;
    name: string;
  };

  export type CityUpdateWithoutProvinceInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    pharmacies?: PharmacyUpdateManyWithoutCityNestedInput;
  };

  export type CityUncheckedUpdateWithoutProvinceInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    pharmacies?: PharmacyUncheckedUpdateManyWithoutCityNestedInput;
  };

  export type CityUncheckedUpdateManyWithoutProvinceInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
  };

  export type PharmacyCreateManyCityInput = {
    id?: string;
    name: string;
    ownerName?: string | null;
    address: string;
    phone?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
  };

  export type PharmacyUpdateWithoutCityInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    schedules?: DutyScheduleUpdateManyWithoutPharmacyNestedInput;
  };

  export type PharmacyUncheckedUpdateWithoutCityInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    schedules?: DutyScheduleUncheckedUpdateManyWithoutPharmacyNestedInput;
  };

  export type PharmacyUncheckedUpdateManyWithoutCityInput = {
    id?: StringFieldUpdateOperationsInput | string;
    name?: StringFieldUpdateOperationsInput | string;
    ownerName?: NullableStringFieldUpdateOperationsInput | string | null;
    address?: StringFieldUpdateOperationsInput | string;
    phone?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DutyScheduleCreateManyPharmacyInput = {
    id?: string;
    date: Date | string;
    startTime: string;
    endTime: string;
    type?: $Enums.DutyType;
    source?: string | null;
    createdAt?: Date | string;
  };

  export type DutyScheduleUpdateWithoutPharmacyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DutyScheduleUncheckedUpdateWithoutPharmacyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  export type DutyScheduleUncheckedUpdateManyWithoutPharmacyInput = {
    id?: StringFieldUpdateOperationsInput | string;
    date?: DateTimeFieldUpdateOperationsInput | Date | string;
    startTime?: StringFieldUpdateOperationsInput | string;
    endTime?: StringFieldUpdateOperationsInput | string;
    type?: EnumDutyTypeFieldUpdateOperationsInput | $Enums.DutyType;
    source?: NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string;
  };

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number;
  };

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF;
}
