/**
 * Lambda: GET /notes         → list user notes
 *         GET /notes/:id     → get single note
 *         DELETE /notes/:id  → delete note
 */
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  GetCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb'
import { ok, err, cors } from '../shared/utils'

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE  = process.env.NOTES_TABLE || 'notegenius-notes'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors()

  const userId = event.requestContext?.authorizer?.claims?.sub || 'anonymous'
  const noteId = event.pathParameters?.id

  try {
    // ── GET /notes/:id ────────────────────────────────────────────────────────
    if (event.httpMethod === 'GET' && noteId) {
      const { Item } = await dynamo.send(new GetCommand({
        TableName: TABLE,
        Key: { pk: `USER#${userId}`, sk: `NOTE#${noteId}` },
      }))
      if (!Item) return err('Note not found.', 404)
      return ok(Item)
    }

    // ── GET /notes ────────────────────────────────────────────────────────────
    if (event.httpMethod === 'GET') {
      const { Items = [] } = await dynamo.send(new QueryCommand({
        TableName: TABLE,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: {
          ':pk':     `USER#${userId}`,
          ':prefix': 'NOTE#',
        },
        ScanIndexForward: false, // newest first
        Limit: 50,
      }))
      return ok({ notes: Items })
    }

    // ── DELETE /notes/:id ─────────────────────────────────────────────────────
    if (event.httpMethod === 'DELETE' && noteId) {
      await dynamo.send(new DeleteCommand({
        TableName: TABLE,
        Key: { pk: `USER#${userId}`, sk: `NOTE#${noteId}` },
      }))
      return ok({ deleted: true })
    }

    return err('Method not allowed.', 405)
  } catch (e) {
    console.error('notes error:', e)
    return err(e instanceof Error ? e.message : 'Server error', 500)
  }
}
