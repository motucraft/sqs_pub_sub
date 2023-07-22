import { Context, SQSEvent } from 'aws-lambda'

export const handler = async (event: SQSEvent, context: Context): Promise<void> => {
  console.log(`Event: ${JSON.stringify(event, null, 2)}`)
  console.log(`Context: ${JSON.stringify(context, null, 2)}`)

  for (const record of event.Records) {
    console.log(`Message body: ${record.body}`)
  }
}
