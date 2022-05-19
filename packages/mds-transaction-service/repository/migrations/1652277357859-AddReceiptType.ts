import type { MigrationInterface, QueryRunner } from 'typeorm'

export class AddReceiptType1652277357859 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE transactions SET receipt = receipt || jsonb_build_object('receipt_details', receipt->'receipt_details' || CASE
            WHEN receipt->'receipt_details' ?& array['trip_id', 'start_geography_type', 'distance'] THEN '{"type": "trip"}'::jsonb
            WHEN receipt->'receipt_details' ?& array['trip_id', 'vehicle_type', 'duration'] THEN '{"type": "curb_use"}'::jsonb
            WHEN receipt->'receipt_details' ? 'violation_id' THEN '{"type": "compliance_violation"}'::jsonb
            WHEN receipt->'receipt_details' ? 'custom_description' THEN '{"type": "custom"}'::jsonb
        END) WHERE not receipt->'receipt_details' ? 'type'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE transactions SET receipt = receipt - 'type'`)
  }
}
