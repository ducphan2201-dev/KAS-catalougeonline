/**
 * KAS Catalogue — Google Drive Service
 * Fetches projects, images, and info from Google Drive
 */
const DriveService = (() => {
  const API_BASE = 'https://www.googleapis.com/drive/v3/files';
  let cachedProjects = null;

  /**
   * Get all projects (folders) from root folder
   */
  async function getProjects() {
    if (cachedProjects) return cachedProjects;

    if (CONFIG.DEMO_MODE || !CONFIG.GOOGLE_DRIVE.apiKey || !CONFIG.GOOGLE_DRIVE.rootFolderId) {
      cachedProjects = DEMO_PROJECTS;
      return cachedProjects;
    }

    try {
      const folders = await fetchFolders(CONFIG.GOOGLE_DRIVE.rootFolderId);
      const projects = await Promise.all(
        folders.map(async (folder) => {
          const [images, info] = await Promise.all([
            fetchImages(folder.id),
            fetchInfoFile(folder.id),
          ]);

          return {
            id: folder.id,
            name: info?.name || folder.name.replace(/^\d+-/, '').replace(/-/g, ' '),
            category: info?.category || 'villa',
            address: info?.address || '',
            area: info?.area || '',
            style: info?.style || '',
            year: info?.year || '',
            description: info?.description || '',
            coverImage: images.length > 0 ? images[0].url : '',
            images: images.map(img => img.url),
          };
        })
      );

      cachedProjects = projects;
      return projects;
    } catch (error) {
      console.error('Error fetching from Google Drive:', error);
      // Fallback to demo data
      cachedProjects = DEMO_PROJECTS;
      return cachedProjects;
    }
  }

  /**
   * Fetch subfolders from a parent folder
   */
  async function fetchFolders(parentId) {
    const query = encodeURIComponent(`'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`);
    const url = `${API_BASE}?q=${query}&key=${CONFIG.GOOGLE_DRIVE.apiKey}&fields=files(id,name)&orderBy=name`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
    const data = await res.json();
    return data.files || [];
  }

  /**
   * Fetch images from a folder
   */
  async function fetchImages(folderId) {
    const query = encodeURIComponent(`'${folderId}' in parents and mimeType contains 'image/' and trashed=false`);
    const url = `${API_BASE}?q=${query}&key=${CONFIG.GOOGLE_DRIVE.apiKey}&fields=files(id,name,thumbnailLink)&orderBy=name&pageSize=20`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drive API error: ${res.status}`);
    const data = await res.json();

    return (data.files || []).map(file => ({
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/thumbnail?id=${file.id}&sz=w1920`,
      thumb: `https://drive.google.com/thumbnail?id=${file.id}&sz=w400`,
    }));
  }

  /**
   * Fetch and parse info.txt from a folder
   */
  async function fetchInfoFile(folderId) {
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and name='info.txt' and trashed=false`);
      const url = `${API_BASE}?q=${query}&key=${CONFIG.GOOGLE_DRIVE.apiKey}&fields=files(id)`;

      const res = await fetch(url);
      const data = await res.json();

      if (!data.files || data.files.length === 0) return null;

      const fileUrl = `${API_BASE}/${data.files[0].id}?alt=media&key=${CONFIG.GOOGLE_DRIVE.apiKey}`;
      const textRes = await fetch(fileUrl);
      const text = await textRes.text();

      return parseInfoText(text);
    } catch {
      return null;
    }
  }

  /**
   * Parse info.txt content into an object
   * Expected format:
   * Tên dự án: Villa Thảo Điền
   * Địa chỉ: Quận 2, TP.HCM
   * Diện tích: 500m²
   * Phong cách: Modern Luxury
   * Danh mục: villa
   * Năm hoàn thành: 2025
   * Mô tả: Description text...
   */
  function parseInfoText(text) {
    const info = {};
    const fieldMap = {
      'tên dự án': 'name',
      'ten du an': 'name',
      'địa chỉ': 'address',
      'dia chi': 'address',
      'diện tích': 'area',
      'dien tich': 'area',
      'phong cách': 'style',
      'phong cach': 'style',
      'danh mục': 'category',
      'danh muc': 'category',
      'năm hoàn thành': 'year',
      'nam hoan thanh': 'year',
      'mô tả': 'description',
      'mo ta': 'description',
    };

    const lines = text.split('\n');
    for (const line of lines) {
      const colonIdx = line.indexOf(':');
      if (colonIdx === -1) continue;

      const rawKey = line.substring(0, colonIdx).trim().toLowerCase();
      const value = line.substring(colonIdx + 1).trim();

      const key = fieldMap[rawKey];
      if (key) {
        info[key] = value;
      }
    }

    return Object.keys(info).length > 0 ? info : null;
  }

  /**
   * Clear cache to force re-fetch
   */
  function clearCache() {
    cachedProjects = null;
  }

  return {
    getProjects,
    clearCache,
  };
})();
