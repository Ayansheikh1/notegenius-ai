#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NoteGeniusStack } from '../lib/notegenius-stack'

const app = new cdk.App()

new NoteGeniusStack(app, 'NoteGeniusStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region:  process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
  tags: {
    Project:     'NoteGenius',
    Environment: 'hackathon',
    Team:        'NoteGenius',
  },
})
