# Amazon SQS Publish Subscribe

[Amazon SQSにてPublish/SubscribeするLambdaをCDKでデプロイする](https://zenn.dev/motu2119/articles/afcf3a4f806c93)

## Make a project

```zsh
$ npm install -g aws-cdk
$ mkdir sqs_pub_sub
$ cd sqs_pub_sub
$ cdk init --language typescript
```

## build

```zsh
$ npm run build
```

## deploy

```zsh
$ cdk bootstrap
$ cdk deploy
```
