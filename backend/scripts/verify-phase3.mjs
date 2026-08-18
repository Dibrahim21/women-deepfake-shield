async function runPhase3Tests() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('====================================================');
  console.log('  PHASE 3 AI DETECTION & COMBINED PIPELINE VERIFY');
  console.log('====================================================\n');

  let testPassed = 0;
  let totalTests = 5;
  let savedAnalysisId = '';

  // 1024x768 PNG image buffer
  const validPngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x03, 0x00, // Width: 1024, Height: 768
    0x08, 0x06, 0x00, 0x00, 0x00, 0xa1, 0x46, 0x0e,
    0x71, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, // IDAT
    0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
    0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, // IEND EOF
    0x42, 0x60, 0x82
  ]);

  // 1. Valid Image Upload (Combined Pipeline)
  console.log('1. Testing POST /api/analyze (Image -> Forensics + AI Detection)...');
  try {
    const blob = new Blob([validPngBuffer], { type: 'image/png' });
    const formData = new FormData();
    formData.append('media', blob, 'face_inspection.png');

    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: formData });
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log('Combined Response Structure:', {
      analysisId: data.analysisId,
      mediaType: data.mediaType,
      overallStatus: data.status,
      hasForensics: Boolean(data.preliminaryForensics),
      forensicStatus: data.preliminaryForensics?.status,
      fileHash: data.preliminaryForensics?.fileHash?.slice(0, 16) + '...',
      hasAiDetection: Boolean(data.aiDetection),
      aiProvider: data.aiDetection?.provider,
      aiModel: data.aiDetection?.modelName,
      aiStatus: data.aiDetection?.status,
      aiIsOperational: data.aiDetection?.isOperational,
    });

    if (
      res.status === 200 &&
      data.analysisId &&
      data.preliminaryForensics?.fileHash &&
      data.aiDetection?.provider &&
      data.aiDetection?.disclaimer
    ) {
      savedAnalysisId = data.analysisId;
      console.log('✅ TEST 1 PASSED: Combined pipeline executed with separated forensics & AI result.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 1 FAILED: Missing required fields in combined response.\n');
    }
  } catch (err) {
    console.error('❌ TEST 1 FAILED with exception:', err.message, '\n');
  }

  // 2. Video Upload (Unsupported in Phase 3 AI Vision)
  console.log('2. Testing POST /api/analyze (Video Upload -> unsupported media handling)...');
  try {
    const fakeMp4 = Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]);
    const blob = new Blob([fakeMp4], { type: 'video/mp4' });
    const formData = new FormData();
    formData.append('media', blob, 'video_stream.mp4');

    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: formData });
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log('Video Response:', {
      overallStatus: data.status,
      forensicStatus: data.preliminaryForensics?.status,
      aiStatus: data.aiDetection?.status,
    });

    if (
      res.status === 200 &&
      data.status === 'not_yet_supported' &&
      data.aiDetection?.status === 'unsupported_media'
    ) {
      console.log('✅ TEST 2 PASSED: Video properly handled across both forensics and AI layers.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 2 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 2 FAILED with exception:', err.message, '\n');
  }

  // 3. GET /api/analyze/:analysisId (Retrieval of Combined Record)
  console.log(`3. Testing GET /api/analyze/:analysisId (ID: ${savedAnalysisId})...`);
  try {
    const res = await fetch(`${baseUrl}/analyze/${savedAnalysisId}`);
    const data = await res.json();

    console.log(`Status: ${res.status}`);
    console.log('Retrieved Record:', {
      analysisId: data.analysisId,
      hasForensics: Boolean(data.preliminaryForensics),
      hasAiDetection: Boolean(data.aiDetection),
    });

    if (
      res.status === 200 &&
      data.analysisId === savedAnalysisId &&
      data.preliminaryForensics &&
      data.aiDetection
    ) {
      console.log('✅ TEST 3 PASSED: Full combined record retrieved from store.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 3 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 3 FAILED with exception:', err.message, '\n');
  }

  // 4. Missing File Rejection
  console.log('4. Testing POST /api/analyze (Missing File)...');
  try {
    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST' });
    const data = await res.json();

    console.log(`Status: ${res.status}, Error Code: ${data.error?.code}`);
    if (res.status === 400 && data.error?.code === 'MISSING_FILE') {
      console.log('✅ TEST 4 PASSED: Missing file rejected with 400.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 4 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 4 FAILED with exception:', err.message, '\n');
  }

  // 5. Invalid File Format (.exe)
  console.log('5. Testing POST /api/analyze (Unsupported Format .exe)...');
  try {
    const fakeExe = Buffer.from('MZ executable binary');
    const blob = new Blob([fakeExe], { type: 'application/x-msdownload' });
    const formData = new FormData();
    formData.append('media', blob, 'malware.exe');

    const res = await fetch(`${baseUrl}/analyze`, { method: 'POST', body: formData });
    const data = await res.json();

    console.log(`Status: ${res.status}, Error Code: ${data.error?.code}`);
    if (res.status === 400 && data.error?.code === 'INVALID_FILE_TYPE') {
      console.log('✅ TEST 5 PASSED: Invalid file type rejected with 400.\n');
      testPassed++;
    } else {
      console.error('❌ TEST 5 FAILED\n');
    }
  } catch (err) {
    console.error('❌ TEST 5 FAILED with exception:', err.message, '\n');
  }

  console.log('====================================================');
  console.log(`  PHASE 3 VERIFICATION: ${testPassed}/${totalTests} TESTS PASSED`);
  console.log('====================================================');
}

runPhase3Tests();
