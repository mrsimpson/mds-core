---
"@mds-core/mds-stream-processor": minor
---

Take a new required `healthStatus` option when constructing a `KafkaSource`. This healthStatus will be _mutated_ based on the health of the Kafka Consumer, and can be passed along to an `mds-api-server::ApiServer` instance for health checks based on the consumer status.
