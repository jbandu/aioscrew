# CBA PDF Upload - Quick Start

## How to Access

1. **Start the backend**: `cd backend && npm run dev`
2. **Start the frontend**: `npm run dev`
3. **Open browser**: Go to `http://localhost:5173`
4. **Select "Union" role** on the landing page
5. **Click "CBA Upload"** in the left sidebar

## Quick Test

1. **Upload a PDF**:
   - Click "Choose PDF file..."
   - Select any PDF file (or create a simple text file with CBA content)
   - Click "Upload & Parse"
   - Wait for parsing (30-60 seconds)

2. **Review Sections**:
   - Check extracted sections
   - Select/deselect as needed
   - All sections selected by default

3. **Import to Neo4j**:
   - Click "Import [X] Selected Section(s) to Neo4j"
   - Wait for confirmation

4. **Test in Chat**:
   - Click "CBA Chat" in sidebar
   - Ask: "What is the international premium rate?"
   - Verify AI answers using imported sections

## Example Test File

Create a file `test-cba.txt`:

```
CBA Section 12.4 - International Premium Pay
Crew members flying international routes shall receive a premium of $125 per flight.
This applies to all flights departing from or arriving at international destinations.

CBA Section 15.2 - Holiday Premium
Crew members working on recognized holidays shall receive premium pay at 1.5x the base rate.
Recognized holidays include: New Year's Day, Christmas, Thanksgiving, and Independence Day.
```

Upload this file and test the full workflow!

## Troubleshooting

- **Backend not running?** Check `http://localhost:3001/api/cba/health`
- **Upload fails?** Ensure `backend/uploads/` directory exists
- **Parse fails?** Check `ANTHROPIC_API_KEY` in `backend/.env`
- **Import fails?** Verify Neo4j connection in `backend/.env`

See `CBA_UPLOAD_GUIDE.md` for detailed documentation.
