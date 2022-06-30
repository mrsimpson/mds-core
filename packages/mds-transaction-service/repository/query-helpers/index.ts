import type { Timestamp, UUID } from '@mds-core/mds-types'
import type { FindOperator } from 'typeorm'
import { Between, Brackets, LessThan, MoreThan } from 'typeorm'
import type { FEE_TYPE } from '../../@types'

export const resolveTimeBounds = ({
  start_timestamp,
  end_timestamp
}: {
  start_timestamp?: Timestamp
  end_timestamp?: Timestamp
}): { timestamp?: FindOperator<number> } => {
  if (start_timestamp && end_timestamp) {
    return { timestamp: Between(start_timestamp, end_timestamp) }
  }
  if (start_timestamp) {
    return { timestamp: MoreThan(start_timestamp) }
  }
  if (end_timestamp) {
    return { timestamp: LessThan(end_timestamp) }
  }
  return {}
}

export const resolveProviderId = (provider_id?: UUID): { provider_id?: UUID } => (provider_id ? { provider_id } : {})

const jsonSearch = (alias: string, search_text?: string) => {
  /**
   * 'simple' means no word-stemming, all words are indexed and searchable.
   * ['string','numeric','boolean'] means all values of the JSONB column are being searched as text
   */
  return search_text
    ? new Brackets(qb =>
        qb.where(
          `jsonb_to_tsvector('simple',${alias}.receipt,'["string","numeric","boolean"]') @@ to_tsquery(:search_text)`,
          {
            search_text: search_text + ':*'
          }
        )
      )
    : []
}

export const resolveConditions = (
  alias: string,
  {
    start_amount,
    end_amount,
    fee_type,
    search_text
  }: { start_amount?: number; end_amount?: number; fee_type?: FEE_TYPE; search_text?: string }
) => {
  const clauses = [
    start_amount ? new Brackets(qb => qb.where(`amount > :start_amount`, { start_amount })) : [],
    end_amount ? new Brackets(qb => qb.where(`amount < :end_amount`, { end_amount })) : [],
    fee_type ? new Brackets(qb => qb.where({ fee_type })) : [],
    jsonSearch(alias, search_text)
  ]

  return clauses.flat().reduce((acc, clause) => {
    return new Brackets(qb => qb.andWhere(acc).andWhere(clause))
  }, new Brackets(qb => qb.where('1=1')))
}
