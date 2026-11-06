/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// In-memory cache of Blob URLs for candidate files during the active browser session
const fileUrlMap = new Map<string, string>();

export function cacheCandidateFileBlob(candidateId: string, blob: Blob | File): string {
  const url = URL.createObjectURL(blob);
  fileUrlMap.set(candidateId, url);
  return url;
}

export function resolveCandidateFileUrl(candidate: {
  id?: string;
  fileUrl?: string;
  blobUrl?: string;
  fileBase64?: string;
  fileMimeType?: string;
  attachedCvText?: string;
  name?: string;
}): string {
  if (candidate.id && fileUrlMap.has(candidate.id)) {
    const existing = fileUrlMap.get(candidate.id)!;
    if (existing) return existing;
  }

  if (candidate.fileUrl && candidate.fileUrl.startsWith('blob:')) {
    if (candidate.id) fileUrlMap.set(candidate.id, candidate.fileUrl);
    return candidate.fileUrl;
  }

  if (candidate.blobUrl && candidate.blobUrl.startsWith('blob:')) {
    if (candidate.id) fileUrlMap.set(candidate.id, candidate.blobUrl);
    return candidate.blobUrl;
  }

  if (candidate.fileBase64) {
    try {
      const clean = candidate.fileBase64.includes(';base64,')
        ? candidate.fileBase64.split(';base64,')[1]
        : candidate.fileBase64;
      const mime = candidate.fileMimeType || 'application/pdf';
      const byteCharacters = atob(clean);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const url = URL.createObjectURL(blob);
      if (candidate.id) fileUrlMap.set(candidate.id, url);
      return url;
    } catch (e) {
      console.warn('Error reconstructing blob from base64:', e);
    }
  }

  // Fallback text document blob if binary is unavailable
  const textContent = candidate.attachedCvText || `Candidate Resume: ${candidate.name || 'Candidate'}`;
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  if (candidate.id) fileUrlMap.set(candidate.id, url);
  return url;
}
