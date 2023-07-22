import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { SQS } from 'aws-sdk'

const sqs = new SQS()

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`)
  console.log(`Context: ${JSON.stringify(context, null, 2)}`)

  const params = {
    MessageBody: JSON.stringify(event),
    QueueUrl: process.env.QUEUE_URL!,
    MessageGroupId: context.awsRequestId,
    MessageDeduplicationId: context.awsRequestId,
  }

  try {
    const data = await sqs.sendMessage(params).promise()
    console.log('Success, message posted to', params.QueueUrl)
    console.log('MessageID is', data.MessageId)
  } catch (err) {
    console.log('Error', err)
    throw err
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS'
    },
    body: JSON.stringify({
      message: 'Publish!',
    }),
  }
}
