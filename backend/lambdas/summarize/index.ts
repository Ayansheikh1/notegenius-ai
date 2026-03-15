/**
 * Lambda: POST /generate
 * Calls Anthropic Claude (via AWS Bedrock or direct API),
 * saves the result to DynamoDB, returns the structured output.
 */
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuid } from 'uuid'
import { ok, err, cors, buildPrompt, parseJSON, type OutputMode } from '../shared/utils'

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const TABLE = process.env.NOTES_TABLE || 'notegenius-notes'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors()

  try {
    const body = JSON.parse(event.body || '{}')
    const { content, mode, title } = body as {
      content: string
      mode: OutputMode
      title?: string
    }

    if (!content || content.trim().length < 20) {
      return err('Content must be at least 20 characters.')
    }
    if (!['summary', 'keypoints', 'flashcards', 'quiz'].includes(mode)) {
      return err('Invalid mode. Choose: summary | keypoints | flashcards | quiz')
    }

    // ── Call Claude ──────────────────────────────────────────────────────────
    const prompt = buildPrompt(content, mode)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = response.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const result = parseJSON(raw)

    // ── Persist to DynamoDB ──────────────────────────────────────────────────
    const noteId = uuid()
    const userId = event.requestContext?.authorizer?.claims?.sub || 'anonymous'

    const note = {
      pk: `USER#${userId}`,
      sk: `NOTE#${noteId}`,
      id: noteId,
      title: title || `${mode.charAt(0).toUpperCase() + mode.slice(1)} — ${new Date().toLocaleDateString()}`,
      mode,
      content: result,
      source: 'text',
      sourceLabel: 'API input',
      wordCount: content.split(/\s+/).length,
      createdAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60, // 90 days
    }

    await dynamo.send(new PutCommand({ TableName: TABLE, Item: note }))

    return ok({ noteId, title: note.title, mode, result })
  } catch (e) {
    console.error('generate error:', e)
    return err(e instanceof Error ? e.message : 'Internal server error', 500)
  }
}
