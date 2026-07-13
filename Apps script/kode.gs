const SHEET_NAME = 'Projects';
const VISITORS_SHEET = 'Visitors';
const CERT_SHEET = 'Certifications';

function doGet(e) {
  // API endpoints
  if (e && e.parameter) {
    if (e.parameter.api === 'true') return handleProjectsAPI();
    if (e.parameter.api === 'visitor') return handleVisitorAPI();
    if (e.parameter.api === 'certifications') return handleCertificationsAPI();
  }
  
  // Serve Dashboard HTML
  return HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('Admin Dashboard - IT Guy Portfolio')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// ═══════════════════════════════════════
// PROJECTS API
// ═══════════════════════════════════════
function handleProjectsAPI() {
  const sheet = getOrCreateSheet(SHEET_NAME, ['id', 'title', 'description', 'category', 'link', 'imageUrl']);
  const projects = sheetToArray(sheet);
  return jsonOutput(projects);
}

// ═══════════════════════════════════════
// CERTIFICATIONS API
// ═══════════════════════════════════════
function handleCertificationsAPI() {
  const sheet = getOrCreateSheet(CERT_SHEET, ['id', 'title', 'imageUrl']);
  const certs = sheetToArray(sheet);
  return jsonOutput(certs);
}

// ═══════════════════════════════════════
// VISITOR COUNTER API
// ═══════════════════════════════════════
function handleVisitorAPI() {
  const sheet = getOrCreateSheet(VISITORS_SHEET, ['count']);
  if (sheet.getLastRow() <= 1) {
    sheet.appendRow([1]);
    return jsonOutput({count: 1});
  }
  const current = sheet.getRange(2, 1).getValue() || 0;
  sheet.getRange(2, 1).setValue(current + 1);
  return jsonOutput({count: current + 1});
}

// ═══════════════════════════════════════
// DASHBOARD FUNCTIONS (called from Index.html)
// ═══════════════════════════════════════

// --- Projects ---
function addProjectFromDashboard(projectData) {
  const sheet = getOrCreateSheet(SHEET_NAME, ['id', 'title', 'description', 'category', 'link', 'imageUrl']);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  let finalImageUrl = projectData.imageUrl || 'img/project_fallback.png';
  
  if (projectData.imageFile && projectData.imageFile.data) {
    try {
      var decoded = Utilities.base64Decode(projectData.imageFile.data);
      var blob = Utilities.newBlob(decoded, projectData.imageFile.mimeType, projectData.imageFile.filename);
      var folderId = '1kFcx7RESh6ozX3rUf67opTWB_DOTsPhF';
      var folder = DriveApp.getFolderById(folderId);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      finalImageUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
    } catch(e) { Logger.log("Upload error: " + e); }
  }
  
  const id = new Date().getTime().toString();
  let row = new Array(headers.length).fill('');
  
  if(headers.indexOf('id') !== -1) row[headers.indexOf('id')] = id;
  if(headers.indexOf('title') !== -1) row[headers.indexOf('title')] = projectData.title;
  if(headers.indexOf('description') !== -1) row[headers.indexOf('description')] = projectData.description;
  if(headers.indexOf('category') !== -1) row[headers.indexOf('category')] = projectData.category;
  if(headers.indexOf('link') !== -1) row[headers.indexOf('link')] = projectData.link;
  if(headers.indexOf('imageUrl') !== -1) row[headers.indexOf('imageUrl')] = finalImageUrl;
  
  sheet.appendRow(row);
  return { success: true, message: 'Proyek berhasil ditambahkan!' };
}

function deleteProject(id) {
  return deleteRowById(SHEET_NAME, id);
}

function updateProjectFull(id, updatedData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return { success: false, message: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, message: 'Belum ada data!' };
  
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      if(headers.indexOf('title') !== -1 && updatedData.title) sheet.getRange(i + 1, headers.indexOf('title') + 1).setValue(updatedData.title);
      if(headers.indexOf('description') !== -1 && updatedData.description) sheet.getRange(i + 1, headers.indexOf('description') + 1).setValue(updatedData.description);
      if(headers.indexOf('category') !== -1 && updatedData.category) sheet.getRange(i + 1, headers.indexOf('category') + 1).setValue(updatedData.category);
      if(headers.indexOf('link') !== -1) sheet.getRange(i + 1, headers.indexOf('link') + 1).setValue(updatedData.link || '');
      
      // Handle image updates
      let finalImageUrl = updatedData.imageUrl || updatedData.existingImageUrl || 'img/project_fallback.png';
      
      if (updatedData.imageFile && updatedData.imageFile.data) {
        try {
          var decoded = Utilities.base64Decode(updatedData.imageFile.data);
          var blob = Utilities.newBlob(decoded, updatedData.imageFile.mimeType, updatedData.imageFile.filename);
          var folderId = '1kFcx7RESh6ozX3rUf67opTWB_DOTsPhF';
      var folder = DriveApp.getFolderById(folderId);
      var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          finalImageUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
        } catch(e) { Logger.log("Upload error: " + e); }
      }
      
      if(headers.indexOf('imageUrl') !== -1) sheet.getRange(i + 1, headers.indexOf('imageUrl') + 1).setValue(finalImageUrl);
      
      return { success: true, message: 'Proyek berhasil diupdate!' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan!' };
}

function getProjectsForDashboard() {
  const sheet = getOrCreateSheet(SHEET_NAME, ['id', 'title', 'description', 'category', 'link', 'imageUrl']);
  return sheetToArray(sheet);
}

// --- Visitor Stats ---
function getVisitorStats() {
  const sheet = getOrCreateSheet(VISITORS_SHEET, ['count']);
  if (sheet.getLastRow() <= 1) return { count: 0 };
  return { count: sheet.getRange(2, 1).getValue() || 0 };
}

  // === Certifications ===
function addCertificationFromDashboard(certData) {
  const sheet = getOrCreateSheet(CERT_SHEET, ['id', 'title', 'imageUrl']);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  let finalImageUrl = certData.imageUrl || 'img/project_fallback.png';
  if (certData.imageFile && certData.imageFile.data) {
    try {
      var decoded = Utilities.base64Decode(certData.imageFile.data);
      var blob = Utilities.newBlob(decoded, certData.imageFile.mimeType, certData.imageFile.filename);
      var folderId = '1kFcx7RESh6ozX3rUf67opTWB_DOTsPhF';
      var folder = DriveApp.getFolderById(folderId);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      finalImageUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
    } catch(e) { Logger.log("Upload error: " + e); }
  }
  
  const id = new Date().getTime().toString();
  let row = new Array(headers.length).fill('');
  
  if(headers.indexOf('id') !== -1) row[headers.indexOf('id')] = id;
  if(headers.indexOf('title') !== -1) row[headers.indexOf('title')] = certData.title;
  if(headers.indexOf('imageUrl') !== -1) row[headers.indexOf('imageUrl')] = finalImageUrl;
  
  sheet.appendRow(row);
  return { success: true, message: 'Sertifikat berhasil ditambahkan!' };
}

function getCertificationsForDashboard() {
  const sheet = getOrCreateSheet(CERT_SHEET, ['id', 'title', 'imageUrl']);
  return sheetToArray(sheet);
}

function deleteCertification(id) {
  return deleteRowById(CERT_SHEET, id);
}

function updateCertificationFull(id, updatedData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CERT_SHEET);
  if (!sheet) return { success: false, message: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, message: 'Belum ada data!' };
  
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      if(headers.indexOf('title') !== -1 && updatedData.title) sheet.getRange(i + 1, headers.indexOf('title') + 1).setValue(updatedData.title);
      
      let finalImageUrl = updatedData.imageUrl || updatedData.existingImageUrl || 'img/project_fallback.png';
      if (updatedData.imageFile && updatedData.imageFile.data) {
        try {
          var decoded = Utilities.base64Decode(updatedData.imageFile.data);
          var blob = Utilities.newBlob(decoded, updatedData.imageFile.mimeType, updatedData.imageFile.filename);
          var folderId = '1kFcx7RESh6ozX3rUf67opTWB_DOTsPhF';
      var folder = DriveApp.getFolderById(folderId);
      var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          finalImageUrl = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1000";
        } catch(e) { }
      }
      if(headers.indexOf('imageUrl') !== -1) sheet.getRange(i + 1, headers.indexOf('imageUrl') + 1).setValue(finalImageUrl);
      return { success: true, message: 'Sertifikat berhasil diupdate!' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan!' };
}

// ═══════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════
function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    enforceHeaders(sheet, headers);
  }
  return sheet;
}

function enforceHeaders(sheet, requiredHeaders) {
  let currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  let newHeaders = [...currentHeaders];
  let added = false;
  
  requiredHeaders.forEach(h => {
    if (newHeaders.indexOf(h) === -1) {
      newHeaders.push(h);
      added = true;
    }
  });
  
  if (added) {
    sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
    let catIdx = newHeaders.indexOf('category');
    let numRows = sheet.getLastRow();
    if(catIdx !== -1 && numRows > 1) {
      for(let i=2; i<=numRows; i++) {
         if(!sheet.getRange(i, catIdx + 1).getValue()) {
           sheet.getRange(i, catIdx + 1).setValue('UI/UX');
         }
      }
    }
  }
}

function sheetToArray(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const result = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const obj = {};
    for (let j = 0; j < headers.length; j++) { obj[headers[j]] = row[j]; }
    result.push(obj);
  }
  return result;
}

function deleteRowById(sheetName, id) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: 'Sheet not found' };
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Data berhasil dihapus!' };
    }
  }
  return { success: false, message: 'Data tidak ditemukan!' };
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
