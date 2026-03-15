import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'
import * as path from 'path'

export class NoteGeniusStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // ─────────────────────────────────────────────────────────────────────────
    // 1. S3 BUCKETS
    // ─────────────────────────────────────────────────────────────────────────

    // File uploads bucket (PDFs, audio files)
    const uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName: `notegenius-uploads-${this.account}`,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.GET],
        allowedOrigins: ['*'],
        allowedHeaders: ['*'],
        maxAge: 3000,
      }],
      lifecycleRules: [{
        id: 'expire-uploads',
        expiration: cdk.Duration.days(7), // auto-clean uploads after 7 days
        enabled: true,
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Frontend hosting bucket
    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
      bucketName: `notegenius-web-${this.account}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 2. DYNAMODB TABLES
    // ─────────────────────────────────────────────────────────────────────────

    // Notes table — PK: USER#<userId>, SK: NOTE#<noteId>
    const notesTable = new dynamodb.Table(this, 'NotesTable', {
      tableName: 'notegenius-notes',
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode:  dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Extraction jobs table — PK: fileKey
    const jobsTable = new dynamodb.Table(this, 'JobsTable', {
      tableName: 'notegenius-jobs',
      partitionKey: { name: 'fileKey', type: dynamodb.AttributeType.STRING },
      billingMode:  dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 3. COGNITO USER POOL (Auth)
    // ─────────────────────────────────────────────────────────────────────────

    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'notegenius-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: 'notegenius-web-client',
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 4. IAM ROLE FOR LAMBDAS
    // ─────────────────────────────────────────────────────────────────────────

    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    })

    // S3 permissions
    uploadsBucket.grantReadWrite(lambdaRole)

    // DynamoDB permissions
    notesTable.grantReadWriteData(lambdaRole)
    jobsTable.grantReadWriteData(lambdaRole)

    // Textract permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'textract:StartDocumentTextDetection',
        'textract:GetDocumentTextDetection',
        'textract:StartDocumentAnalysis',
        'textract:GetDocumentAnalysis',
      ],
      resources: ['*'],
    }))

    // Transcribe permissions
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'transcribe:StartTranscriptionJob',
        'transcribe:GetTranscriptionJob',
      ],
      resources: ['*'],
    }))

    // Bedrock permissions (Claude via Bedrock)
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream',
      ],
      resources: ['*'],
    }))

    // ─────────────────────────────────────────────────────────────────────────
    // 5. COMMON LAMBDA ENVIRONMENT VARIABLES
    // ─────────────────────────────────────────────────────────────────────────

    const commonEnv: Record<string, string> = {
      UPLOAD_BUCKET:       uploadsBucket.bucketName,
      NOTES_TABLE:         notesTable.tableName,
      JOBS_TABLE:          jobsTable.tableName,
      COGNITO_USER_POOL:   userPool.userPoolId,
      ANTHROPIC_API_KEY:   process.env.ANTHROPIC_API_KEY || '',
      NODE_OPTIONS:        '--enable-source-maps',
    }

    const lambdaDefaults: Partial<lambda.FunctionProps> = {
      runtime:      lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      role:         lambdaRole,
      timeout:      cdk.Duration.seconds(60),
      memorySize:   512,
      environment:  commonEnv,
      tracing:      lambda.Tracing.ACTIVE,
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 6. LAMBDA FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const generateFn = new lambda.Function(this, 'GenerateFn', {
      ...lambdaDefaults,
      functionName: 'notegenius-generate',
      description: 'Generate AI notes via Anthropic Claude + save to DynamoDB',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas/summarize')),
    })

    const uploadFn = new lambda.Function(this, 'UploadFn', {
      ...lambdaDefaults,
      functionName: 'notegenius-upload',
      description: 'Presigned S3 URL + trigger Textract for PDF extraction',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas/extract')),
    })

    const extractStatusFn = new lambda.Function(this, 'ExtractStatusFn', {
      ...lambdaDefaults,
      functionName: 'notegenius-extract-status',
      description: 'Poll Textract job status and return extracted text',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas/transcribe')),
    })

    const notesFn = new lambda.Function(this, 'NotesFn', {
      ...lambdaDefaults,
      functionName: 'notegenius-notes',
      description: 'CRUD operations for saved notes in DynamoDB',
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambdas/notes')),
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 7. API GATEWAY
    // ─────────────────────────────────────────────────────────────────────────

    const api = new apigateway.RestApi(this, 'NoteGeniusApi', {
      restApiName: 'notegenius-api',
      description: 'NoteGenius AI — REST API',
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      },
      defaultCorsPreflightOptions: {
        allowOrigins:  apigateway.Cors.ALL_ORIGINS,
        allowMethods:  apigateway.Cors.ALL_METHODS,
        allowHeaders:  ['Content-Type', 'Authorization'],
      },
    })

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool],
    })

    const authOpts: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    }

    // POST /generate
    const generate = api.root.addResource('generate')
    generate.addMethod('POST', new apigateway.LambdaIntegration(generateFn), authOpts)

    // POST /upload
    const upload = api.root.addResource('upload')
    upload.addMethod('POST', new apigateway.LambdaIntegration(uploadFn), authOpts)

    // GET /extract-status
    const extractStatus = api.root.addResource('extract-status')
    extractStatus.addMethod('GET', new apigateway.LambdaIntegration(extractStatusFn), authOpts)

    // GET /notes, GET /notes/{id}, DELETE /notes/{id}
    const notes    = api.root.addResource('notes')
    const notesId  = notes.addResource('{id}')
    notes.addMethod('GET',    new apigateway.LambdaIntegration(notesFn), authOpts)
    notesId.addMethod('GET',    new apigateway.LambdaIntegration(notesFn), authOpts)
    notesId.addMethod('DELETE', new apigateway.LambdaIntegration(notesFn), authOpts)

    // ─────────────────────────────────────────────────────────────────────────
    // 8. CLOUDFRONT DISTRIBUTION (Frontend CDN)
    // ─────────────────────────────────────────────────────────────────────────

    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      description: 'NoteGenius OAC',
    })

    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      comment: 'NoteGenius AI Frontend',
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' },
      ],
    })

    // ─────────────────────────────────────────────────────────────────────────
    // 9. STACK OUTPUTS
    // ─────────────────────────────────────────────────────────────────────────

    new cdk.CfnOutput(this, 'ApiUrl',            { value: api.url,                          exportName: 'NoteGeniusApiUrl' })
    new cdk.CfnOutput(this, 'CloudFrontUrl',     { value: `https://${distribution.domainName}`, exportName: 'NoteGeniusWebUrl' })
    new cdk.CfnOutput(this, 'UploadsBucketName', { value: uploadsBucket.bucketName,         exportName: 'NoteGeniusUploadsBucket' })
    new cdk.CfnOutput(this, 'WebsiteBucketName', { value: websiteBucket.bucketName,         exportName: 'NoteGeniusWebBucket' })
    new cdk.CfnOutput(this, 'UserPoolId',        { value: userPool.userPoolId,              exportName: 'NoteGeniusUserPoolId' })
    new cdk.CfnOutput(this, 'UserPoolClientId',  { value: userPoolClient.userPoolClientId,  exportName: 'NoteGeniusClientId' })
    new cdk.CfnOutput(this, 'NotesTableName',    { value: notesTable.tableName,             exportName: 'NoteGeniusNotesTable' })
  }
}
