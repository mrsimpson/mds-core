import { schemas as complianceServiceSchemas } from '@mds-core/mds-compliance-service'
import { GenerateSchemaFiles } from '@mds-core/mds-schema-validators'

const schemas = [...complianceServiceSchemas]

GenerateSchemaFiles(schemas, __dirname)
