#!/usr/bin/env node

/**
 * Service Connection Test Script
 * Tests all external service connections and configurations
 */

const { PrismaClient } = require('@prisma/client')

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...')
  
  try {
    const prisma = new PrismaClient()
    await prisma.$connect()
    console.log('✅ Database connection successful')
    await prisma.$disconnect()
  } catch (error) {
    console.log('❌ Database connection failed:', error.message)
  }
}

async function testClerkConfig() {
  console.log('🔍 Testing Clerk configuration...')
  
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  const secretKey = process.env.CLERK_SECRET_KEY
  const enabledFlag = process.env.ENABLE_CLERK
  
  if (!publishableKey || publishableKey.includes('placeholder')) {
    console.log('❌ Clerk publishable key not configured')
    return
  }
  
  if (!secretKey || secretKey.includes('placeholder')) {
    console.log('❌ Clerk secret key not configured')
    return
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.log('❌ Invalid Clerk publishable key format')
    return
  }
  
  if (!secretKey.startsWith('sk_')) {
    console.log('❌ Invalid Clerk secret key format')
    return
  }
  
  if (enabledFlag !== 'true') {
    console.log('⚠️  Clerk is configured but not enabled (ENABLE_CLERK=false)')
  } else {
    console.log('✅ Clerk configuration looks good')
  }
}

async function testBlobConfig() {
  console.log('🔍 Testing Vercel Blob configuration...')
  
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN
  const enabledFlag = process.env.ENABLE_FILE_UPLOADS
  
  if (!blobToken || blobToken.includes('placeholder')) {
    console.log('❌ Vercel Blob token not configured')
    return
  }
  
  if (!blobToken.startsWith('vercel_blob_rw_')) {
    console.log('❌ Invalid Vercel Blob token format')
    return
  }
  
  if (enabledFlag !== 'true') {
    console.log('⚠️  Blob storage is configured but not enabled (ENABLE_FILE_UPLOADS=false)')
  } else {
    console.log('✅ Vercel Blob configuration looks good')
  }
}

async function testGitHubConfig() {
  console.log('🔍 Testing GitHub API configuration...')
  
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  
  if (!token || token.includes('placeholder') || token === 'ghp_...') {
    console.log('⚠️  GitHub token not configured (optional)')
    return
  }
  
  if (!owner || owner.includes('placeholder') || owner === 'your-github-username') {
    console.log('⚠️  GitHub owner not configured')
    return
  }
  
  if (!repo || repo.includes('placeholder') || repo === 'your-repo-name') {
    console.log('⚠️  GitHub repo not configured')
    return
  }
  
  console.log('✅ GitHub API configuration looks good')
}

async function testSecuritySecrets() {
  console.log('🔍 Testing security secrets...')
  
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const webhookSecret = process.env.WEBHOOK_SECRET
  
  if (!nextAuthSecret || nextAuthSecret.includes('placeholder') || nextAuthSecret === 'your-nextauth-secret') {
    console.log('⚠️  NextAuth secret not configured (recommended)')
  } else if (nextAuthSecret.length < 32) {
    console.log('⚠️  NextAuth secret should be at least 32 characters')
  } else {
    console.log('✅ NextAuth secret configured')
  }
  
  if (!webhookSecret || webhookSecret.includes('placeholder') || webhookSecret === 'your-webhook-secret') {
    console.log('⚠️  Webhook secret not configured (recommended)')
  } else if (webhookSecret.length < 32) {
    console.log('⚠️  Webhook secret should be at least 32 characters')
  } else {
    console.log('✅ Webhook secret configured')
  }
}

async function testEmailConfig() {
  console.log('🔍 Testing email configuration...')
  
  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPassword = process.env.SMTP_PASSWORD
  const sendGridKey = process.env.SENDGRID_API_KEY
  
  if (sendGridKey && !sendGridKey.includes('placeholder')) {
    console.log('✅ SendGrid configuration found')
    return
  }
  
  if (smtpHost && smtpUser && smtpPassword) {
    if (smtpUser.includes('placeholder') || smtpPassword.includes('placeholder')) {
      console.log('⚠️  SMTP configured but using placeholder values')
    } else {
      console.log('✅ SMTP configuration found')
    }
    return
  }
  
  console.log('⚠️  No email service configured (optional)')
}

async function main() {
  console.log('🚀 Testing external service connections...\n')
  
  // Test required services
  console.log('== REQUIRED SERVICES ==')
  await testDatabaseConnection()
  await testClerkConfig()
  await testBlobConfig()
  
  console.log('\n== RECOMMENDED SERVICES ==')
  await testGitHubConfig()
  await testSecuritySecrets()
  
  console.log('\n== OPTIONAL SERVICES ==')
  await testEmailConfig()
  
  console.log('\n🏁 Service testing complete!')
  console.log('\nNext steps:')
  console.log('1. Fix any ❌ issues above')
  console.log('2. Run: npm run build')
  console.log('3. Run: npm run dev')
  console.log('4. Test functionality in browser')
}

// Load environment variables manually since we're not in Next.js context
const fs = require('fs')
const path = require('path')

function loadEnvFile() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^#][^=]*)=(.*)$/)
      if (match) {
        const [, key, value] = match
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '')
      }
    })
  } catch (error) {
    console.log('Warning: Could not load .env.local file')
  }
}

// Load environment variables and run tests
loadEnvFile()
main().catch(console.error)