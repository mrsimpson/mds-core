import { getReadOnlyClient, getWriteableClient } from './client'
import { StateEntry, TripEntry } from '@mds-core/mds-types'
import schema from './schema'
import { TABLE_NAME } from './schema'

function commaize(array: ReadonlyArray<string>, quote = `'`, join = ','): any {
  return array.map((val: string) => `${stringify(val, quote)}`).join(join)
}

function stringify(data: any, quote: any, nested = false): any {
  if (!data && data !== 0) {
    return `NULL`
  } else if (Array.isArray(data)) {
    // get type
    let type = ''
    let first = [data]
    while (first.length > 0 && Array.isArray(first[0])) {
      type = '[]' + type
      first = first[0]
    }

    first = first[0]
    switch (typeof first) {
      case 'object':
        type = 'JSON' + type
        break
      case 'string':
        type = 'varchar(31)' + type
        break
      default:
        type = typeof first + type
    }

    let commaized_content = commaize(
      data.map(data_element => stringify(data_element, `'`, true)),
      ``
    )
    let cast = !nested && type !== '[]'
    return `${cast ? 'CAST(' : ''}${nested ? '' : 'ARRAY'}[${commaized_content}]${cast ? ` AS ${type})` : ''}`
  } else if (typeof data === 'object') {
    return `${quote}${JSON.stringify(data)}${quote}`
  } else {
    return `${quote}${data}${quote}`
  }
}

async function readQuery(query: string) {
  const client = await getWriteableClient()
  const results = await client.query(query)
  return results.rows
}

async function writeQuery(query: string) {
  const client = await getReadOnlyClient()
  const results = await client.query(query)
  return results.rows
}

export async function getStates(
  provider_id: string,
  start_time: number = 0,
  end_time: number = Date.now()
): Promise<StateEntry[]> {
  const query = `SELECT * FROM reports_device_states WHERE timestamp BETWEEN ${start_time} AND ${end_time}`
  //let query = `SELECT * FROM reports_device_states WHERE provider_id = ${provider_id} AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return readQuery(query)
}

export async function getTrips(
  provider_id: string,
  start_time: number = 0,
  end_time: number = Date.now()
): Promise<TripEntry[]> {
  const query = `SELECT * FROM reports_trips WHERE end_time BETWEEN ${start_time} AND ${end_time}`
  //let query = `SELECT * FROM reports_trips WHERE provider_id = ${provider_id} AND end_time BETWEEN ${start_time} AND ${end_time}`
  return readQuery(query)
}

export async function getTripCount(
  provider_id: string,
  start_time: number = 0,
  end_time: number = Date.now()
): Promise<Array<{ [count: string]: number }>> {
  const query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE type = 'event' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  //let query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE provider_id = ${provider_id} AND type = 'event' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return readQuery(query)
}

export async function getVehicleTripCount(
  device_id: string,
  start_time: number = 0,
  end_time: number = Date.now()
): Promise<Array<{ [count: string]: number }>> {
  const query = `SELECT count(DISTINCT trip_id) FROM reports_device_states WHERE type = 'event' AND device_id = '${device_id}' AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return readQuery(query)
}

export async function getLateEventCount(
  provider_id: string,
  events: any,
  start_time: number = 0,
  end_time: number = Date.now()
): Promise<Array<{ [count: string]: number }>> {
  const query = `SELECT count(*) FROM reports_device_states WHERE event_type IN ${events} AND timestamp BETWEEN ${start_time} AND ${end_time}`
  //let query = `SELECT count(*) FROM reports_device_states WHERE provider_id = ${provider_id} AND event_type IN ${events} AND timestamp BETWEEN ${start_time} AND ${end_time}`
  return readQuery(query)
}

export async function insert(table_name: TABLE_NAME, data: { [x: string]: any }) {
  if (!data) {
    return null
  }
  const fields = schema.TABLE_COLUMNS[table_name]
  let query = `INSERT INTO ${String(table_name)} (${commaize(fields, `"`)}) `
  query += `VALUES (${commaize(fields.map(field => data[field]))})`
  return writeQuery(query)
}

export async function resetTable(table_name: TABLE_NAME) {
  await writeQuery(`TRUNCATE ${String(table_name)}`)
}
