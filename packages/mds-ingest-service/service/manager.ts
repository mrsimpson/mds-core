/**
 * Copyright 2020 City of Los Angeles
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

import { RpcServer } from '@mds-core/mds-rpc-common'
import type { IngestService, IngestServiceRequestContext } from '../@types'
import { IngestServiceDefinition } from '../@types'
import { IngestServiceClient } from '../client'
import { IngestServiceProvider } from './provider'

export const IngestServiceManager = RpcServer<IngestService, IngestServiceRequestContext>(
  IngestServiceDefinition,
  {
    onStart: IngestServiceProvider.start,
    onStop: IngestServiceProvider.stop
  },
  {
    getDevicesUsingOptions: (args, context) => IngestServiceProvider.getDevicesUsingOptions(context, ...args),
    getDevice: (args, context) => IngestServiceProvider.getDevice(context, ...args),
    getDevicesUsingCursor: (args, context) => IngestServiceProvider.getDevicesUsingCursor(context, ...args),
    getEventsUsingOptions: (args, context) => IngestServiceProvider.getEventsUsingOptions(context, ...args),
    getEventsUsingCursor: (args, context) => IngestServiceProvider.getEventsUsingCursor(context, ...args),
    getDevices: (args, context) => IngestServiceProvider.getDevices(context, ...args),
    getLatestTelemetryForDevices: (args, context) =>
      IngestServiceProvider.getLatestTelemetryForDevices(context, ...args),
    writeEvents: (args, context) => IngestServiceProvider.writeEvents(context, ...args),
    writeEventAnnotations: (args, context) => IngestServiceProvider.writeEventAnnotations(context, ...args),
    writeTelemetryAnnotations: (args, context) => IngestServiceProvider.writeTelemetryAnnotations(context, ...args),
    getH3Bins: (args, context) => IngestServiceProvider.getH3Bins(context, ...args),
    getTripEvents: (args, context) => IngestServiceProvider.getTripEvents(context, ...args),
    getEventsWithDeviceAndTelemetryInfoUsingOptions: (args, context) =>
      IngestServiceProvider.getEventsWithDeviceAndTelemetryInfoUsingOptions(context, ...args),
    getEventsWithDeviceAndTelemetryInfoUsingCursor: (args, context) =>
      IngestServiceProvider.getEventsWithDeviceAndTelemetryInfoUsingCursor(context, ...args),
    getDeviceEvents: (args, context) => IngestServiceProvider.getDeviceEvents(context, ...args)
  },
  {
    port: process.env.INGEST_SERVICE_RPC_PORT,
    repl: {
      port: process.env.INGEST_SERVICE_REPL_PORT,
      context: { client: IngestServiceClient }
    }
  }
)
