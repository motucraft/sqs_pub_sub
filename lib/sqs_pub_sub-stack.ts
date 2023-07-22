import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'
import * as path from 'path'

export class SqsPubSubStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Create the dead letter queue
    const dlQueue = new sqs.Queue(this, 'DeadLetterQueue', {
      fifo: true,
      queueName: `${id}-DLQueue.fifo`,
      visibilityTimeout: cdk.Duration.seconds(300)
    })

    const queue = new sqs.Queue(this, 'Queue', {
      fifo: true,
      queueName: `${id}-Queue.fifo`,
      visibilityTimeout: cdk.Duration.seconds(300),
      deadLetterQueue: { queue: dlQueue, maxReceiveCount: 3 }
    })

    this.createPublisher(queue)
    this.createSubscriber(queue)
  }

  /**
   * Create Publisher API
   */
  createPublisher(queue: sqs.IQueue) {
    const publisherApi = new cdk.aws_apigateway.RestApi(this, 'publisher_api', {
      restApiName: 'publisher_api',
      description: 'Publish a message to SQS.',
      defaultCorsPreflightOptions: {
        allowOrigins: cdk.aws_apigateway.Cors.ALL_ORIGINS,
        allowMethods: cdk.aws_apigateway.Cors.ALL_METHODS,
        allowHeaders: cdk.aws_apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
    })

    const publisherLambda = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'publisher', {
      functionName: 'publisher',
      entry: path.join(__dirname, '../src/publisher.ts'),
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_16_X,
      bundling: {
        forceDockerBundling: false,
      },
      environment: {
        QUEUE_URL: queue.queueUrl
      }
    })

    const policy = new cdk.aws_iam.PolicyStatement({
      actions: [
        'sqs:SendMessage'
      ],
      resources: [queue.queueArn],
    })

    publisherLambda.role?.addToPrincipalPolicy(policy)

    publisherApi.root.addResource('publisher').addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(publisherLambda))
  }

  /**
   * Create Subscriber Lambda
   */
  createSubscriber(queue: sqs.IQueue) {
    const subscriberLambda = new cdk.aws_lambda_nodejs.NodejsFunction(this, 'subscriber', {
      functionName: 'subscriber',
      entry: path.join(__dirname, '../src/subscriber.ts'),
      handler: 'handler',
      runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
      bundling: {
        forceDockerBundling: false,
      },
    })

    const policy = new cdk.aws_iam.PolicyStatement({
      actions: [
        'sqs:ReceiveMessage',
        'sqs:DeleteMessage',
        'sqs:GetQueueAttributes'
      ],
      resources: [queue.queueArn],
    })

    subscriberLambda.role?.addToPrincipalPolicy(policy)

    subscriberLambda.addEventSource(new cdk.aws_lambda_event_sources.SqsEventSource(queue))
  }
}
