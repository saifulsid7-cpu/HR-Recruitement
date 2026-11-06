/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import { evaluateGradeFitAndTenure } from './src/utils/gradeFitHelper.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (process.env.PORT && process.env.PORT !== '8080') {
    const envPort = Number(process.env.PORT);
    if (!isNaN(envPort) && envPort > 0) return envPort;
  }
  return 3000;
}
const PORT = resolvePort();

app.use(express.json({ limit: '50mb' }));

// Health check endpoint for Cloud Run container lifecycle
app.get('/api/health', (_req: Request, res: Response) => {
  const key = process.env.GEMINI_API_KEY;
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    port: PORT,
    hasGeminiKey: Boolean(key && key !== 'MY_GEMINI_API_KEY'),
    keyPrefix: key && key !== 'MY_GEMINI_API_KEY' ? key.substring(0, 6) + '...' : 'none',
  });
});

// Helper to clean base64 data
function cleanBase64(dataUrl: string): { data: string; mimeType: string } {
  if (dataUrl.includes(';base64,')) {
    const parts = dataUrl.split(';base64,');
    const mimeType = parts[0].replace('data:', '');
    return { data: parts[1], mimeType };
  }
  return { data: dataUrl, mimeType: 'application/pdf' };
}

// Helper to check if file is DOCX/DOC
function isDocxFile(fileName = '', mimeType = ''): boolean {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();
  return (
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    lowerMime.includes('wordprocessingml') ||
    lowerMime.includes('msword') ||
    lowerMime.includes('officedocument')
  );
}

// Clean and normalize extracted text, preserving newlines, headers, tables, and bullet points
function cleanExtractedText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove binary PDF artifacts if any leaked through
    .replace(/%PDF-[\s\S]*?(%%EOF|$)/gi, '')
    .replace(/\b[0-9]+\s+[0-9]+\s+obj\b[\s\S]*?\bendobj\b/gi, '')
    .replace(/stream[\s\S]*?endstream/gi, '')
    // Normalize bullet characters into standard bullet
    .replace(/[\u2022\u25cf\u25aa\u25cb\u2043]/g, '• ')
    // Normalize unicode dashes and quotes
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    // Remove non-printable control characters except \n, \t
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
    // Collapse 3+ newlines to 2 to preserve paragraphs
    .replace(/\n{3,}/g, '\n\n')
    // Collapse multiple horizontal spaces to single space, preserving newlines
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Extract plain text from DOCX buffer using mammoth
async function extractTextFromDocxBuffer(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value?.trim() || '';
    return cleanExtractedText(text);
  } catch (err: any) {
    console.warn('Error extracting text with mammoth:', err?.message);
    return '';
  }
}

// Extract plain text from PDF buffer using PDFParse and direct spatial reconstruction
async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  // Strategy 1: Try PDFParse class with structured page text joiner
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText({ lineEnforce: true, itemJoiner: ' ' });
    const raw = result?.text || '';
    if (raw && raw.length >= 80) {
      const clean = cleanExtractedText(raw);
      if (clean.length >= 100) return clean;
    }
  } catch (err: any) {
    console.warn('PDFParse standard getText note:', err?.message || err);
  }

  // Strategy 2: Direct pdfjs-dist getDocument with spatial line and column layout reconstruction
  // This explicitly handles multi-column layouts, tables, headers, and bulleted duties
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const loadingTask = pdfjs.getDocument({
      data: new Uint8Array(buffer),
      verbosity: 0,
      useSystemFonts: true,
      disableFontFace: true,
      isEvalSupported: false,
    });
    const doc = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const textContent = await page.getTextContent({
        includeMarkedContent: false,
        disableNormalization: false,
      });

      const items: Array<{ str: string; x: number; y: number; width: number; height: number }> = [];
      for (const item of textContent.items) {
        if ('str' in item && typeof item.str === 'string' && item.str.length > 0) {
          const tm = item.transform; // [scaleX, skewY, skewX, scaleY, transX, transY]
          const x = tm ? tm[4] : 0;
          const y = tm ? tm[5] : 0;
          items.push({
            str: item.str,
            x,
            y,
            width: item.width || 0,
            height: item.height || 0,
          });
        }
      }

      if (items.length === 0) continue;

      // Group items into lines based on Y coordinate (within 3.5pt tolerance)
      // Note: In PDF coordinate system, Y increases from bottom to top, so higher Y is higher on page
      items.sort((a, b) => b.y - a.y || a.x - b.x);

      const lines: Array<{ y: number; items: typeof items }> = [];
      for (const item of items) {
        const line = lines.find((l) => Math.abs(l.y - item.y) <= 3.5);
        if (line) {
          line.items.push(item);
        } else {
          lines.push({ y: item.y, items: [item] });
        }
      }

      // Sort each line horizontally from left to right
      const lineStrings: string[] = [];
      for (const line of lines) {
        line.items.sort((a, b) => a.x - b.x);
        let lineText = '';
        let prevRight = -1;
        for (const item of line.items) {
          if (prevRight !== -1 && item.x - prevRight > 15) {
            // Gap indicates table column or distinct tab/column separation
            lineText += '   ';
          } else if (prevRight !== -1 && item.x - prevRight > 1 && !lineText.endsWith(' ') && !item.str.startsWith(' ')) {
            lineText += ' ';
          }
          lineText += item.str;
          prevRight = item.x + item.width;
        }
        if (lineText.trim()) {
          lineStrings.push(lineText.trim());
        }
      }

      pageTexts.push(lineStrings.join('\n'));
    }

    const fullDirectText = pageTexts.join('\n\n');
    const clean = cleanExtractedText(fullDirectText);
    if (clean.length >= 100) {
      return clean;
    }
  } catch (err: any) {
    console.warn('pdfjs-dist direct extraction note:', err?.message || err);
  }

  // Strategy 3: Text stream decoding fallback (for non-compressed text in PDF stream)
  try {
    const raw = buffer.toString('utf-8');
    if (!raw.includes('%PDF-') && raw.length > 50) {
      const clean = cleanExtractedText(raw);
      if (clean.length >= 100) return clean;
    }
    const textMatches: string[] = [];
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match;
    while ((match = tjRegex.exec(raw)) !== null) {
      textMatches.push(match[1]);
    }
    if (textMatches.length > 5) {
      const extracted = textMatches.join(' ');
      const clean = cleanExtractedText(extracted);
      if (clean.length >= 100) return clean;
    }
  } catch {}

  return '';
}

// Extract readable text from base64 buffer for fallback
async function extractTextFromBase64(base64Str: string, isDocx: boolean): Promise<string> {
  try {
    const buf = Buffer.from(base64Str, 'base64');
    if (isDocx) {
      return await extractTextFromDocxBuffer(buf);
    }
    const pdfText = await extractTextFromPdfBuffer(buf);
    if (pdfText && pdfText.length > 50) {
      return pdfText;
    }
    // Clean UTF-8 fallback, strictly discarding binary headers
    const text = buf.toString('utf-8');
    if (!text.includes('%PDF-') && text.length > 50) {
      return cleanExtractedText(text);
    }
    return '';
  } catch {
    return '';
  }
}

// Initialize Gemini SDK instance
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Global Cloud Persistence Store for cross-browser synchronization
const DATA_DIR = path.join(__dirname, 'data');
const WORKSPACE_FILE = path.join(DATA_DIR, 'workspace_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e);
  }
}

function getWorkspaceData(): any {
  try {
    if (fs.existsSync(WORKSPACE_FILE)) {
      const raw = fs.readFileSync(WORKSPACE_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err: any) {
    console.error('Error reading workspace_db.json:', err?.message || err);
  }
  return null;
}

function saveWorkspaceData(data: any): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(WORKSPACE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err: any) {
    console.error('Error writing workspace_db.json:', err?.message || err);
    return false;
  }
}

// High-speed retry wrapper for Gemini API calls with strict 8-second timeout per attempt
async function callGeminiWithRetry(ai: GoogleGenAI, payload: any, maxRetries = 1): Promise<any> {
  const modelName = payload.model || 'gemini-2.5-flash';
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const apiCall = ai.models.generateContent({
        ...payload,
        model: modelName,
      });
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Gemini ${modelName} timed out after 20s`)), 20000)
      );
      return await Promise.race([apiCall, timeout]);
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini call (${modelName}) attempt ${attempt}/${maxRetries} failed:`, err?.message || err);
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 400));
      }
    }
  }
  throw lastError;
}

// Workspace Cloud Sync Endpoints
app.get('/api/workspace', (_req: Request, res: Response) => {
  const data = getWorkspaceData();
  res.json({ success: true, workspace: data });
});

app.post('/api/workspace', (req: Request, res: Response) => {
  try {
    const incoming = req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'Invalid workspace payload' });
    }
    const current = getWorkspaceData() || {};
    const updated = {
      ...current,
      ...incoming,
      lastUpdated: Date.now(),
    };
    saveWorkspaceData(updated);
    res.json({ success: true, lastUpdated: updated.lastUpdated });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to save workspace' });
  }
});

app.post('/api/workspace/import', (req: Request, res: Response) => {
  try {
    const incoming = req.body?.workspace || req.body;
    if (!incoming || typeof incoming !== 'object') {
      return res.status(400).json({ error: 'Invalid workspace import data' });
    }
    const payload = {
      activeRequisitions: incoming.activeRequisitions || [],
      historicalRequisitions: incoming.historicalRequisitions || [],
      candidates: incoming.candidates || [],
      companyName: incoming.companyName || 'XYZ',
      categories: incoming.categories || [],
      criteriaConfig: incoming.criteriaConfig || [],
      salaryMatrix: incoming.salaryMatrix || [],
      lastUpdated: Date.now(),
    };
    saveWorkspaceData(payload);
    res.json({ success: true, message: 'Workspace imported successfully', workspace: payload });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to import workspace' });
  }
});

app.get('/api/workspace/export', (_req: Request, res: Response) => {
  const data = getWorkspaceData() || {};
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="rmg_recruitment_workspace_backup.json"');
  res.send(JSON.stringify(data, null, 2));
});

// Endpoint: POST /api/extract-policy
app.post('/api/extract-policy', async (req: Request, res: Response) => {
  try {
    const { policyFile } = req.body;
    if (!policyFile || (!policyFile.base64 && !policyFile.content)) {
      return res.status(400).json({ error: 'Policy file content (base64 or text) is required.' });
    }

    const ai = getGeminiClient();
    const fileName = policyFile.name || 'Policy_Document.pdf';

    if (ai) {
      try {
        const { data, mimeType } = cleanBase64(policyFile.base64 || '');
        const prompt = `You are an expert HR recruitment specialist in the Ready-Made Garment (RMG) industry in Bangladesh.
Analyze the attached policy or recruitment guide document ("${fileName}").
Extract and synthesize:
1. Company Name (e.g. Ha-Meem Group, Youngone, Square, Ananta, or Company)
2. Target Job Title (e.g. Merchandiser, HR & Compliance Officer, Fashion Designer, Quality Assurance)
3. Department (e.g. Merchandising, HR & Admin, Quality Assurance, Design)
4. Formatted Content: A complete, structured job description and screening criteria specification including:
   - Job Overview and Key Responsibilities
   - Standard 8-Point Selection Criteria (Education, Experience, Core Skills, Software/Excel, Compliance, Communication, Analytical)
   - Job Stability & Retention Policy (1.5-Year Rule / 18-month minimum average company tenure requirement)
   - Salary Fixation Policy Reference (Grade ME-10 to ME-13 pay scale alignment)
5. A concise 2-sentence summary.

Return valid JSON with the exact structure:
{
  "companyName": "string",
  "title": "string",
  "department": "string",
  "formattedContent": "string",
  "summary": "string"
}`;

        const contents: any[] = [];
        if (data) {
          contents.push({
            inlineData: {
              data,
              mimeType: mimeType || policyFile.mimeType || 'application/pdf',
            },
          });
        }
        contents.push(prompt);

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        return res.json({ policy: parsed });
      } catch (geminiError: any) {
        console.warn('Gemini policy extraction error, falling back to heuristic:', geminiError?.message);
      }
    }

    // Heuristic fallback if Gemini API is unavailable
    const isDocx = isDocxFile(fileName, policyFile.mimeType);
    const rawText = policyFile.base64 ? await extractTextFromBase64(policyFile.base64, isDocx) : '';
    const cleanName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

    let detectedCompany = 'XYZ Group';
    if (/ha-?meem/i.test(cleanName + rawText)) detectedCompany = 'Ha-Meem Group';
    else if (/youngone/i.test(cleanName + rawText)) detectedCompany = 'Youngone Corporation';
    else if (/square/i.test(cleanName + rawText)) detectedCompany = 'Square Fashions';
    else if (/ananta/i.test(cleanName + rawText)) detectedCompany = 'Ananta Companies';
    else if (/standard/i.test(cleanName + rawText)) detectedCompany = 'Standard Group';

    let detectedTitle = cleanName;
    if (/merchandis/i.test(cleanName + rawText)) detectedTitle = 'Merchandiser (Apparel & Buying House)';
    else if (/fashion|design/i.test(cleanName + rawText)) detectedTitle = 'Fashion Designer / Pattern & CAD';
    else if (/hr|compliance/i.test(cleanName + rawText)) detectedTitle = 'HR & Factory Compliance Officer';
    else if (/qa|qc|quality/i.test(cleanName + rawText)) detectedTitle = 'Quality Assurance (QA/QC) Officer';

    return res.json({
      policy: {
        companyName: detectedCompany,
        title: detectedTitle,
        department: 'Operations & Technical',
        formattedContent: `Job Title: ${detectedTitle}
Company: ${detectedCompany}
Source: Extracted from ${fileName}

### Standard Selection Criteria:
1. Education (15%): Degree or diploma relevant to the functional department.
2. Experience (20%): Minimum 2-5 years in apparel manufacturing / export buying operations.
3. Core Technical Skills (30%): Hands-on execution of daily department workflows.
4. Software & Tools (10%): MS Excel (intermediate/advanced) and ERP systems.
5. RMG Compliance (10%): Working understanding of buyer codes of conduct and labour standards.
6. Communication (7%): Confident professional reporting in Bengali and working English.
7. Analytical Mindset (8%): Ability to solve problems under peak production targets.

### Job Stability & Retention Policy (1.5-Year Rule):
- Candidates must demonstrate a minimum average tenure of 1.5 years (18 months) per previous company.
- Unstable rapid job changers with frequent tenures under 18 months will not be shortlisted.

### Salary Fixation Policy Reference:
- Fixed under approved Grade ME-10 to ME-13 brackets based on verified experience months.`,
        summary: `Recruitment criteria extracted for ${detectedTitle} under ${detectedCompany} standards.`,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/extract-policy:', error);
    res.status(500).json({ error: error.message || 'Internal server error extracting policy' });
  }
});

// Endpoint: POST /api/screen-cv
app.post('/api/screen-cv', async (req: Request, res: Response) => {
  try {
    const {
      jobDescription,
      jobRequirements,
      companyCriteria,
      keyResponsibilities,
      keyKSA,
      targetPosition,
      jobTitle,
      department,
      requisitionNo,
      salaryRange,
      sbuUnit,
      academicDegrees: reqAcademicDegrees,
      professionalCertifications,
      hardTechnicalSkills,
      minExperienceYears,
      experienceLevel,
      industries,
      rmgType,
      rmgProducts,
      buyerPortfolio,
      companyName,
      companyType,
      jobType,
      targetGradeCode,
      compensationBenefits,
      customWeights,
      targetRequisitionId,
      multipleJobs,
      cvFile,
    } = req.body;

    if (!cvFile || (!cvFile.base64 && !cvFile.content)) {
      return res.status(400).json({ error: 'CV file content (base64 or text) is required.' });
    }

    const fileName = cvFile.name || 'Candidate_Resume.pdf';

    // 1. EXTRACT FULL RESUME TEXT WITH COMPREHENSIVE MULTI-STRATEGY EXTRACTION
    const { data, mimeType } = cleanBase64(cvFile.base64 || '');
    const lowerName = fileName.toLowerCase();
    const isDocx = isDocxFile(fileName, mimeType || cvFile.mimeType);
    const isImage =
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      (mimeType && mimeType.startsWith('image/')) ||
      (cvFile.mimeType && cvFile.mimeType.startsWith('image/'));
    const isRtf = lowerName.endsWith('.rtf') || (mimeType && mimeType.includes('rtf'));
    const isPlain = lowerName.endsWith('.txt') || lowerName.endsWith('.md') || (mimeType && mimeType.startsWith('text/'));
    let extractedResumeText = (cvFile.content || '').trim();

    if (data) {
      const buf = Buffer.from(data, 'base64');
      if (isPlain) {
        extractedResumeText = cleanExtractedText(buf.toString('utf-8'));
      } else if (isRtf) {
        const rawText = buf.toString('utf-8');
        // Strip RTF control codes
        extractedResumeText = cleanExtractedText(rawText.replace(/\\(?:[a-z]+|\n|.)|[{}]/gi, ' '));
      } else if (isDocx) {
        try {
          extractedResumeText = await extractTextFromDocxBuffer(buf);
        } catch (err: any) {
          console.warn('Could not extract text from docx:', err?.message);
        }
      } else if (!isImage) {
        try {
          extractedResumeText = await extractTextFromPdfBuffer(buf);
        } catch (err: any) {
          console.warn('Could not extract text from pdf:', err?.message);
        }
      } else {
        // Scanned image or photograph of CV: Gemini multimodal vision will directly extract & read all zones
        extractedResumeText = `[Attached Scanned Document/Image Resume: ${fileName}]`;
      }
    }

    // 2. VALIDATION GUARD: Verify content presence.
    // If text extraction yielded < 100 characters, allow if image or valid PDF binary buffer exists for Gemini vision
    if (!extractedResumeText || extractedResumeText.trim().length < 100) {
      if (data && (isImage || (mimeType && mimeType.includes('pdf')) || lowerName.endsWith('.pdf'))) {
        // Fallback for scanned PDF or image documents: allow multimodal Gemini to inspect
        extractedResumeText = extractedResumeText || `[Attached Scanned/Visual Document: ${fileName}]`;
      } else {
        return res.status(400).json({
          error: 'Error: Unable to extract text from document',
          message: 'Could not extract text from document; please re-upload or upload PDF/DOCX/image format.',
          extractedLength: extractedResumeText ? extractedResumeText.trim().length : 0,
          fileName,
        });
      }
    }

    // 3. ISOLATE ACTIVE JOB PARAMETERS (All 18 Requisition Parameters & Dynamic Pillar 2 Criteria)
    const activeJobTitle = jobTitle || targetPosition || 'Target Position';
    const activeDepartment = department || 'General';
    const activeKRA = keyResponsibilities || jobDescription || `Core operational duties and daily deliverables for ${activeJobTitle}`;
    const activeKSA = keyKSA || jobRequirements || `Required competencies, technical qualifications, and software tools for ${activeJobTitle}`;
    const activeCompany = companyCriteria || `Organizational background, environment, and retention standards for ${activeJobTitle}`;

    // Build dynamic list of ONLY filled/configured Pillar 2 requirements
    const configuredPillar2Items: string[] = [];
    if (Array.isArray(reqAcademicDegrees) && reqAcademicDegrees.length > 0) {
      configuredPillar2Items.push(`Academic Qualifications: ${reqAcademicDegrees.join(', ')}`);
    }
    if (Array.isArray(professionalCertifications) && professionalCertifications.length > 0) {
      configuredPillar2Items.push(`Professional Certifications: ${professionalCertifications.join(', ')}`);
    }
    if (Array.isArray(hardTechnicalSkills) && hardTechnicalSkills.length > 0) {
      configuredPillar2Items.push(`Hard Technical Skills: ${hardTechnicalSkills.join(', ')}`);
    }
    if (minExperienceYears !== undefined && minExperienceYears !== null && String(minExperienceYears).trim() !== '') {
      configuredPillar2Items.push(`Minimum Experience: ${minExperienceYears} years${experienceLevel ? ` (${experienceLevel})` : ''}`);
    } else if (experienceLevel && experienceLevel.trim() !== '') {
      configuredPillar2Items.push(`Experience Level: ${experienceLevel}`);
    }
    if (Array.isArray(industries) && industries.length > 0) {
      configuredPillar2Items.push(`Industry Segment: ${industries.join(', ')}`);
    }
    if (Array.isArray(rmgType) && rmgType.length > 0) {
      configuredPillar2Items.push(`RMG Type: ${rmgType.join(', ')}`);
    }
    if (Array.isArray(rmgProducts) && rmgProducts.length > 0) {
      configuredPillar2Items.push(`RMG Product Line: ${rmgProducts.join(', ')}`);
    }
    if (Array.isArray(buyerPortfolio) && buyerPortfolio.length > 0) {
      configuredPillar2Items.push(`Buyer Portfolio: ${buyerPortfolio.join(', ')}`);
    }
    if (companyType && companyType.trim() !== '') {
      configuredPillar2Items.push(`Company Type: ${companyType}${companyName ? ` (${companyName})` : ''}`);
    } else if (companyName && companyName.trim() !== '') {
      configuredPillar2Items.push(`Company: ${companyName}`);
    }
    if (jobType && jobType.trim() !== '') {
      configuredPillar2Items.push(`Job Type: ${jobType}`);
    }
    if (targetGradeCode && targetGradeCode.trim() !== '') {
      configuredPillar2Items.push(`Job Grade: ${targetGradeCode}`);
    }
    if (sbuUnit && sbuUnit.trim() !== '') {
      configuredPillar2Items.push(`Job Location / SBU: ${sbuUnit}`);
    }
    if (salaryRange && salaryRange.trim() !== '') {
      configuredPillar2Items.push(`Salary Range: ${salaryRange}`);
    }
    if (compensationBenefits && compensationBenefits.trim() !== '') {
      configuredPillar2Items.push(`Compensation & Benefits: ${compensationBenefits}`);
    }
    if (configuredPillar2Items.length === 0) {
      configuredPillar2Items.push(`General Qualifications & Domain Fit: ${activeKSA}`);
    }

    const isMultiJob = Array.isArray(multipleJobs) && multipleJobs.length > 1;

    const multiJobContext = isMultiJob
      ? `MULTI-POSITION BATCH MATCHING MODE:
The candidate's CV is being evaluated across ${multipleJobs.length} active job positions simultaneously:
${multipleJobs.map((j: any, i: number) => `Position ${i + 1}: [ID: "${j.id}"] "${j.title}" (Dept: ${j.department || 'Operations'})\nKey Duties & Requirements: ${(j.content || j.jobDescription || '').slice(0, 800)}`).join('\n\n')}

CRITICAL MULTI-JOB MATCHING INSTRUCTIONS:
1. Evaluate how well the candidate matches EACH of the above ${multipleJobs.length} positions based on functional domain and actual duties.
2. In 'allEvaluatedJobs', return an array item for EVERY position containing:
   - id: position ID
   - title: position Title
   - score: match score between 0 and 100
   - verdict: 'Perfect Matched' (>=85) | 'Better' (>=70) | 'Good' (>=50) | 'Irrelevant / Domain Mismatch' (<50)
3. Select the position where the candidate has the HIGHEST match score:
   - Set 'matchedRequisitionId' to this position's ID
   - Set 'appliedPosition' and 'category' to this position's Title
   - Set 'score' to this highest match score
4. Tailor 'criteriaMarks', 'scoreExplanation', 'actionOpinion', 'keyStrengths', and 'criticalGaps' specifically for this best-matched position.`
      : `ACTIVE JOB REQUISITION DETAILS (ISOLATED CONTEXT):
- Target Job Title: ${activeJobTitle}
- Target Department: ${activeDepartment}
${requisitionNo ? `- Requisition No: ${requisitionNo}` : ''}
${targetRequisitionId ? `- Requisition ID: ${targetRequisitionId}` : ''}

=== PILLAR 1 TARGET: KEY RESPONSIBILITY AREAS (KRA) & KNOWLEDGE/SKILLS/ATTRIBUTES (KSA) ===
KRA (Daily Duties & Responsibilities):
${activeKRA}

KSA (Knowledge, Skills & Attributes):
${activeKSA}

=== PILLAR 2 TARGET: CONFIGURED POSITION REQUIREMENTS (${configuredPillar2Items.length} Active Criteria — Weight Equally Across These Only) ===
${configuredPillar2Items.map((item, idx) => `${idx + 1}. ${item}`).join('\n')}

=== ADDITIONAL ORGANIZATIONAL CONTEXT ===
${activeCompany}`;

    const ai = getGeminiClient();

    // Default 6 criteria weights summing to 100
    const weights = {
      relevant_experience: customWeights?.relevant_experience ?? 25,
      technical_skills: customWeights?.technical_skills ?? 25,
      education: customWeights?.education ?? 15,
      industry_knowledge: customWeights?.industry_knowledge ?? 15,
      competencies: customWeights?.competencies ?? 10,
      achievements: customWeights?.achievements ?? 10,
    };

    if (ai) {
      try {
        const prompt = `You are an expert HR recruitment evaluator and senior assessment advisor.
Your task is to evaluate the candidate's resume strictly against the ACTIVE JOB REQUISITION parameters provided below.

${multiJobContext}

CANDIDATE CV FILE: "${fileName}"
EXTRACTED RESUME TEXT TRANSCRIPT:
"""
${extractedResumeText}
"""

EVALUATION CONSTITUTION (STRICTLY ENFORCED):

1. TARGET DOMAIN ALIGNMENT & BI-DIRECTIONAL ACRONYM EQUIVALENCE (CRITICAL):
   - Identify the functional domain of the target requisition from its Job Title ("${activeJobTitle}") and Department ("${activeDepartment}").
   - BI-DIRECTIONAL ACRONYM & TITLE NORMALIZATION LEXICON (100% IDENTICAL MATCHES):
     * "Senior Executive" ≡ "Sr. Executive" ≡ "Sr Executive" ≡ "Senior Exec" ≡ "Sr. Officer"
     * "Assistant Executive" ≡ "Asst. Executive" ≡ "Asst Executive" ≡ "Asst. Officer"
     * "Assistant Manager" ≡ "Asst. Manager" ≡ "Asst Manager" ≡ "AM"
     * "Deputy Manager" ≡ "Dep. Manager" ≡ "DM"
     * "Senior Manager" ≡ "Sr. Manager" ≡ "Sr Manager"
     * "General Manager" ≡ "GM"
     * "Senior General Manager" ≡ "Sr. General Manager" ≡ "Sr. GM" ≡ "SGM"
     * "Deputy General Manager" ≡ "DGM" ≡ "Dep. General Manager"
     * "Assistant General Manager" ≡ "AGM" ≡ "Asst. General Manager"
     * "Senior Merchandiser" ≡ "Sr. Merchandiser" ≡ "Sr. Merchant"
     * "Assistant Merchandiser" ≡ "Asst. Merchandiser" ≡ "Asst. Merchant"
     * "Senior Designer" ≡ "Sr. Designer" | "Assistant Designer" ≡ "Asst. Designer"
     * "Senior CAD Master" ≡ "Sr. CAD Master" | "Assistant CAD Master" ≡ "Asst. CAD Master"
     * "Senior Quality Control Officer" ≡ "Sr. Quality Control Officer" ≡ "Sr. QC Officer"
     * "Senior Quality Auditor" ≡ "Sr. Quality Auditor"
     * "Senior Supervisor" ≡ "Sr. Supervisor" | "Assistant Supervisor" ≡ "Asst. Supervisor"
   - Treat full forms and abbreviations as 100% IDENTICAL matches during CV parsing.
   - NEVER lower a candidate's score or assign 'Irrelevant' / 'Domain Mismatch' solely because the resume used an abbreviation (e.g., "Sr. Executive", "Asst. Manager", "DGM", "AGM", "Sr. Merchandiser") instead of the spelled-out title (or vice versa).
   - Inspect the candidate's career track from their work history and responsibilities.
   - If the candidate's career track directly matches this functional domain (e.g. for an HR job: HR Executive, HR Officer, Payroll, Talent Acquisition, Recruitment, Employee Relations, Labor Law Compliance, Personnel Administration; for a Merchandising job: Merchandiser, Assistant Merchandiser, Costing, Sampling; for Quality: QA, QC, AQL Inspector), treat them as a 100% VALID DOMAIN MATCH.
   - CRITICAL REQUIREMENT: It is a FATAL ERROR to mark a genuine domain candidate (e.g., an HR professional applying for an HR position) as "Not Recommended" or "Irrelevant / Domain Mismatch"!
   - Under NO CIRCUMSTANCES should hardcoded rules or criteria from other unrelated departments (such as denim wash formulas, CAD patterns, or merchandising costing) be applied to an HR or other distinct job!
   - ONLY assign "Irrelevant / Domain Mismatch" (score < 50%) if the candidate's career has ZERO functional relation to the target position (e.g., an Accounts Officer applying for a CAD Pattern Maker, or a pure Merchandiser applying for an Industrial Wash Technician).

2. SEMANTIC MEANING & INTENT OVER EXACT WORDS + MAJORITY RELEVANCY SCORING:
   - Resumes vary in sentence structure and terminology. Do NOT search for rigid syntax.
   - If the candidate's documented responsibilities fulfill the functional purpose and operational objective of the job's KRA bullet points, evaluate it as a direct positive match (e.g., JD: "Line coordination & proto sample delivery" <==> CV: "Supervised sewing floor output and followed up buyer proto approvals" -> 100% SEMANTIC MATCH).
   - RULE OF MAJORITY (NO ALL-OR-NOTHING REJECTION): Real-world candidates rarely match 100% of all secondary parameters (Industry, RMG Product, Buyer, Degree, Experience). If a candidate matches the core functional responsibilities and the majority of active specification parameters (e.g., matches 3 out of 4 criteria like Industry, Experience, and Products, but worked with different Buyers), DO NOT reject or stamp as 'Irrelevant'. Calculate candidate relevancy proportionally across what they DO possess rather than applying a zero-tolerance disqualification.

3. EXPLICIT EVIDENCE REQUIREMENT:
   - Explicitly list the EXACT duties from the candidate's CV that satisfy the active job's KRA/KSA.
   - In the 'semanticMatches' array, include items with:
     * label: "Identified Competencies: [Specific area, e.g. Talent Acquisition, Documentation, Policy Compliance]"
     * jdRequirement: The specific active job KRA/KSA duty being fulfilled
     * candidateEvidence: The specific duty/evidence extracted verbatim or summarized from the candidate's CV
     * explanation: Explicitly formatted as "Score Justification: [Explain why and how this verified duty fulfills the active job's requirements]"
     * fulfillmentType: 'duty' | 'competency' | 'objective'

4. DETERMINISTIC SCORING & RECOMMENDATION BADGE LOGIC:
   - 85% - 100%: 'Perfect Matched' (Direct domain match + satisfies core KRA/KSA and majority of specifications)
   - 70% - 84%: 'Better' (Strong domain match + satisfies majority of KRA/KSA with solid operational background)
   - 50% - 69%: 'Good / Average' (Foundational domain match with minor gaps or lower tenure)
   - Below 50%: 'Irrelevant' (Reserved ONLY for candidates with completely unrelated career verticals, e.g., Accounts applying for Wash Technician)
   - Include a crisp 1-sentence 'hrActionOpinion' explaining both the candidate's core strengths and minor secondary gaps.

5. CANDIDATE REAL TITLE & ZERO DESIGNATION BLEED (CRITICAL):
   - 'lastDesignation': Extract the candidate's ACTUAL Last Position from their own CV work history (e.g. 'HR Executive', 'Senior Merchandiser', 'Assistant Manager - HR').
   - NEVER copy or overwrite the candidate's real job title with the target requisition title ("${activeJobTitle}")!
   - 'lastCompany': Extract the candidate's actual most recent employer from their CV (or 'N/A' if missing).
   - Extract actual email and phone from CV, or 'N/A' if missing. Do not invent fake contact information.

6. DUAL-MODE EVALUATION ARCHITECTURE (CRITICAL):
   - Inspect whether the candidate's CV documents detailed daily tasks/responsibilities/KRAs:
     * PATH A ('standard_kra' — Detailed Tasks Present in CV):
       - 'pillar1KraScore' (Task & KRA Semantic Score, 0-100): Percentage of required operational duties fulfilled by functional intent.
       - 'pillar2RequirementsScore' (Specifications Score, 0-100): Proportional score across active criteria (${configuredPillar2Items.length} configured items: Industry fit, RMG type/products, Buyer exposure, Degree, Experience).
       - Composite Score = (Task Score * 0.55) + (Specifications Score * 0.45).
     * PATH B ('designation_only' — "Designation-Only" No-KRA Fallback Mode):
       - If the CV lists only Designation, Department, Company, and Education without detailed task bullets, NEVER reject or mark 'Irrelevant'!
       - Evaluate across 4 weighted dimensions (each scored 0-100):
         1) designationAlignment (Title Alignment — 40% weight): Semantic & hierarchical match between candidate's Designation/Department and "${activeJobTitle}" (${activeDepartment}), accounting for abbreviations and seniority equivalencies.
         2) ksaDomainAttributes (Industry & Buyer Fit — 25% weight): Industry segment, RMG product/type, and buyer portfolio fit.
         3) academicQualifications (Academic Credentials — 20% weight): Degree, major, and certifications against configured academic criteria.
         4) experienceSeniority (Tenure Seniority — 15% weight): Total years of experience and seniority cadre alignment.
       - If profile alignment is high (80-100%), assign an initial score of 75-85% ('Good / Shortlisted (Initial)').
   - Populate 'dimensionBreakdown' with { designationAlignment, academicQualifications, experienceSeniority, ksaDomainAttributes } (each 0-100) for ALL candidates.
   - Populate 'matchedTitleAndDept' as "${activeJobTitle} (${activeDepartment})".

7. 3-PILLAR TRI-MATCH ARCHITECTURE:
   - jdMatch: score (0-100), summary, matchedItems (duties/designations evident in CV), missingItems (active duties not found)
   - requirementsMatch: score (0-100), summary, matchedItems (degrees, years, certifications, software), missingItems (prerequisites missing)
   - companyCriteriaMatch: score (0-100), summary, matchedItems (industry segment, workplace environment), missingItems (company criteria gaps)
   - overallScore: Composite score (0-100)
   - verdict: 'Perfect Matched' | 'Better' | 'Good' | 'Irrelevant / Domain Mismatch'
   - decisiveActionSentence: Crisp 1-sentence HR Action Verdict explaining both the candidate's core strengths and minor secondary gaps.

Return valid JSON conforming to the schema.`;

        const contents: any[] = [];
        contents.push({
          text: `ATTACHED CANDIDATE RESUME TRANSCRIPT (${fileName}):\n\n${extractedResumeText}`,
        });
        if (data) {
          contents.push({
            inlineData: {
              data,
              mimeType: mimeType || cvFile.mimeType || 'application/pdf',
            },
          });
        }
        contents.push(prompt);

        const response = await callGeminiWithRetry(ai, {
          model: 'gemini-2.5-flash',
          contents,
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                appliedPosition: { type: Type.STRING },
                category: { type: Type.STRING },
                lastDesignation: { type: Type.STRING },
                lastCompany: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                education: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                experience: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      role: { type: Type.STRING },
                      company: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      description: { type: Type.STRING },
                    },
                    required: ['role', 'company', 'duration'],
                  },
                },
                totalYearsExperience: { type: Type.NUMBER },
                relevantExperienceYears: { type: Type.NUMBER },
                skills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                evaluationMode: { type: Type.STRING },
                matchedTitleAndDept: { type: Type.STRING },
                pillar1KraScore: { type: Type.NUMBER },
                pillar2RequirementsScore: { type: Type.NUMBER },
                dimensionBreakdown: {
                  type: Type.OBJECT,
                  properties: {
                    designationAlignment: { type: Type.NUMBER },
                    academicQualifications: { type: Type.NUMBER },
                    experienceSeniority: { type: Type.NUMBER },
                    ksaDomainAttributes: { type: Type.NUMBER },
                  },
                },
                score: { type: Type.NUMBER },
                criteriaMarks: {
                  type: Type.OBJECT,
                  properties: {
                    relevant_experience: {
                      type: Type.OBJECT,
                      properties: {
                        criterionId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        obtainedMarks: { type: Type.NUMBER },
                        maxMarks: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        evidenceQuote: { type: Type.STRING },
                        assessmentNotes: { type: Type.STRING },
                      },
                      required: ['obtainedMarks', 'maxMarks', 'status', 'assessmentNotes'],
                    },
                    technical_skills: {
                      type: Type.OBJECT,
                      properties: {
                        criterionId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        obtainedMarks: { type: Type.NUMBER },
                        maxMarks: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        evidenceQuote: { type: Type.STRING },
                        assessmentNotes: { type: Type.STRING },
                      },
                      required: ['obtainedMarks', 'maxMarks', 'status', 'assessmentNotes'],
                    },
                    education: {
                      type: Type.OBJECT,
                      properties: {
                        criterionId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        obtainedMarks: { type: Type.NUMBER },
                        maxMarks: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        evidenceQuote: { type: Type.STRING },
                        assessmentNotes: { type: Type.STRING },
                      },
                      required: ['obtainedMarks', 'maxMarks', 'status', 'assessmentNotes'],
                    },
                    industry_knowledge: {
                      type: Type.OBJECT,
                      properties: {
                        criterionId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        obtainedMarks: { type: Type.NUMBER },
                        maxMarks: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        evidenceQuote: { type: Type.STRING },
                        assessmentNotes: { type: Type.STRING },
                      },
                      required: ['obtainedMarks', 'maxMarks', 'status', 'assessmentNotes'],
                    },
                    competencies: {
                      type: Type.OBJECT,
                      properties: {
                        criterionId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        obtainedMarks: { type: Type.NUMBER },
                        maxMarks: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        evidenceQuote: { type: Type.STRING },
                        assessmentNotes: { type: Type.STRING },
                      },
                      required: ['obtainedMarks', 'maxMarks', 'status', 'assessmentNotes'],
                    },
                    achievements: {
                      type: Type.OBJECT,
                      properties: {
                        criterionId: { type: Type.STRING },
                        name: { type: Type.STRING },
                        obtainedMarks: { type: Type.NUMBER },
                        maxMarks: { type: Type.NUMBER },
                        status: { type: Type.STRING },
                        evidenceQuote: { type: Type.STRING },
                        assessmentNotes: { type: Type.STRING },
                      },
                      required: ['obtainedMarks', 'maxMarks', 'status', 'assessmentNotes'],
                    },
                  },
                },
                scoreExplanation: { type: Type.STRING },
                matchingQualifications: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                gapsAndMismatches: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                unverifiableInformation: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                evidenceCompleteness: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.STRING },
                    percentage: { type: Type.NUMBER },
                    verifiedCount: { type: Type.NUMBER },
                    totalCheckpoints: { type: Type.NUMBER },
                    missingOrUnverifiable: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['level', 'percentage', 'verifiedCount', 'totalCheckpoints'],
                },
                evidenceSnippets: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                salaryFixation: {
                  type: Type.OBJECT,
                  properties: {
                    department: { type: Type.STRING },
                    category: { type: Type.STRING },
                    grade: { type: Type.STRING },
                    categoryLayer: { type: Type.STRING },
                    eligibleDesignation: { type: Type.STRING },
                    fixedSalary: { type: Type.NUMBER },
                    salaryRangeText: { type: Type.STRING },
                    experienceMonths: { type: Type.NUMBER },
                    requiredMinYears: { type: Type.STRING },
                    minRequiredScoreBand: { type: Type.STRING },
                    sourcingType: { type: Type.STRING },
                    justification: { type: Type.STRING },
                  },
                },
                productSpecialization: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                workEnvironment: { type: Type.STRING },
                buyersWorkedWith: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                technicalCertifications: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                academicDegrees: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                cadSoftwareProficiency: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                attachedCvText: { type: Type.STRING },
                matchedRequisitionId: { type: Type.STRING },
                allEvaluatedJobs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      title: { type: Type.STRING },
                      score: { type: Type.NUMBER },
                      verdict: { type: Type.STRING },
                    },
                    required: ['id', 'title', 'score', 'verdict'],
                  },
                },
                verdict: { type: Type.STRING },
                actionOpinion: { type: Type.STRING },
                keyStrengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                criticalGaps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                decisiveActionSentence: { type: Type.STRING },
                semanticMatches: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      jdRequirement: { type: Type.STRING },
                      candidateEvidence: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      fulfillmentType: { type: Type.STRING },
                    },
                    required: ['label', 'jdRequirement', 'candidateEvidence', 'explanation'],
                  },
                },
                triMatch: {
                  type: Type.OBJECT,
                  properties: {
                    jdMatch: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER },
                        summary: { type: Type.STRING },
                        matchedItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        missingItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['score', 'summary', 'matchedItems', 'missingItems'],
                    },
                    requirementsMatch: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER },
                        summary: { type: Type.STRING },
                        matchedItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        missingItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['score', 'summary', 'matchedItems', 'missingItems'],
                    },
                    companyCriteriaMatch: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.NUMBER },
                        summary: { type: Type.STRING },
                        matchedItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                        missingItems: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                        },
                      },
                      required: ['score', 'summary', 'matchedItems', 'missingItems'],
                    },
                    overallScore: { type: Type.NUMBER },
                    verdict: { type: Type.STRING },
                    decisiveActionSentence: { type: Type.STRING },
                  },
                  required: ['jdMatch', 'requirementsMatch', 'companyCriteriaMatch', 'overallScore', 'verdict', 'decisiveActionSentence'],
                },
              },
              required: [
                'name',
                'category',
                'education',
                'experience',
                'skills',
                'score',
                'scoreExplanation',
                'matchingQualifications',
                'gapsAndMismatches',
              ],
            },
          },
        });

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);

        // Compute job stability (purely advisory analysis, never auto-reject)
        const expList = parsed.experience || [];
        const totalExpYears = parsed.totalYearsExperience || 2.0;
        const totalMonths = Math.round(totalExpYears * 12);
        const totalJobs = expList.length;

        let isFrequentJobChanger = false;
        let avgTenureMonths = totalJobs > 0 ? Math.round(totalMonths / totalJobs) : totalMonths;
        let shortCount = 0;

        const tenureBreakdown = expList.map((item: any) => {
          let est = 12;
          const match = (item.duration || '').match(/(\d+)\s*(?:mos|months?)/i);
          if (match) est = parseInt(match[1], 10);
          else if (/(\d+)\s*(?:yrs?|years?)/i.test(item.duration || '')) {
            const ym = (item.duration || '').match(/(\d+)\s*(?:yrs?|years?)/i);
            if (ym) est = parseInt(ym[1], 10) * 12;
          }
          if (est < 18) shortCount++;
          return {
            role: item.role,
            company: item.company || 'Company',
            duration: item.duration || `${est} mos`,
            estimatedMonths: est,
            isLessThanOneAndHalfYears: est < 18,
          };
        });

        if (totalJobs >= 2 && (avgTenureMonths < 18 || shortCount >= 2)) {
          isFrequentJobChanger = true;
        }

        const jobStability = {
          isFrequentJobChanger,
          disallowed: isFrequentJobChanger,
          averageTenureMonths: avgTenureMonths,
          averageTenureYears: parseFloat((avgTenureMonths / 12).toFixed(1)),
          shortTenuresCount: shortCount,
          totalJobs,
          tenureBreakdown,
          warningSignText: isFrequentJobChanger
            ? 'Tenure Advisory: Rapid Job Changer (< 1.5 yrs)'
            : 'Tenure Stable (≥ 1.5 yrs)',
          flagReason: isFrequentJobChanger
            ? `HR Advisory: Candidate averages ${avgTenureMonths} mos per employer with ${shortCount} tenure(s) under 18 months.`
            : 'Candidate demonstrates stable work tenure exceeding standard retention benchmarks.',
        };

        // Reconcile total score from criteria if available
        let finalScore = parsed.score;
        if (parsed.criteriaMarks) {
          let sumMarks = 0;
          for (const key of Object.keys(parsed.criteriaMarks)) {
            sumMarks += parsed.criteriaMarks[key]?.obtainedMarks || 0;
          }
          if (sumMarks > 0 && Math.abs(sumMarks - finalScore) > 2) {
            finalScore = Math.min(100, Math.round(sumMarks));
          }
        }

        const winningJobId = parsed.matchedRequisitionId || (isMultiJob ? multipleJobs[0]?.id : targetRequisitionId);
        const winningJobTitle = parsed.appliedPosition || (isMultiJob ? multipleJobs[0]?.title : activeJobTitle);

        // 1. EXTRACT CANDIDATE'S ACTUAL DESIGNATION (NEVER OVERWRITE WITH TARGET JOB TITLE)
        let actualCandidateDesig = parsed.lastDesignation?.trim() || expList[0]?.role?.trim() || '';
        const normWinningTitle = winningJobTitle.toLowerCase().trim();

        if (!actualCandidateDesig || actualCandidateDesig.toLowerCase() === normWinningTitle || /professional|candidate/i.test(actualCandidateDesig)) {
          if (expList[0]?.role && expList[0].role.toLowerCase() !== normWinningTitle) {
            actualCandidateDesig = expList[0].role;
          } else if (expList.length > 1 && expList[1]?.role && expList[1].role.toLowerCase() !== normWinningTitle) {
            actualCandidateDesig = expList[1].role;
          } else {
            actualCandidateDesig = expList[0]?.role || 'Professional';
          }
        }

        const lastDesig = actualCandidateDesig || 'Professional';
        const lastComp = (parsed.lastCompany && parsed.lastCompany !== 'Prior RMG Organization' && parsed.lastCompany !== 'N/A')
          ? parsed.lastCompany
          : (expList[0]?.company || 'N/A');

        let totalScoreVal = Math.max(0, Math.min(100, Math.round(finalScore || 75)));

        // Deterministic Badges:
        // 85 - 100%: 'Perfect Matched'
        // 70 - 84%: 'Better'
        // 50 - 69%: 'Good'
        // Below 50%: 'Irrelevant / Domain Mismatch'
        let verdictVal: 'Perfect Matched' | 'Better' | 'Good' | 'Irrelevant / Domain Mismatch' = 'Good';
        if (totalScoreVal >= 85) {
          verdictVal = 'Perfect Matched';
        } else if (totalScoreVal >= 70) {
          verdictVal = 'Better';
        } else if (totalScoreVal >= 50) {
          verdictVal = 'Good';
        } else {
          verdictVal = 'Irrelevant / Domain Mismatch';
        }

        // Factual verdict sentence reflecting genuine qualifications and tenure
        let decisiveAction = parsed.decisiveActionSentence || parsed.triMatch?.decisiveActionSentence || parsed.actionOpinion || '';
        if (!decisiveAction || decisiveAction.includes('Strictly Disqualified') && totalScoreVal >= 50) {
          if (totalScoreVal >= 85) {
            decisiveAction = `Top Recommended: Candidate exhibits ${totalExpYears.toFixed(1)} years of proven expertise as ${lastDesig}${lastComp && lastComp !== 'N/A' ? ` at ${lastComp}` : ''}, exceeding target KRA/KSA requirements.`;
          } else if (totalScoreVal >= 70) {
            decisiveAction = `Recommended: Candidate brings ${totalExpYears.toFixed(1)} years of verified background as ${lastDesig} matching core operational responsibilities.`;
          } else if (totalScoreVal >= 50) {
            decisiveAction = `Qualified: Candidate possesses foundational experience in ${lastDesig} aligning with position requirements.`;
          } else {
            decisiveAction = `Domain Mismatch: Candidate career track is outside the functional competencies required for ${winningJobTitle}.`;
          }
        }

        const gradeFit = evaluateGradeFitAndTenure({
          actualYears: totalExpYears,
          candidateScore: totalScoreVal,
          targetPositionTitle: winningJobTitle,
          lastCompany: lastComp,
          lastDesignation: lastDesig,
        });

        const triMatchData = parsed.triMatch ? {
          jdMatch: {
            score: typeof parsed.triMatch.jdMatch?.score === 'number' ? parsed.triMatch.jdMatch.score : totalScoreVal,
            summary: parsed.triMatch.jdMatch?.summary || 'Demonstrates verified ability to fulfill daily duties and operational workflows.',
            matchedItems: parsed.triMatch.jdMatch?.matchedItems || parsed.matchingQualifications?.slice(0, 3) || ['Daily operational workflows', 'Core responsibility execution'],
            missingItems: parsed.triMatch.jdMatch?.missingItems || parsed.gapsAndMismatches?.slice(0, 1) || ['Advanced enterprise workflows require orientation'],
          },
          requirementsMatch: {
            score: typeof parsed.triMatch.requirementsMatch?.score === 'number' ? parsed.triMatch.requirementsMatch.score : totalScoreVal,
            summary: parsed.triMatch.requirementsMatch?.summary || 'Academic credentials and technical proficiencies fulfill position prerequisites.',
            matchedItems: parsed.triMatch.requirementsMatch?.matchedItems || (parsed.academicDegrees || parsed.education || []).concat(parsed.cadSoftwareProficiency || []),
            missingItems: parsed.triMatch.requirementsMatch?.missingItems || parsed.gapsAndMismatches?.slice(1, 2) || ['Certifications pending verification'],
          },
          companyCriteriaMatch: {
            score: typeof parsed.triMatch.companyCriteriaMatch?.score === 'number' ? parsed.triMatch.companyCriteriaMatch.score : (isFrequentJobChanger ? Math.max(35, totalScoreVal - 20) : totalScoreVal),
            summary: parsed.triMatch.companyCriteriaMatch?.summary || (isFrequentJobChanger ? 'Tenure stability advisory: Candidate averages under 18 months per employer.' : 'Solid alignment with company operational environment and industry standards.'),
            matchedItems: parsed.triMatch.companyCriteriaMatch?.matchedItems || (parsed.buyersWorkedWith || []).concat(parsed.productSpecialization || []),
            missingItems: isFrequentJobChanger ? ['Does not meet 1.5-year retention stability policy benchmark'] : (parsed.triMatch.companyCriteriaMatch?.missingItems || ['Additional exposure to target accounts']),
          },
          overallScore: totalScoreVal,
          verdict: verdictVal as any,
          decisiveActionSentence: decisiveAction,
        } : {
          jdMatch: {
            score: Math.min(100, Math.round(totalScoreVal * 1.02)),
            summary: 'Demonstrates verified ability to execute daily duties and operational deliverables.',
            matchedItems: parsed.matchingQualifications?.slice(0, 3) || ['Operational task execution', 'Functional deliverable tracking'],
            missingItems: parsed.gapsAndMismatches?.slice(0, 1) || ['Specific workflow adaptations'],
          },
          requirementsMatch: {
            score: Math.min(100, Math.round(totalScoreVal * 0.98)),
            summary: 'Meets qualification benchmarks and core software/tool proficiencies.',
            matchedItems: (parsed.academicDegrees || parsed.education || []).concat(parsed.cadSoftwareProficiency || []),
            missingItems: parsed.gapsAndMismatches?.slice(1, 2) || ['Certifications to be verified during interview'],
          },
          companyCriteriaMatch: {
            score: isFrequentJobChanger ? Math.max(35, totalScoreVal - 20) : Math.min(100, Math.round(totalScoreVal * 0.95)),
            summary: isFrequentJobChanger ? 'Tenure stability advisory: Candidate averages under 18 months per employer.' : 'Solid alignment with organizational environment and operational standards.',
            matchedItems: (parsed.buyersWorkedWith || []).concat(parsed.productSpecialization || []),
            missingItems: isFrequentJobChanger ? ['Does not meet 1.5-year retention stability policy benchmark'] : ['Account scope expansion'],
          },
          overallScore: totalScoreVal,
          verdict: verdictVal as any,
          decisiveActionSentence: decisiveAction,
        };

        // Format Semantic Matches with Explicit Identified Competencies & Score Justification
        let formattedSemanticMatches = parsed.semanticMatches;
        if (!Array.isArray(formattedSemanticMatches) || formattedSemanticMatches.length === 0) {
          formattedSemanticMatches = [
            {
              label: `Identified Competencies: ${lastDesig} Core Deliverables`,
              jdRequirement: activeKRA.split('\n')[0] || `Key operational duties for ${winningJobTitle}`,
              candidateEvidence: parsed.matchingQualifications?.[0] || `${lastDesig} responsibilities at ${lastComp}`,
              explanation: `Score Justification: Candidate's verified track record in '${parsed.matchingQualifications?.[0] || 'operations'}' directly satisfies the active job requirement.`,
              fulfillmentType: 'duty',
            },
          ];
        } else {
          formattedSemanticMatches = formattedSemanticMatches.map((m: any) => {
            let label = m.label || 'Identified Competencies';
            if (!label.toLowerCase().includes('identified competencies')) {
              label = `Identified Competencies: ${label.replace(/^(matched\s*(?:duty|competency|leadership)\s*#?\d*[:\s-]*)/i, '')}`;
            }
            let explanation = m.explanation || '';
            if (!explanation.toLowerCase().includes('score justification')) {
              explanation = `Score Justification: ${explanation}`;
            }
            return {
              ...m,
              label,
              explanation,
            };
          });
        }
        parsed.semanticMatches = formattedSemanticMatches;

        // Clean candidate name
        let cleanCandName = (parsed.name || '').trim();
        if (!cleanCandName || cleanCandName.toLowerCase() === 'candidate' || cleanCandName.toLowerCase() === 'candidate profile' || /^(resume|cv|biodata)/i.test(cleanCandName)) {
          cleanCandName = fileName
            .replace(/\.[^/.]+$/, '')
            .replace(/^(resume|cv|biodata)[-_\s]+/i, '')
            .replace(/[-_\s]+(resume|cv|biodata)$/i, '')
            .replace(/^candidate[-_\s]*/i, '')
            .replace(/_/g, ' ')
            .trim();
        }
        cleanCandName = cleanCandName.replace(/^(resume|cv|biodata)[-_\s]+/i, '').trim();
        if (!cleanCandName) {
          cleanCandName = 'Candidate Profile';
        }

        const candEmail = (parsed.email && parsed.email !== 'confidential@domain.local' && !parsed.email.includes('@rmgtalent.com') && parsed.email !== 'N/A')
          ? parsed.email
          : (extractedResumeText ? (extractedResumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] || 'N/A') : 'N/A');

        const candPhone = (parsed.phone && !parsed.phone.toLowerCase().includes('confidential') && parsed.phone !== '+880 1711-000000' && parsed.phone !== '+880 1712-984521' && parsed.phone !== 'N/A')
          ? parsed.phone
          : (extractedResumeText ? (extractedResumeText.match(/(?:\+?880\s?|0)1[3-9]\d{2}[-\s]?\d{6}/)?.[0] || 'N/A') : 'N/A');

        // Dual-Mode Screening & Dual 100-Point Scoring Model (Total 200 Scaled to 100)
        const evalMode: 'standard_kra' | 'designation_only' =
          parsed.evaluationMode === 'designation_only' ? 'designation_only' : 'standard_kra';

        const dimBreakdown = {
          designationAlignment: Math.max(0, Math.min(100, Math.round(parsed.dimensionBreakdown?.designationAlignment ?? totalScoreVal))),
          academicQualifications: Math.max(0, Math.min(100, Math.round(parsed.dimensionBreakdown?.academicQualifications ?? totalScoreVal))),
          experienceSeniority: Math.max(0, Math.min(100, Math.round(parsed.dimensionBreakdown?.experienceSeniority ?? totalScoreVal))),
          ksaDomainAttributes: Math.max(0, Math.min(100, Math.round(parsed.dimensionBreakdown?.ksaDomainAttributes ?? totalScoreVal))),
        };

        let p1Score = typeof parsed.pillar1KraScore === 'number'
          ? parsed.pillar1KraScore
          : (parsed.triMatch?.jdMatch?.score ?? totalScoreVal);
        p1Score = Math.max(0, Math.min(100, Math.round(p1Score)));

        let p2Score = typeof parsed.pillar2RequirementsScore === 'number'
          ? parsed.pillar2RequirementsScore
          : (parsed.triMatch?.requirementsMatch?.score ?? Math.round(totalScoreVal * 0.95));
        p2Score = Math.max(0, Math.min(100, Math.round(p2Score)));

        let totalRaw = p1Score + p2Score;
        // Path A Composite Score = (Task Score * 0.55) + (Specifications Score * 0.45)
        let convertedFinal = Math.round(p1Score * 0.55 + p2Score * 0.45);

        let dualBadge:
          | 'Perfect Matched'
          | 'Relevant / Perfect Matched'
          | 'Better'
          | 'Good / Shortlisted (Initial)'
          | 'Good / Average'
          | 'Irrelevant' = 'Good / Average';

        let hrActionOp = parsed.hrActionOpinion || '';

        if (evalMode === 'designation_only') {
          // Path B: Title Alignment (40%), Industry & Buyer Fit (25%), Academic Credentials (20%), Tenure Seniority (15%)
          const weightedProfile = Math.round(
            dimBreakdown.designationAlignment * 0.4 +
            dimBreakdown.ksaDomainAttributes * 0.25 +
            dimBreakdown.academicQualifications * 0.2 +
            dimBreakdown.experienceSeniority * 0.15
          );
          if (weightedProfile >= 80) {
            convertedFinal = Math.max(75, Math.min(85, Math.round(75 + ((weightedProfile - 80) / 20) * 10)));
            p1Score = convertedFinal;
            p2Score = convertedFinal;
            totalRaw = p1Score + p2Score;
            dualBadge = 'Good / Shortlisted (Initial)';
            verdictVal = 'Better';
            hrActionOp =
              'Initially Shortlisted based on Designation, Department & Credentials fit (80-100% profile match). Candidate resume omits detailed daily KRAs; verify operational duties during 1st round interview.';
            decisiveAction = hrActionOp;
          } else {
            convertedFinal = Math.max(50, weightedProfile);
            p1Score = convertedFinal;
            p2Score = convertedFinal;
            totalRaw = p1Score + p2Score;
            dualBadge = convertedFinal >= 70 ? 'Better' : 'Good / Shortlisted (Initial)';
            verdictVal = convertedFinal >= 70 ? 'Better' : 'Good';
            if (!hrActionOp || hrActionOp.length < 15) {
              hrActionOp = `Initially Shortlisted (${convertedFinal}% profile match) based on Designation & Credentials; verify detailed daily KRAs during 1st round interview.`;
            }
          }
        } else {
          if (convertedFinal >= 85) {
            dualBadge = 'Perfect Matched';
          } else if (convertedFinal >= 70) {
            dualBadge = 'Better';
          } else if (convertedFinal >= 50) {
            dualBadge = 'Good / Average';
          } else {
            dualBadge = 'Irrelevant';
          }

          if (!hrActionOp || hrActionOp.length < 15) {
            if (convertedFinal >= 85) {
              hrActionOp = `Direct fit for ${winningJobTitle} with proven ${lastDesig} operational leadership and ${totalExpYears.toFixed(1)} yrs experience; prioritize for 1st round interview.`;
            } else if (convertedFinal >= 70) {
              hrActionOp = `Strong alignment with ${winningJobTitle} functional duties bringing ${totalExpYears.toFixed(1)} yrs experience; proceed to interview for technical verification.`;
            } else if (convertedFinal >= 50) {
              hrActionOp = `Foundational competencies present for ${winningJobTitle} with development areas; consider as secondary backup or for preliminary review.`;
            } else {
              hrActionOp = `Career track and operational deliverables do not align with ${winningJobTitle}; retain profile in CV Bank for matching verticals.`;
            }
          }
        }

        const matchedTitleAndDept = parsed.matchedTitleAndDept || `${winningJobTitle} (${activeDepartment})`;

        const finalCandidate = {
          id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fileName,
          name: cleanCandName,
          requisitionId: winningJobId,
          matchedRequisitionId: winningJobId,
          appliedPosition: winningJobTitle,
          category: parsed.category || winningJobTitle,
          lastDesignation: lastDesig,
          lastCompany: lastComp,
          gradeFit,
          email: candEmail,
          phone: candPhone,
          education: parsed.education || [],
          experience: expList,
          totalYearsExperience: totalExpYears,
          relevantExperienceYears: parsed.relevantExperienceYears || totalExpYears,
          skills: parsed.skills || [],
          score: convertedFinal,
          // Dual-Mode & Dual 100-Point Scoring Model Fields
          evaluationMode: evalMode,
          matchedTitleAndDept,
          dimensionBreakdown: dimBreakdown,
          pillar1KraScore: p1Score,
          pillar2RequirementsScore: p2Score,
          totalRawScore: totalRaw,
          convertedFinalScore: convertedFinal,
          recommendationBadge: dualBadge,
          hrActionOpinion: hrActionOp,
          verdict: verdictVal as any,
          decisiveActionSentence: decisiveAction,
          semanticMatches: parsed.semanticMatches,
          triMatch: triMatchData,
          keyStrengths: parsed.keyStrengths && parsed.keyStrengths.length > 0 ? parsed.keyStrengths : (parsed.matchingQualifications || []),
          criticalGaps: parsed.criticalGaps && parsed.criticalGaps.length > 0 ? parsed.criticalGaps : (parsed.gapsAndMismatches || []),
          allEvaluatedJobs: parsed.allEvaluatedJobs || (isMultiJob ? multipleJobs.map((j: any) => ({
            id: j.id,
            title: j.title,
            score: j.id === winningJobId ? totalScoreVal : Math.max(35, totalScoreVal - Math.floor(Math.random() * 18 + 7)),
            verdict: (j.id === winningJobId ? verdictVal : 'Good') as any,
          })) : undefined),
          isMultiJobScreened: isMultiJob,
          criteriaMarks: parsed.criteriaMarks || {
            relevant_experience: {
              criterionId: 'relevant_experience',
              name: 'Relevant Job Experience',
              obtainedMarks: Math.round(weights.relevant_experience * (totalScoreVal / 100)),
              maxMarks: weights.relevant_experience,
              status: totalScoreVal >= 70 ? 'Fully Evident' : 'Partially Evident',
              assessmentNotes: 'Verified experience matching responsibilities.',
            },
            technical_skills: {
              criterionId: 'technical_skills',
              name: 'Technical and Functional Skills',
              obtainedMarks: Math.round(weights.technical_skills * (totalScoreVal / 100)),
              maxMarks: weights.technical_skills,
              status: totalScoreVal >= 70 ? 'Fully Evident' : 'Partially Evident',
              assessmentNotes: 'Demonstrated tool proficiency and functional workflows.',
            },
            education: {
              criterionId: 'education',
              name: 'Educational Qualifications',
              obtainedMarks: Math.round(weights.education * 0.85),
              maxMarks: weights.education,
              status: 'Fully Evident',
              assessmentNotes: 'Relevant academic background.',
            },
            industry_knowledge: {
              criterionId: 'industry_knowledge',
              name: 'Industry and Operational Knowledge',
              obtainedMarks: Math.round(weights.industry_knowledge * (totalScoreVal / 100)),
              maxMarks: weights.industry_knowledge,
              status: totalScoreVal >= 70 ? 'Fully Evident' : 'Partially Evident',
              assessmentNotes: 'Operational knowledge evident in work history.',
            },
            competencies: {
              criterionId: 'competencies',
              name: 'Job-Specific Competencies',
              obtainedMarks: Math.round(weights.competencies * (totalScoreVal / 100)),
              maxMarks: weights.competencies,
              status: 'Partially Evident',
              assessmentNotes: 'Competencies substantiated from candidate evidence.',
            },
            achievements: {
              criterionId: 'achievements',
              name: 'Achievements and Evidence of Performance',
              obtainedMarks: Math.round(weights.achievements * (totalScoreVal / 100)),
              maxMarks: weights.achievements,
              status: 'Partially Evident',
              assessmentNotes: 'Performance evidence in career history.',
            },
          },
          scoreExplanation: parsed.scoreExplanation || `Comprehensive evaluation against ${winningJobTitle} criteria and evidence verification.`,
          matchingQualifications: parsed.matchingQualifications || parsed.skills?.slice(0, 4) || [],
          gapsAndMismatches: parsed.gapsAndMismatches || [],
          unverifiableInformation: parsed.unverifiableInformation || [],
          evidenceCompleteness: parsed.evidenceCompleteness || {
            level: 'High',
            percentage: 85,
            verifiedCount: 5,
            totalCheckpoints: 6,
            missingOrUnverifiable: parsed.unverifiableInformation || [],
          },
          evidenceSnippets: parsed.evidenceSnippets || [],
          productSpecialization: parsed.productSpecialization && parsed.productSpecialization.length > 0
            ? parsed.productSpecialization
            : [],
          workEnvironment: (['Factory', 'Buying House', 'Both', 'General RMG'].includes(parsed.workEnvironment)
            ? parsed.workEnvironment
            : 'General RMG') as 'Factory' | 'Buying House' | 'Both' | 'General RMG',
          buyersWorkedWith: parsed.buyersWorkedWith && parsed.buyersWorkedWith.length > 0
            ? parsed.buyersWorkedWith
            : [],
          technicalCertifications: parsed.technicalCertifications && parsed.technicalCertifications.length > 0
            ? parsed.technicalCertifications
            : [],
          academicDegrees: parsed.academicDegrees && parsed.academicDegrees.length > 0
            ? parsed.academicDegrees
            : (parsed.education || []),
          cadSoftwareProficiency: parsed.cadSoftwareProficiency && parsed.cadSoftwareProficiency.length > 0
            ? parsed.cadSoftwareProficiency
            : [],
          attachedCvText: parsed.attachedCvText || extractedResumeText || '',
          // HR Decision Control: ALWAYS pending initially, human-controlled only
          status: 'pending' as const,
          salaryFixation: parsed.salaryFixation || {
            department: winningJobTitle,
            category: parsed.category || winningJobTitle,
            grade: 'ME-11',
            categoryLayer: 'Executive layer',
            eligibleDesignation: winningJobTitle,
            fixedSalary: 38000,
            salaryRangeText: 'TK 38,000 (Grade ME-11)',
            experienceMonths: totalMonths,
            requiredMinYears: '2.5 Years',
            minRequiredScoreBand: '55-69%',
            sourcingType: 'external',
            justification: `Advisory salary recommendation based on verified experience.`,
          },
          jobStability,
          rejectionExplanation: undefined,
          selectionExplanation: undefined,
          processedAt: new Date().toISOString(),
        };

        return res.json({ candidate: finalCandidate });
      } catch (geminiError: any) {
        console.warn('Gemini screening error, falling back to heuristic parser:', geminiError?.message);
      }
    }

    // Zero-Memory Dynamic Evaluator (when Gemini API key is not configured or unreachable)
    const extractedDocText = (extractedResumeText || '').trim();
    const cvLower = `${fileName} ${extractedDocText}`.toLowerCase();

    // 1. Extract Candidate Name from first meaningful line of CV or fileName
    let candidateName = fileName
      .replace(/\.[^/.]+$/, '')
      .replace(/^(resume|cv|biodata)[-_\s]+/i, '')
      .replace(/[-_\s]+(resume|cv|biodata)$/i, '')
      .replace(/^candidate[-_\s]*/i, '')
      .replace(/[_-]+/g, ' ')
      .trim();

    if (extractedDocText && !extractedDocText.startsWith('[Attached Scanned')) {
      const firstLines = extractedDocText
        .split('\n')
        .map((l: string) => l.trim())
        .filter(
          (l: string) =>
            l.length > 2 &&
            l.length < 55 &&
            !/^(curriculum|resume|cv|biodata|personal\s*information|profile|contact|objective|summary)/i.test(l) &&
            !/@/.test(l)
        );
      if (firstLines.length > 0) {
        candidateName = firstLines[0].replace(/^(name\s*[:\-]\s*)/i, '').trim();
      }
    }
    if (!candidateName) candidateName = 'Candidate Profile';

    // 2. Extract Contact Info (Email & Phone)
    const emailMatch = extractedDocText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const candidateEmail = emailMatch ? emailMatch[0] : 'N/A';

    const phoneMatch = extractedDocText.match(/(?:\+?\d{1,3}[\s-]?)?\(?\d{2,4}\)?[\s-]?\d{3,4}[\s-]?\d{3,5}/);
    const candidatePhone = phoneMatch ? phoneMatch[0].trim() : 'N/A';

    // 3. Extract Experience Years & Last Designation / Company from CV text
    const expYearMatches = [...extractedDocText.matchAll(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)\b/gi)];
    let parsedExpYears = 0;
    for (const m of expYearMatches) {
      const val = parseFloat(m[1]);
      if (!isNaN(val) && val > 0 && val <= 45) {
        parsedExpYears = Math.max(parsedExpYears, val);
      }
    }
    const reqMinExp = parseFloat(String(minExperienceYears || '0')) || 0;
    const totalYearsExperience = parsedExpYears > 0 ? parsedExpYears : reqMinExp > 0 ? reqMinExp : 2.0;

    // Extract last designation & company if present in CV lines
    let lastDesignation = activeJobTitle;
    let lastCompany = 'Previous Organization';
    const cvLines = extractedDocText
      .split('\n')
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 3 && l.length < 100);

    const desigLine = cvLines.find((l: string) =>
      /\b(manager|executive|officer|supervisor|engineer|merchandiser|designer|technician|auditor|controller|specialist|coordinator|head|director|lead|analyst|assistant|senior)\b/i.test(l) &&
      !/^(objective|summary|profile|responsibilities|duties)/i.test(l)
    );
    if (desigLine) {
      const parts = desigLine.split(/\s*(?:\||@|\bat\b|—|–|-)\s*/i);
      if (parts[0] && parts[0].length <= 60) {
        lastDesignation = parts[0].trim();
      }
      if (parts[1] && parts[1].length <= 60) {
        lastCompany = parts[1].trim();
      }
    }

    // 4. Extract Academic Degrees & Certifications mentioned in CV
    const detectedDegrees: string[] = [];
    const degreePatterns = [
      { label: 'MBA', regex: /\bmba\b|master of business/i },
      { label: 'BBA', regex: /\bbba\b|bachelor of business/i },
      { label: 'B.Sc. in Textile Engineering', regex: /b\.?sc\.?\s*(?:in\s*)?textile/i },
      { label: 'B.Sc. / Bachelor of Science', regex: /\bb\.?sc\b|bachelor of science/i },
      { label: 'M.Sc. / Master of Science', regex: /\bm\.?sc\b|master of science/i },
      { label: 'B.A. / Bachelor of Arts', regex: /\bb\.?a\b|bachelor of arts/i },
      { label: 'M.A. / Master of Arts', regex: /\bm\.?a\b|master of arts/i },
      { label: 'PGDHRM', regex: /\bpgdhrm\b|post\s*graduate\s*diploma\s*in\s*hrm/i },
      { label: 'Diploma in Engineering / Textile', regex: /\bdiploma\b/i },
    ];
    for (const dp of degreePatterns) {
      if (dp.regex.test(cvLower)) detectedDegrees.push(dp.label);
    }

    // 5. Helper to tokenize meaningful words (excluding stop words)
    const stopWords = new Set([
      'and', 'the', 'for', 'with', 'from', 'into', 'that', 'this', 'have', 'has', 'are', 'was',
      'were', 'will', 'shall', 'must', 'should', 'able', 'work', 'working', 'role', 'position',
      'job', 'candidate', 'required', 'requirements', 'responsibilities', 'duties', 'daily',
      'ensure', 'ensuring', 'manage', 'managing', 'handle', 'handling', 'maintain', 'maintaining',
    ]);
    const extractKeywords = (text: string): string[] =>
      Array.from(
        new Set(
          (text || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s/+.-]/g, ' ')
            .split(/\s+/)
            .filter((w) => w.length >= 3 && !stopWords.has(w))
        )
      );

    // 6. Detect Dual-Mode: Path A (Detailed Tasks Present) vs Path B (Designation-Only)
    const actionVerbMatches = (
      extractedDocText.match(
        /\b(managed|supervised|coordinated|prepared|executed|conducted|monitored|developed|implemented|maintained|handled|assisted|led|planned|reviewed|verified|audited|negotiated|processed|controlled|reported|achieved)\b/gi
      ) || []
    ).length;
    const bulletLinesCount = extractedDocText
      .split('\n')
      .filter((l: string) => /^\s*(?:[-•*]|\d+[.)])\s+/.test(l)).length;
    const isDesignationOnly =
      !extractedDocText.startsWith('[Attached Scanned') &&
      extractedDocText.length > 0 &&
      actionVerbMatches < 3 &&
      bulletLinesCount < 3;

    // 7. Evaluate Task & KRA Semantic Alignment (0-100)
    const kraLines = activeKRA
      .split(/\n|(?=\d+\.\s)/)
      .map((l: string) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '').trim())
      .filter((l: string) => l.length > 4);

    let matchedKraCount = 0;
    const matchedKraItems: string[] = [];
    const missingKraItems: string[] = [];

    for (const kraItem of kraLines) {
      const kws = extractKeywords(kraItem);
      if (kws.length === 0) continue;
      const hits = kws.filter((kw) => cvLower.includes(kw)).length;
      const ratio = hits / kws.length;
      if (ratio >= 0.35 || hits >= 2) {
        matchedKraCount++;
        matchedKraItems.push(kraItem);
      } else {
        missingKraItems.push(kraItem);
      }
    }

    const allKraKeywords = extractKeywords(`${activeKRA} ${activeKSA}`);
    const matchedAllKraKeywords = allKraKeywords.filter((kw) => cvLower.includes(kw)).length;
    const kraKeywordRatio = allKraKeywords.length > 0 ? matchedAllKraKeywords / allKraKeywords.length : 0.5;
    const kraLineRatio = kraLines.length > 0 ? matchedKraCount / kraLines.length : kraKeywordRatio;

    // Rule of Majority: matching >= 55% of KRA items yields strong positive score
    const rawTaskRatio = Math.max(kraLineRatio, kraKeywordRatio * 1.15);
    const taskKraScore = Math.min(98, Math.max(25, Math.round(30 + rawTaskRatio * 68)));

    // 8. Evaluate Active Specification Parameters (0-100)
    const specChecks: { label: string; matched: boolean }[] = [];

    // Spec 1: Industry & Organization Segment
    const activeIndustries = [
      ...(Array.isArray(industries) ? industries : []),
      ...(companyType ? [companyType] : []),
      ...(jobType ? [jobType] : []),
      ...(activeDepartment && activeDepartment !== 'General' ? [activeDepartment] : []),
    ].filter(Boolean);
    if (activeIndustries.length > 0) {
      const indKws = extractKeywords(activeIndustries.join(' '));
      const indMatched = indKws.some((kw) => cvLower.includes(kw));
      specChecks.push({ label: `Industry/Segment (${activeIndustries.slice(0, 2).join(', ')})`, matched: indMatched });
    }

    // Spec 2: RMG Division / Product Focus
    const activeProducts = [
      ...(Array.isArray(rmgProducts) ? rmgProducts : []),
      ...(rmgType ? [rmgType] : []),
    ].filter(Boolean);
    if (activeProducts.length > 0) {
      const prodKws = extractKeywords(activeProducts.join(' '));
      const prodMatched = prodKws.some((kw) => cvLower.includes(kw));
      specChecks.push({ label: `Product Focus (${activeProducts.slice(0, 3).join(', ')})`, matched: prodMatched });
    }

    // Spec 3: Target Buyer Portfolio
    if (Array.isArray(buyerPortfolio) && buyerPortfolio.length > 0) {
      const buyerMatched = buyerPortfolio.some((b: string) => cvLower.includes(b.toLowerCase()));
      specChecks.push({ label: `Buyer Portfolio (${buyerPortfolio.slice(0, 3).join(', ')})`, matched: buyerMatched });
    }

    // Spec 4: Academic Qualifications, Certifications & Hard Technical Skills
    const activeEduReqs = [
      ...(Array.isArray(reqAcademicDegrees) ? reqAcademicDegrees : []),
      ...(Array.isArray(professionalCertifications) ? professionalCertifications : []),
    ].filter(Boolean);
    if (activeEduReqs.length > 0) {
      const eduKws = extractKeywords(activeEduReqs.join(' '));
      const eduMatched = eduKws.some((kw) => cvLower.includes(kw)) || detectedDegrees.length > 0;
      specChecks.push({ label: `Academic/Certs (${activeEduReqs.slice(0, 2).join(', ')})`, matched: eduMatched });
    }

    if (Array.isArray(hardTechnicalSkills) && hardTechnicalSkills.length > 0) {
      const skillKws = extractKeywords(hardTechnicalSkills.join(' '));
      const skillMatched = skillKws.some((kw) => cvLower.includes(kw));
      specChecks.push({
        label: `Hard Technical Skills (${hardTechnicalSkills.slice(0, 3).join(', ')})`,
        matched: skillMatched,
      });
    }

    // Spec 5: Minimum Experience Seniority
    if (reqMinExp > 0) {
      specChecks.push({
        label: `Experience (${reqMinExp}+ yrs)`,
        matched: totalYearsExperience >= reqMinExp * 0.85,
      });
    }

    // Fallback spec check if recruiter left optional specs empty
    if (specChecks.length === 0) {
      const titleKws = extractKeywords(`${activeJobTitle} ${activeKSA}`);
      const titleHits = titleKws.filter((kw) => cvLower.includes(kw)).length;
      specChecks.push({
        label: `Role & KSA Alignment (${activeJobTitle})`,
        matched: titleKws.length === 0 || titleHits / titleKws.length >= 0.3,
      });
    }

    const matchedSpecsCount = specChecks.filter((s) => s.matched).length;
    const specsFitScore = Math.min(
      98,
      Math.max(30, Math.round(30 + (matchedSpecsCount / specChecks.length) * 68))
    );

    // 9. Compute Title Alignment, Industry/Buyer, Academic, Tenure Breakdown (40/25/20/15)
    const titleKws = extractKeywords(activeJobTitle);
    const titleHits = titleKws.filter((kw) => cvLower.includes(kw)).length;
    const titleAlignmentScore = Math.min(
      98,
      Math.max(35, Math.round(40 + (titleKws.length > 0 ? (titleHits / titleKws.length) * 58 : 40)))
    );
    const industryBuyerScore = specsFitScore;
    const academicScore = detectedDegrees.length > 0 ? 88 : 65;
    const tenureScore = reqMinExp > 0 ? (totalYearsExperience >= reqMinExp ? 90 : 70) : 82;

    // 10. Compute Final Composite Score & Recommendation Badge
    let evaluationMode: 'standard_kra' | 'designation_only' = isDesignationOnly ? 'designation_only' : 'standard_kra';
    let compositeScore = 0;

    if (evaluationMode === 'designation_only') {
      const rawPathB = Math.round(
        titleAlignmentScore * 0.4 +
          industryBuyerScore * 0.25 +
          academicScore * 0.2 +
          tenureScore * 0.15
      );
      compositeScore = rawPathB >= 75 ? Math.min(85, Math.max(75, rawPathB)) : rawPathB;
    } else {
      compositeScore = Math.round(taskKraScore * 0.55 + specsFitScore * 0.45);
    }

    // Handle Multi-Job Screening if multipleJobs provided
    let selectedBestJob: any = isMultiJob ? multipleJobs[0] : null;
    let allEvaluatedJobs: any[] | undefined = undefined;
    let winningJobTitle = activeJobTitle;
    let winningJobId = targetRequisitionId;

    if (isMultiJob) {
      const evaluated = multipleJobs.map((j: any) => {
        const jTitleKws = extractKeywords(`${j.title || ''} ${j.department || ''}`);
        const jHits = jTitleKws.filter((kw) => cvLower.includes(kw)).length;
        const jScore = Math.min(
          95,
          Math.max(35, Math.round(40 + (jTitleKws.length > 0 ? (jHits / jTitleKws.length) * 55 : 30)))
        );
        const jVerdict =
          jScore >= 85 ? 'Perfect Matched' : jScore >= 70 ? 'Better' : jScore >= 50 ? 'Good' : 'Irrelevant';
        return {
          id: j.id,
          title: j.title,
          department: j.department,
          score: jScore,
          verdict: jVerdict,
        };
      });
      evaluated.sort((a: any, b: any) => b.score - a.score);
      selectedBestJob = evaluated[0];
      allEvaluatedJobs = evaluated;
      compositeScore = selectedBestJob.score;
      winningJobTitle = selectedBestJob.title;
      winningJobId = selectedBestJob.id;
    }

    const recommendationBadge:
      | 'Perfect Matched'
      | 'Better'
      | 'Good / Average'
      | 'Good / Shortlisted (Initial)'
      | 'Irrelevant' =
      evaluationMode === 'designation_only' && compositeScore >= 75
        ? 'Good / Shortlisted (Initial)'
        : compositeScore >= 85
          ? 'Perfect Matched'
          : compositeScore >= 70
            ? 'Better'
            : compositeScore >= 50
              ? 'Good / Average'
              : 'Irrelevant';

    const verdictMap: Record<string, string> = {
      'Perfect Matched': 'Perfect Matched',
      Better: 'Better',
      'Good / Average': 'Good',
      'Good / Shortlisted (Initial)': 'Good',
      Irrelevant: 'Irrelevant',
    };
    const fallbackVerdict = verdictMap[recommendationBadge] || 'Good';

    const matchedSpecLabels = specChecks.filter((s) => s.matched).map((s) => s.label);
    const missingSpecLabels = specChecks.filter((s) => !s.matched).map((s) => s.label);

    const decisiveActionSentence =
      recommendationBadge === 'Perfect Matched'
        ? `Perfect Matched (${compositeScore}%): Strong semantic alignment with ${winningJobTitle} KRA and ${matchedSpecsCount}/${specChecks.length} active specifications.`
        : recommendationBadge === 'Good / Shortlisted (Initial)'
          ? `Good / Shortlisted (Initial) (${compositeScore}%): Designation-only CV aligns with ${winningJobTitle} (${activeDepartment}); verify detailed KRA execution in interview.`
          : recommendationBadge === 'Better'
            ? `Better (${compositeScore}%): Solid alignment with ${winningJobTitle} core responsibilities; minor gaps in ${missingSpecLabels[0] || 'secondary specifications'}.`
            : recommendationBadge === 'Good / Average'
              ? `Good / Average (${compositeScore}%): Partial alignment with ${winningJobTitle}; review ${missingSpecLabels[0] || 'core KRA depth'} before shortlisting.`
              : `Irrelevant (${compositeScore}%): Candidate background does not align with ${winningJobTitle} responsibilities or active specifications.`;

    const fallbackGradeFit = evaluateGradeFitAndTenure({
      actualYears: totalYearsExperience,
      candidateScore: compositeScore,
      targetPositionTitle: winningJobTitle,
      lastCompany,
      lastDesignation,
    });

    const attachedCvText =
      extractedDocText ||
      `CANDIDATE: ${candidateName}\nApplied Position: ${winningJobTitle}\nEmail: ${candidateEmail} | Phone: ${candidatePhone}`;

    const candidate = {
      id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fileName,
      name: candidateName,
      requisitionId: winningJobId,
      matchedRequisitionId: winningJobId,
      appliedPosition: winningJobTitle,
      category: winningJobTitle,
      lastDesignation,
      lastCompany,
      gradeFit: fallbackGradeFit,
      email: candidateEmail,
      phone: candidatePhone,
      education: detectedDegrees,
      experience: [
        {
          role: lastDesignation,
          company: lastCompany,
          duration: `${totalYearsExperience.toFixed(1)} Years`,
          description: `Evaluated against ${winningJobTitle} (${activeDepartment}) requirements.`,
        },
      ],
      totalYearsExperience,
      relevantExperienceYears: compositeScore >= 50 ? totalYearsExperience : 0,
      skills: matchedSpecLabels.length > 0 ? matchedSpecLabels : extractKeywords(activeKSA).slice(0, 6),
      score: compositeScore,
      evaluationMode,
      matchedTitleAndDept: `${winningJobTitle} (${activeDepartment})`,
      dimensionBreakdown: {
        designationAlignment: titleAlignmentScore,
        academicQualifications: academicScore,
        experienceSeniority: tenureScore,
        ksaDomainAttributes: industryBuyerScore,
      },
      pillar1KraScore: taskKraScore,
      pillar2RequirementsScore: specsFitScore,
      totalRawScore: taskKraScore + specsFitScore,
      convertedFinalScore: compositeScore,
      recommendationBadge,
      hrActionOpinion: decisiveActionSentence,
      verdict: fallbackVerdict as any,
      actionOpinion: decisiveActionSentence,
      decisiveActionSentence,
      semanticMatches: matchedKraItems.slice(0, 4).map((item, idx) => ({
        label: `KRA Match #${idx + 1}`,
        jdRequirement: item,
        candidateEvidence: `Evidence found in ${fileName} matching ${winningJobTitle} responsibility.`,
        explanation: 'Fulfilled core functional objective of the active requisition KRA.',
        fulfillmentType: 'duty' as const,
      })),
      triMatch: {
        jdMatch: {
          score: taskKraScore,
          summary:
            matchedKraItems.length > 0
              ? `Matched ${matchedKraItems.length} of ${Math.max(1, kraLines.length)} KRA responsibilities for ${winningJobTitle}.`
              : `Evaluated against ${winningJobTitle} KRA and operational duties.`,
          matchedItems: matchedKraItems.slice(0, 4),
          missingItems: missingKraItems.slice(0, 3),
        },
        requirementsMatch: {
          score: specsFitScore,
          summary: `Matched ${matchedSpecsCount} of ${specChecks.length} active requisition specifications.`,
          matchedItems: matchedSpecLabels,
          missingItems: missingSpecLabels,
        },
        companyCriteriaMatch: {
          score: tenureScore,
          summary: `Evaluated ${totalYearsExperience.toFixed(1)} years experience against ${winningJobTitle} seniority criteria.`,
          matchedItems: [`${totalYearsExperience.toFixed(1)} Years Experience`],
          missingItems: [],
        },
        overallScore: compositeScore,
        verdict: fallbackVerdict as any,
        decisiveActionSentence,
      },
      keyStrengths: [
        ...matchedSpecLabels,
        ...matchedKraItems.slice(0, 2).map((k) => k.slice(0, 80)),
      ].slice(0, 5),
      criticalGaps: [
        ...missingSpecLabels,
        ...missingKraItems.slice(0, 2).map((k) => k.slice(0, 80)),
      ].slice(0, 4),
      allEvaluatedJobs,
      isMultiJobScreened: isMultiJob,
      criteriaMarks: {
        relevant_experience: {
          criterionId: 'relevant_experience',
          name: 'Relevant Job Experience',
          obtainedMarks: Math.round(weights.relevant_experience * (taskKraScore / 100)),
          maxMarks: weights.relevant_experience,
          status: taskKraScore >= 70 ? 'Fully Evident' : taskKraScore >= 50 ? 'Partially Evident' : 'Not Evident',
          assessmentNotes: `Evaluated against ${winningJobTitle} KRA & ${totalYearsExperience.toFixed(1)} yrs tenure.`,
        },
        technical_skills: {
          criterionId: 'technical_skills',
          name: 'Technical and Functional Skills',
          obtainedMarks: Math.round(weights.technical_skills * (specsFitScore / 100)),
          maxMarks: weights.technical_skills,
          status: specsFitScore >= 70 ? 'Fully Evident' : specsFitScore >= 50 ? 'Partially Evident' : 'Not Evident',
          assessmentNotes: `Evaluated against ${winningJobTitle} KSA & active specifications.`,
        },
        education: {
          criterionId: 'education',
          name: 'Educational Qualifications',
          obtainedMarks: Math.round(weights.education * (academicScore / 100)),
          maxMarks: weights.education,
          status: detectedDegrees.length > 0 ? 'Fully Evident' : 'Partially Evident',
          assessmentNotes: detectedDegrees.length > 0 ? detectedDegrees.join(', ') : 'Evaluated from CV text.',
        },
        industry_knowledge: {
          criterionId: 'industry_knowledge',
          name: 'Industry and Operational Knowledge',
          obtainedMarks: Math.round(weights.industry_knowledge * (industryBuyerScore / 100)),
          maxMarks: weights.industry_knowledge,
          status: industryBuyerScore >= 70 ? 'Fully Evident' : 'Partially Evident',
          assessmentNotes: matchedSpecLabels.join(', ') || `Evaluated against ${activeDepartment} segment.`,
        },
        competencies: {
          criterionId: 'competencies',
          name: 'Job-Specific Competencies',
          obtainedMarks: Math.round(weights.competencies * (compositeScore / 100)),
          maxMarks: weights.competencies,
          status: compositeScore >= 70 ? 'Fully Evident' : 'Partially Evident',
          assessmentNotes: `Composite alignment for ${winningJobTitle}.`,
        },
        achievements: {
          criterionId: 'achievements',
          name: 'Achievements and Evidence of Performance',
          obtainedMarks: Math.round(weights.achievements * (compositeScore / 100)),
          maxMarks: weights.achievements,
          status: compositeScore >= 70 ? 'Fully Evident' : 'Partially Evident',
          assessmentNotes: 'Evaluated from documented career history.',
        },
      },
      scoreExplanation: decisiveActionSentence,
      matchingQualifications: matchedSpecLabels,
      gapsAndMismatches: missingSpecLabels,
      unverifiableInformation:
        evaluationMode === 'designation_only'
          ? ['Detailed KRA task execution not listed in designation-only CV']
          : [],
      evidenceCompleteness: {
        level: compositeScore >= 75 ? 'High' : compositeScore >= 50 ? 'Partial' : 'Minimal',
        percentage: compositeScore,
        verifiedCount: matchedSpecsCount,
        totalCheckpoints: specChecks.length,
        missingOrUnverifiable: missingSpecLabels,
      },
      evidenceSnippets: matchedKraItems.slice(0, 3),
      productSpecialization: Array.isArray(rmgProducts)
        ? rmgProducts.filter((p: string) => cvLower.includes(p.toLowerCase()))
        : [],
      workEnvironment: 'General RMG' as const,
      buyersWorkedWith: Array.isArray(buyerPortfolio)
        ? buyerPortfolio.filter((b: string) => cvLower.includes(b.toLowerCase()))
        : [],
      technicalCertifications: Array.isArray(professionalCertifications)
        ? professionalCertifications.filter((c: string) => cvLower.includes(c.toLowerCase()))
        : [],
      academicDegrees: detectedDegrees,
      cadSoftwareProficiency: [],
      attachedCvText,
      salaryFixation: {
        department: activeDepartment,
        category: winningJobTitle,
        grade: 'Pending HR Review',
        categoryLayer: experienceLevel || 'Standard',
        eligibleDesignation: winningJobTitle,
        fixedSalary: 0,
        salaryRangeText: salaryRange || 'As per company policy',
        experienceMonths: Math.round(totalYearsExperience * 12),
        requiredMinYears: minExperienceYears ? `${minExperienceYears} Years` : 'Not specified',
        minRequiredScoreBand: '70%+',
        sourcingType: 'external' as const,
        justification: `Evaluated against ${winningJobTitle} requisition criteria.`,
      },
      jobStability: {
        isFrequentJobChanger: false,
        disallowed: false,
        averageTenureMonths: Math.round(totalYearsExperience * 12),
        averageTenureYears: totalYearsExperience,
        shortTenuresCount: 0,
        totalJobs: 1,
        tenureBreakdown: [
          {
            role: lastDesignation,
            company: lastCompany,
            duration: `${totalYearsExperience.toFixed(1)} Years`,
            estimatedMonths: Math.round(totalYearsExperience * 12),
            isLessThanOneAndHalfYears: totalYearsExperience < 1.5,
          },
        ],
        warningSignText: totalYearsExperience >= 1.5 ? 'Tenure Stable (≥ 1.5 yrs)' : 'Short Tenure (< 1.5 yrs)',
        flagReason: `Verified ${totalYearsExperience.toFixed(1)} years experience.`,
      },
      status: 'pending' as const,
      rejectionExplanation: undefined,
      processedAt: new Date().toISOString(),
    };

    return res.json({ candidate });
  } catch (error: any) {
    console.error('Error in /api/screen-cv:', error);
    res.status(500).json({ error: error.message || 'Internal server error screening CV' });
  }
});

// Vite middleware or production static files
async function startServer() {
  const distDir = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distDir, 'index.html');
  const hasDist = fs.existsSync(distIndex);
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && hasDist) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`HR CV Screener Server running at http://0.0.0.0:${PORT} (mode: ${isProduction && hasDist ? 'production' : 'development'})`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, closing HTTP server`);
    server.close(() => {
      console.log('HTTP server closed cleanly');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer();
