/**
 * Lambda: GET /extract-status?key=<fileKey>
 * Polls Textract job status and returns extracted text when complete.
 */
import type { APIGatewayProxyHandler } from 'aws-lambda'
import {
  TextractClient,
  GetDocumentTextDetectionCommand,
  type Block,
} from '@aws-sdk/client-textract'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ok, err, cors } from '../shared/utils'

const textract = new TextractClient({})
const dynamo   = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE    = process.env.JOBS_TABLE || 'notegenius-jobs'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors()

  const fileKey = event.queryStringParameters?.key
  if (!fileKey) return err('key query param required.')

  try {
    // ── Look up job ──────────────────────────────────────────────────────────
    const { Item: job } = await dynamo.send(new GetCommand({ TableName: TABLE, Key: { fileKey } }))
    if (!job) return err('Job not found.', 404)

    // Already completed → return cached text
    if (job.status === 'SUCCEEDED' && job.extractedText) {
      return ok({ status: 'SUCCEEDED', text: job.extractedText })
    }
    if (job.status === 'NOT_NEEDED' && job.extractedText) {
      return ok({ status: 'SUCCEEDED', text: job.extractedText })
    }

    if (!job.textractJobId) return err('No Textract job found for this file.')

    // ── Check Textract ────────────────────────────────────────────────────────
    const result = await textract.send(
      new GetDocumentTextDetectionCommand({ JobId: job.textractJobId })
    )

    if (result.JobStatus === 'IN_PROGRESS') {
      return ok({ status: 'IN_PROGRESS' })
    }
    if (result.JobStatus === 'FAILED') {
      await dynamo.send(new UpdateCommand({
        TableName: TABLE, Key: { fileKey },
        UpdateExpression: 'SET #s = :s',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':s': 'FAILED' },
      }))
      return ok({ status: 'FAILED' })
    }

    // ── Extract text from blocks ──────────────────────────────────────────────
    const text = (result.Blocks || [])
      .filter((b: Block) => b.BlockType === 'LINE' && b.Text)
      .map((b: Block) => b.Text!)
      .join('\n')

    // Cache result in DynamoDB
    await dynamo.send(new UpdateCommand({
      TableName: TABLE, Key: { fileKey },
      UpdateExpression: 'SET #s = :s, extractedText = :t',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':s': 'SUCCEEDED', ':t': text },
    }))

    return ok({ status: 'SUCCEEDED', text })
  } catch (e) {
    console.error('extract-status error:', e)
    return err(e instanceof Error ? e.message : 'Status check failed', 500)
  }
}
