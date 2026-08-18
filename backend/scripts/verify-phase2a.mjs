async function runPhase2ATests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('====================================================');
  console.log('  PHASE 2A/3 BACKEND FORENSIC ENGINE VERIFICATION');
  console.log('====================================================\n');

  let testPassed = 0;
  let totalTests = 6;
  let savedAnalysisId = '';

  // 1024x768 PNG image buffer
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR header length & chunk
    0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x03, 0x00, // Width: 1024, Height: 768
    0x08, 0x06, 0x00, 0x00, 0x00, 0xa1, 0x46, 0x0e, // Bit depth 8, color type 6, CRC
    0x71, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, // IDAT
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND EOF
    0x42, 0x60, 0x82
  ]);

  // 1. Valid Image Upload
  console.log('1. Testing POST /api/analyze (Valid PNG with Dimension Parsing)...');
  try {
    const blob = new Blob([validPngBuffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('media', blob, 'forensic_sample.png');

    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: formData });
    const data = await res.json();
    const forensics = data.preliminaryForensics || data;

    console.log(`Status: ${res.status}`);
    console.log('Response summary:', {
      analysisId: data.analysisId,
      filename: data.filename,
      mediaType: data.mediaType,
      fileHash: forensics.fileHash,
      dimensions: forensics.dimensions,
      status: data.status,
      indicatorsCount: forensics.forensicIndicators?.length,
    });

    if (
      res.status === 200 &&
      (data.status === 'completed_preliminary' || data.status === 'completed_preliminary_only' || data.status === 'completed') &&
      forensics.fileHash &&
      forensics.dimensions?.width === 1024 &&
      forensics.dimensions?.height === 768
    ) {
      savedAnalysisId = data.analysisId;
      console.log('✅ TEST 1 PASSED: Preliminary image forensics executed successfully.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 1 FAILED: Unexpected response structure.\n');
    }
  } catch (err) {
    console.error('❌ TEST 1 FAILED with exception:', err.message, '\n');
  }

  // 2. Video Upload (Not Yet Supported in Phase 2A/3)
  console.log('2. Testing POST /api/analyze (Video Upload -> not_yet_supported)...');
  try {
    const fakeMp4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]);
    const blob = new Blob([fakeMp4], { type: 'video/mp4' });
    const formData = new FormData();
    formData.append('media', blob, 'evidence_clip.mp4');

    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: formData });
    const data = await res.json();
    const forensics = data.preliminaryForensics || data;

    console.log(`Status: ${res.status}`);
    console.log('Response summary:', {
      analysisId: data.analysisId,
      mediaType: data.mediaType,
      status: data.status,
      fileHash: forensics.fileHash,
    });

    if (res.status === 200 && data.status === 'not_yet_supported' && forensics.fileHash) {
      console.log('✅ TEST 2 PASSED: Video correctly handled as not_yet_supported.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 2 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED with exception:', err.message, '\n');
  }

  // 3. Missing File Rejection
  console.log('3. Testing POST /api/analyze (Missing File)...');
  try {
    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST' });
    const data = await res.json();

    console.log(`Status: ${res.status}, Error Code: ${data.error?.code}`);
    if (res.status === 400 && data.error?.code === 'MISSING_FILE') {
      console.log('✅ TEST 3 PASSED: Missing file rejected with 400.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 3 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED with exception:', err.message, '\n');
  }

  // 4. Invalid File Format (.exe)
  console.log('4. Testing POST /api/analyze (Unsupported Format .exe)...');
  try {
    const fakeExe = Buffer.from('MZ executable binary');
    const blob = new Blob([fakeExe], { type: 'application/x-msdownload' });
    const formData = new FormData();
    formData.append('media', blob, 'malware.exe');

    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: formData });
    const data = await res.json();

    console.log(`Status: ${res.status}, Error Code: ${data.error?.code}`);
    if (res.status === 400 && data.error?.code === 'INVALID_FILE_TYPE') {
      console.log('✅ TEST 4 PASSED: Invalid file type rejected with 400.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 4 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED with exception:', err.message, '\n');
  }

  // 5. GET Existing Analysis by ID
  console.log(`5. Testing GET /api/analyze/:analysisId (ID: ${savedAnalysisId})...`);
  try {
    const res = await fetch(`${baseUrl}/analyze/${savedAnalysisId}`);
    const data = await res.json();
    const forensics = data.preliminaryForensics || data;

    console.log(`Status: ${res.status}`);
    console.log('Retrieved Analysis:', {
      analysisId: data.analysisId,
      filename: data.filename,
      status: data.status,
      fileHash: forensics.fileHash,
    });

    if (res.status === 200 && data.analysisId === savedAnalysisId && forensics.fileHash) {
      console.log('✅ TEST 5 PASSED: Existing analysis retrieved from in-memory store.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 5 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 5 FAILED with exception:', err.message, '\n');
  }

  // 6. GET Nonexistent Analysis ID
  console.log('6. Testing GET /api/analyze/nonexistent-id-12345...');
  try {
    const res = await fetch(`${baseUrl}/analyze/nonexistent-id-12345`);
    const data = await res.json();

    console.log(`Status: ${res.status}, Error Code: ${data.error?.code}`);
    if (res.status === 404 && data.error?.code === 'ANALYSIS_NOT_FOUND') {
      console.log('✅ TEST 6 PASSED: Nonexistent ID returned 404 Not Found.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 6 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 6 FAILED with exception:', err.message, '\n');
  }

  console.log('====================================================');
  console.log(`  VERIFICATION RESULTS: ${testPassed}/${totalTests} TESTS PASSED`);
  console.log('====================================================');
}

runPhase2ATests();
