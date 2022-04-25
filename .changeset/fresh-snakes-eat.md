---
"@mds-core/mds-stream": minor
---

Add a new `healthStatus` option to the `StreamConsumer` which will allow consumers to provide information externally about their healthiness. At the moment, this is only used by the Kafka Consumer, which will update this status upon a KafkaJS `CRASH`, or the `HEARTBEAT` not being sent to the coordinator in over a minute.
