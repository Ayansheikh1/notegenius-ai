/**
 * Lambda: POST /upload
 * 1. Generates a presigned S3 PUT URL for the client to upload directly
 * 2. Triggers an async Textract job for PDF processing
 * 3. Stores the job metadata in DynamoDB for polling
 */
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  TextractClient,
  StartDocumentTextDetectionCommand,
} from '@aws-sdk/client-textract'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuid } from 'uuid'
import { ok, err, cors } from '../shared/utils'

const s3       = new S3Client({})
const textract = new TextractClient({})
const dynamo   = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const BUCKET = process.env.UPLOAD_BUCKET  || 'notegenius-uploads'
const TABLE  = process.env.JOBS_TABLE     || 'notegenius-jobs'

export const handler: APIGatewayProxyHandler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors()

  try {
    const { fileName, contentType, fileSize } = JSON.parse(event.body || '{}') as {
      fileName: string
      contentType: string
      fileSize: number
    }

    if (!fileName || !contentType) return err('fileName and contentType are required.')
    if (fileSize > 10 * 1024 * 1024) return err('File too large. Max 10MB.')

    const fileKey = `uploads/${uuid()}-${fileName.replace(/[^a-z0-9._-]/gi, '_')}`

    // ── 1. Presigned S3 URL (valid 5 min) ────────────────────────────────────
    const uploadUrl = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: fileKey,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      }),
      { expiresIn: 300 },
    )

    // ── 2. Start Textract job (async) for PDFs ────────────────────────────────
    let textractJobId: string | undefined

    if (contentType === 'application/pdf') {
      const textractRes = await textract.send(
        new StartDocumentTextDetectionCommand({
          DocumentLocation: { S3Object: { Bucket: BUCKET, Name: fileKey } },
          NotificationChannel: process.env.TEXTRACT_SNS_ARN
            ? { RoleArn: process.env.TEXTRACT_ROLE_ARN!, SNSTopicArn: process.env.TEXTRACT_SNS_ARN }
            : undefined,
        }),
      )
      textractJobId = textractRes.JobId
    }

    // ── 3. Store job record in DynamoDB ───────────────────────────────────────
    await dynamo.send(new PutCommand({
      TableName: TABLE,
      Item: {
        fileKey,
        textractJobId: textractJobId || null,
        status: contentType === 'application/pdf' ? 'PROCESSING' : 'NOT_NEEDED',
        createdAt: new Date().toISOString(),
        ttl: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      },
    }))

    return ok({ uploadUrl, fileKey, textractJobId })
  } catch (e) {
    console.error('upload error:', e)
    return err(e instanceof Error ? e.message : 'Upload failed', 500)
  }
}
