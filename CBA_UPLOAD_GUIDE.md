# CBA Contract PDF Upload Guide

## Overview

This guide explains how to access and use the CBA (Collective Bargaining Agreement) contract PDF upload functionality that loads documents into Neo4j.

## Prerequisites

1. **Backend Server Running**: The backend must be running on `http://localhost:3001`
2. **Neo4j Database**: Neo4j must be configured and accessible
3. **Claude API Key**: Required for document parsing (set in `backend/.env` as `ANTHROPIC_API_KEY`)
4. **Frontend Running**: The frontend should be running on `http://localhost:5173`

## How to Access

### Step 1: Start the Application

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```
   The backend should start on `http://localhost:3001`

2. **Start the Frontend**:
   ```bash
   npm run dev
   ```
   The frontend should start on `http://localhost:5173`

### Step 2: Log in as Union Role

1. Open your browser and navigate to `http://localhost:5173`
2. On the landing page, select **"Union"** role
3. You'll see the Union Compliance Dashboard

### Step 3: Navigate to CBA Upload

1. In the left sidebar, click on **"CBA Upload"** (with upload icon)
2. This will take you to the CBA Document Upload page

## Upload Process

The upload process has 3 steps:

### Step 1: Upload PDF

1. Click **"Choose PDF file..."** button
2. Select a PDF file containing your CBA contract (or a `.txt` file)
   - Maximum file size: 10MB
   - Supported formats: `.pdf`, `.txt`
3. Click **"Upload & Parse"** button
4. The file will be uploaded to the server and automatically parsed

**What happens:**
- File is saved to `backend/uploads/` directory
- PDF text is extracted
- Document is sent to Claude AI for parsing
- Contract sections are automatically extracted

### Step 2: Review & Select Sections

After parsing completes, you'll see:
- A list of all extracted contract sections
- Each section shows:
  - **Reference**: Section identifier (e.g., "CBA Section 12.4")
  - **Title**: Section title
  - **Type**: Category (premium-pay, compliance, scheduling, benefits, general)
  - **Relevance**: Relevance score (0-100%)
  - **Text**: Preview of section content

**Actions:**
- Click on any section to select/deselect it
- Use **"Select All"** to select all sections
- Use **"Deselect All"** to clear selection
- By default, all sections are selected

### Step 3: Import to Neo4j

1. Review your selected sections
2. Click **"Import [X] Selected Section(s) to Neo4j"** button
3. Wait for the import to complete

**What happens:**
- Selected sections are imported into Neo4j knowledge graph
- Sections are stored as `ContractSection` nodes
- Relationships between sections are detected and created
- Sections become available for AI chat queries

## Testing the Full Workflow

### Complete Test Flow

1. **Upload a Test Document**:
   - Create a simple PDF or text file with CBA contract content
   - Example content:
     ```
     CBA Section 12.4 - International Premium Pay
     Crew members flying international routes shall receive a premium of $125 per flight.
     This applies to all flights departing from or arriving at international destinations.
     
     CBA Section 15.2 - Holiday Premium
     Crew members working on recognized holidays shall receive premium pay at 1.5x the base rate.
     ```

2. **Upload & Parse**:
   - Select your test file
   - Click "Upload & Parse"
   - Wait for parsing to complete (may take 30-60 seconds)

3. **Review Sections**:
   - Verify sections were extracted correctly
   - Check that references, titles, and text are accurate
   - Adjust selection if needed

4. **Import to Neo4j**:
   - Click "Import to Neo4j"
   - Wait for confirmation message

5. **Test with CBA Chat**:
   - Navigate to **"CBA Chat"** in the sidebar
   - Ask questions like:
     - "What is the international premium rate?"
     - "How much do crew members get for holiday premium?"
   - Verify the AI can answer using the imported sections

## API Endpoints Used

The frontend calls these backend endpoints:

- `POST /api/cba/upload` - Upload document
- `POST /api/cba/parse/:documentId` - Parse uploaded document
- `POST /api/cba/import` - Import sections to Neo4j

## Troubleshooting

### Upload Fails

**Error: "Failed to upload document"**
- Check that backend is running on port 3001
- Verify `backend/uploads/` directory exists and is writable
- Check file size (max 10MB)
- Ensure file is PDF or TXT format

### Parsing Fails

**Error: "Failed to parse document"**
- Check that `ANTHROPIC_API_KEY` is set in `backend/.env`
- Verify Claude API key is valid
- Check backend logs for detailed error messages
- Ensure PDF is text-based (not scanned images)

### Import Fails

**Error: "Failed to import sections"**
- Verify Neo4j connection settings in `backend/.env`:
  - `NEO4J_URI`
  - `NEO4J_USERNAME`
  - `NEO4J_PASSWORD`
- Check Neo4j database is running and accessible
- Review backend logs for Neo4j connection errors

### Sections Not Appearing in Chat

- Verify sections were successfully imported (check success message)
- Try asking questions using exact section references
- Check Neo4j database to confirm sections exist:
  ```cypher
  MATCH (s:ContractSection) RETURN s.reference, s.title LIMIT 10
  ```

## Additional Features

### CBA Chat

After uploading documents, you can:
- Navigate to **"CBA Chat"** in the sidebar
- Ask questions from different perspectives:
  - **Administrator**: Management/cost focus
  - **Union Rep**: Worker rights focus
  - **Both Perspectives**: See both answers side-by-side
- Validate answers as correct/incorrect to improve accuracy

### Health Check

Test backend connectivity:
```bash
curl http://localhost:3001/api/cba/health
```

Should return:
```json
{
  "success": true,
  "message": "CBA Knowledge Graph API is running",
  "version": "1.0.0"
}
```

## File Structure

```
backend/
  ├── uploads/          # Uploaded PDF files (created automatically)
  ├── api/
  │   └── cba-routes.ts # CBA API endpoints
  └── services/
      ├── cba-document-service.ts  # PDF parsing & import logic
      └── neo4j-service.ts         # Neo4j operations

src/
  └── components/
      └── cba/
          ├── CBADocumentUpload.tsx  # Upload UI component
          └── CBAChat.tsx            # Chat UI component
```

## Next Steps

1. Upload your actual CBA contract PDF
2. Review and validate extracted sections
3. Import sections to Neo4j
4. Test queries in CBA Chat
5. Validate responses to improve accuracy

---

**Note**: The first time you upload a document, parsing may take longer as Claude processes the entire document. Subsequent uploads of similar documents may be faster.
