# Vercel Blob Storage Setup Guide

## Overview
Your Emineon ATS app now uses Vercel Blob for storing competence files (PDFs and DOCX documents) instead of local storage. This provides scalable, reliable cloud storage with CDN delivery.

## Setup Steps

### 1. Enable Vercel Blob in your project

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `app-emineon` project
3. Go to **Storage** tab
4. Click **Create Database** → **Blob**
5. Name it `emineon-competence-files`
6. Click **Create**

### 2. Get your Blob token

1. After creating the Blob store, copy the **Read-Write Token**
2. Add it to your environment variables:

```bash
# In Vercel Dashboard → Settings → Environment Variables
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

### 3. Local Development Setup

1. Create a `.env.local` file in your project root:
```bash
# .env.local
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

2. The app will automatically:
   - Use **Vercel Blob** in production
   - Use **local file storage** in development (if no BLOB_READ_WRITE_TOKEN)

## Features

### ✅ **Production Ready**
- **Vercel Blob Storage** for scalable file storage
- **CDN delivery** for fast global access
- **Public URLs** for easy file sharing
- **Automatic cleanup** and file management

### ✅ **Development Friendly**
- **Fallback to local storage** when no Blob token
- **Same API interface** for both storage types
- **Easy testing** without external dependencies

### ✅ **Security & Performance**
- **Public access** for competence files (intended for sharing)
- **Organized file structure** with timestamps and metadata
- **Content-type headers** for proper file handling
- **Error handling** and retry logic

## File Organization

Files are stored with this structure:
```
competence-files/
├── 2024-01-15T10-30-00-000Z_John_Doe_Competence_File.pdf
├── 2024-01-15T10-31-00-000Z_Jane_Smith_Competence_File.docx
└── ...
```

## Storage Costs

Vercel Blob pricing (as of 2024):
- **Free tier**: 100MB included
- **Pro plan**: $20/month for 1TB
- **Additional**: $0.03/GB per month

For a typical ATS usage (hundreds of competence files):
- **Average file size**: 500KB - 2MB
- **Monthly files**: ~100-500 documents
- **Storage needed**: ~50MB - 500MB per month
- **Cost**: Free to ~$15/month

## Migration from Local Storage

The migration is automatic:
1. **New files** → stored in Vercel Blob
2. **Existing files** → remain in local storage until regenerated
3. **No data loss** → gradual transition as files are regenerated

## Monitoring & Management

### View files in Vercel Dashboard:
1. Go to **Storage** → **Blob**
2. Select your `emineon-competence-files` store
3. Browse and manage files

### API endpoints for file management:
- `GET /api/competence-files/list` - List all files
- `DELETE /api/competence-files/{id}` - Delete a file
- `GET /api/competence-files/{id}/download` - Download a file

## Troubleshooting

### Error: "Failed to upload file to Vercel Blob"
1. Check your `BLOB_READ_WRITE_TOKEN` is correct
2. Verify the token has write permissions
3. Check Vercel Blob storage limits

### Files not accessible
1. Ensure files have `public` access (set automatically)
2. Check file URLs are complete and valid
3. Verify CDN propagation (may take a few minutes)

### Development issues
1. If no Blob token → app uses local storage (normal)
2. If Blob token but errors → check token permissions
3. For testing → temporarily remove token to use local storage

---

## Ready to Deploy! 🚀

Your storage is now production-ready with Vercel Blob. Files will be:
- ✅ Stored securely in the cloud
- ✅ Delivered via global CDN
- ✅ Accessible with permanent URLs
- ✅ Automatically backed up by Vercel 