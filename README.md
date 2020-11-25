```
awslocal dynamodb create-table \
    --table-name one-dollar-site-dev-count \
    --attribute-definitions \
        AttributeName=name,AttributeType=S \
    --key-schema \
        AttributeName=name,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5
```

```
awslocal dynamodb put-item \
    --table-name one-dollar-site-dev-count \
    --item '{
      "name": {"S": "counter"},
      "count": {"N": "0"}
    }'
```

```
awslocal dynamodb get-item --table-name one-dollar-site-dev-count --key '{"name": {"S": "counter"}}'
```

```
awslocal dynamodb create-table \
    --table-name one-dollar-site-dev-orders \
    --attribute-definitions \
        AttributeName=order_id,AttributeType=S \
    --key-schema \
        AttributeName=order_id,KeyType=HASH \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5
```

<!-- ```
awslocal dynamodb put-item \
    --table-name one-dollar-site-dev-count \
    --item '{
      "orderID": {"S": "test-count"},
      "count": {"N": "0"}
    }'
``` -->

```
awslocal dynamodb get-item --table-name one-dollar-site-dev-orders --key '{"order_id": {"S": "<ORDERID>"}}'
```