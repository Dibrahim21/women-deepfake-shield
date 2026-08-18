import React, { useEffect, useState } from 'react';
import { AuthView } from './components/AuthView';
import { supabase } from './lib/supabase';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';

import { DashboardView } from './components/DashboardView';
import { AnalyzeView } from './components/AnalyzeView';
import { ForensicAnalysisReport } from './components/ForensicAnalysisReport';
import { EvidenceReportView } from './components/EvidenceReportView';
import { CaseDetailsView } from './components/CaseDetailsView';
import { HistoryView } from './components/HistoryView';
import { SafetyCenterView } from './components/SafetyCenterView';
import { HowItWorksView } from './components/HowItWorksView';
import { ProfileSecurityView } from './components/ProfileSecurityView';

import { CaseReport, ViewMode, TabType } from './types';

/*
|--------------------------------------------------------------------------
| EMPTY CASE
|--------------------------------------------------------------------------
| App starts without any real analysis.
| This object is only a safe placeholder until the user uploads media.
*/

const EMPTY_CASE: CaseReport = {
  id: '',
  caseNumber: '',
  reportNumber: '',
  title: '',
  fileName: '',
  fileSize: '0 MB',
  duration: '0:00',
  fps: '',
  mediaType: 'video',
  scannedAt: '',
  analysisDate: '',
  riskScore: 0,
  riskLevel: 'Authentic',
  confidenceText: '',
  integrityHash: '',
  facialManipulationScore: 0,
  frameInconsistenciesScore: 0,
  audioVideoSyncScore: 0,
  textureConsistencyScore: 0,
  explainableAssessment: '',
  timelineLogs: [],
  suspiciousFrames: [],
  previewUrl: '',
  sourcePreviewUrl: '',
  waveformUrl: '',
  anomaliesSummary: '',
  anomaliesTimestamps: [],
};

export function App() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [currentView, setCurrentView] =
    useState<ViewMode>('dashboard');

  const [activeTab, setActiveTab] =
    useState<TabType>('dashboard');

  /*
  |--------------------------------------------------------------------------
  | REAL CASE HISTORY
  |--------------------------------------------------------------------------
  | Cases are loaded from Supabase for the currently authenticated user.
  */

  const [cases, setCases] = useState<CaseReport[]>([]);

  const [currentCase, setCurrentCase] =
    useState<CaseReport>(EMPTY_CASE);

  /*
  |--------------------------------------------------------------------------
  | VIEW HISTORY
  |--------------------------------------------------------------------------
  */

  const [viewHistory, setViewHistory] =
    useState<ViewMode[]>(['dashboard']);

  /*
  |--------------------------------------------------------------------------
  | LOAD CASE HISTORY FROM SUPABASE
  |--------------------------------------------------------------------------
  */

  const loadCases = async (userId: string) => {
    const { data, error } = await supabase
      .from('analysis_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load analysis history:', error);
      return;
    }

    const mappedCases: CaseReport[] = (data || []).map((record: any) => {
  const forensic = record.forensic_result || {};
  const ai = record.ai_result || {};

  const analysisId =
    record.analysis_id ||
    record.id ||
    crypto.randomUUID();

  const classification =
    ai.classification === 'Likely Deepfake' ||
    ai.classification === 'Suspicious' ||
    ai.classification === 'Authentic'
      ? ai.classification
      : 'Suspicious';

  const confidenceScore =
    typeof ai.confidenceScore === 'number'
      ? ai.confidenceScore
      : 0;

  return {
    id: analysisId,

    caseNumber:
      `#AN-${String(analysisId).slice(0, 8).toUpperCase()}`,

    reportNumber:
      `#R-${String(analysisId).slice(0, 6).toUpperCase()}`,

    title:
      record.filename ||
      'Analysis',

    fileName:
      record.filename ||
      'Unknown file',

    fileSize:
      forensic.fileSize?.formatted ||
      (
        record.file_size
          ? `${(record.file_size / (1024 * 1024)).toFixed(2)} MB`
          : '0 Bytes'
      ),

    duration: 'N/A',

    fps: '',

    mediaType:
      record.media_type === 'video' ||
      record.media_type === 'image' ||
      record.media_type === 'audio'
        ? record.media_type
        : 'image',

    scannedAt:
      record.created_at
        ? new Date(record.created_at).toLocaleString()
        : forensic.analyzedAt
          ? new Date(forensic.analyzedAt).toLocaleString()
          : '',

    analysisDate:
      record.created_at
        ? new Date(record.created_at).toLocaleDateString()
        : forensic.analyzedAt
          ? new Date(forensic.analyzedAt).toLocaleDateString()
          : '',

    // Confidence is NOT risk.
    // Keep this field for existing UI compatibility.
    riskScore:
      classification === 'Likely Deepfake'
        ? confidenceScore
        : classification === 'Suspicious'
          ? confidenceScore
          : 0,

    riskLevel:
      classification,

    confidenceText:
      typeof ai.confidenceScore === 'number'
        ? `${ai.confidenceScore}% model confidence`
        : 'Confidence unavailable',

    integrityHash:
      record.sha256_hash ||
      forensic.fileHash ||
      '',

    facialManipulationScore:
      typeof ai.facialIntegrityScore === 'number'
        ? ai.facialIntegrityScore
        : 0,

    // These are NOT calculated by the current forensic engine.
    frameInconsistenciesScore: 0,
    audioVideoSyncScore: 0,
    textureConsistencyScore: 0,

    explainableAssessment:
      ai.reasoning ||
      forensic.message ||
      'No assessment available.',

    // Current backend does not calculate these.
    // Do not fabricate them.
    timelineLogs: [],
    suspiciousFrames: [],

    previewUrl: '',
    sourcePreviewUrl: '',
    waveformUrl: '',

    anomaliesSummary:
      forensic.message || '',

    anomaliesTimestamps: [],

    // ACTUAL FORENSIC RESULT
    forensicResult: forensic,
  };
});

    setCases(mappedCases);
  };

  /*
  |--------------------------------------------------------------------------
  | SESSION + AUTH STATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();

      setSession(data.session);

      if (data.session?.user) {
        await loadCases(data.session.user.id);
      }

      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          await loadCases(newSession.user.id);
        } else {
          setCases([]);
          setCurrentCase(EMPTY_CASE);
        }

        setAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | NAVIGATION
  |--------------------------------------------------------------------------
  */

  const navigateTo = (view: ViewMode) => {
    setCurrentView(view);

    setViewHistory((prev) => {
      if (prev[prev.length - 1] === view) {
        return prev;
      }

      return [...prev, view];
    });

    switch (view) {
      case 'dashboard':
        setActiveTab('dashboard');
        break;

      case 'analyze-upload':
      case 'analyzing-live':
      case 'analysis-result':
        setActiveTab('analyze');
        break;

      case 'history':
        setActiveTab('history');
        break;

      case 'safety':
        setActiveTab('safety');
        break;

      case 'privacy-security':
        setActiveTab('profile');
        break;

      default:
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BACK BUTTON
  |--------------------------------------------------------------------------
  */

  const handleBack = () => {
    if (viewHistory.length <= 1) {
      setCurrentView('dashboard');
      setActiveTab('dashboard');
      setViewHistory(['dashboard']);
      return;
    }

    const nextHistory = [...viewHistory];

    nextHistory.pop();

    const previousView =
      nextHistory[nextHistory.length - 1];

    setViewHistory(nextHistory);
    setCurrentView(previousView);

    switch (previousView) {
      case 'dashboard':
        setActiveTab('dashboard');
        break;

      case 'history':
        setActiveTab('history');
        break;

      case 'safety':
        setActiveTab('safety');
        break;

      case 'privacy-security':
        setActiveTab('profile');
        break;

      case 'analyze-upload':
      case 'analyzing-live':
      case 'analysis-result':
        setActiveTab('analyze');
        break;

      default:
        break;
    }
  };

  /*
  |--------------------------------------------------------------------------
  | BOTTOM NAVIGATION
  |--------------------------------------------------------------------------
  */

  const handleSelectTab = (tab: TabType) => {
    setActiveTab(tab);

    let nextView: ViewMode;

    switch (tab) {
      case 'dashboard':
        nextView = 'dashboard';
        break;

      case 'analyze':
        setCurrentCase(EMPTY_CASE);
        nextView = 'analyze-upload';
        break;

      case 'history':
        nextView = 'history';
        break;

      case 'safety':
        nextView = 'safety';
        break;

      case 'profile':
        nextView = 'privacy-security';
        break;

      default:
        nextView = 'dashboard';
    }

    setCurrentView(nextView);

    setViewHistory((prev) => {
      if (prev[prev.length - 1] === nextView) {
        return prev;
      }

      return [...prev, nextView];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | CASE SELECTION
  |--------------------------------------------------------------------------
  */

  const handleSelectCase = (
    caseItem: CaseReport,
    targetView: ViewMode = 'case-detail'
  ) => {
    setCurrentCase(caseItem);
    navigateTo(targetView);
  };

  /*
  |--------------------------------------------------------------------------
  | CASE ANALYZED
  |--------------------------------------------------------------------------
  | Called by AnalyzeView after the backend successfully finishes
  | the analysis.
  */

  const handleCaseAnalyzed = (newCase: CaseReport) => {
    setCurrentCase(newCase);

    setCases((previousCases) => {
      const filteredCases = previousCases.filter(
        (existingCase) =>
          existingCase.id !== newCase.id
      );

      return [newCase, ...filteredCases];
    });
  };

  /*
  |--------------------------------------------------------------------------
  | RE-ANALYZE
  |--------------------------------------------------------------------------
  */

  const handleReanalyze = (caseItem: CaseReport) => {
    setCurrentCase(caseItem);

    navigateTo('analyze-upload');
  };

  /*
  |--------------------------------------------------------------------------
  | DELETE CASE
  |--------------------------------------------------------------------------
  */

  const handleDeleteCase = async (id: string) => {
    const { data: userData } =
      await supabase.auth.getUser();

    const user = userData.user;

    if (!user) {
      console.error('No authenticated user found.');
      return;
    }

    const { error } = await supabase
      .from('analysis_records')
      .delete()
      .eq('analysis_id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete analysis:', error);
      return;
    }

    setCases((previousCases) =>
      previousCases.filter(
        (caseItem) => caseItem.id !== id
      )
    );

    if (currentCase.id === id) {
      setCurrentCase(EMPTY_CASE);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | AUTH LOADING
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-sm font-semibold text-slate-600">
          Loading...
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | AUTH SCREEN
  |--------------------------------------------------------------------------
  */

  if (!session) {
    return <AuthView onAuthenticated={() => {}} />;
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN APP
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="
        min-h-screen
        bg-slate-100/70
        text-slate-900
        flex
        flex-col
        antialiased
        selection:bg-blue-600
        selection:text-white
      "
    >

      {/* HEADER */}

      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        onBack={handleBack}
      />

      {/* MAIN CONTENT */}

      <main
        className="
          flex-1
          w-full
          max-w-lg
          sm:max-w-xl
          md:max-w-2xl
          lg:max-w-3xl
          mx-auto
          px-4
          sm:px-6
          pt-5
          pb-16
        "
      >

        {/* DASHBOARD */}

        {currentView === 'dashboard' && (
          <DashboardView
            cases={cases}
            onNavigate={navigateTo}
            onSelectCase={handleSelectCase}
          />
        )}

        {/* ANALYZE */}

        {(
          currentView === 'analyze-upload' ||
          currentView === 'analyzing-live' ||
          currentView === 'analysis-result'
        ) && (
          <AnalyzeView
            currentCase={currentCase}
            onNavigate={navigateTo}
            onCaseAnalyzed={handleCaseAnalyzed}
          />
        )}

        {/* FORENSIC ANALYSIS */}

        {currentView === 'forensic-detail' && (
          <ForensicAnalysisReport
            currentCase={currentCase}
            onNavigate={navigateTo}
          />
        )}

        {/* EVIDENCE REPORT */}

        {currentView === 'evidence-report' && (
          <EvidenceReportView
            currentCase={currentCase}
            onNavigate={navigateTo}
          />
        )}

        {/* CASE DETAILS */}

        {currentView === 'case-detail' && (
          <CaseDetailsView
            currentCase={currentCase}
            onNavigate={navigateTo}
            onReanalyze={handleReanalyze}
          />
        )}

        {/* HISTORY */}

        {currentView === 'history' && (
          <HistoryView
            cases={cases}
            onSelectCase={handleSelectCase}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {/* SAFETY CENTER */}

        {currentView === 'safety' && (
          <SafetyCenterView />
        )}

        {/* HOW IT WORKS */}

        {currentView === 'how-it-works' && (
          <HowItWorksView
            onNavigate={navigateTo}
          />
        )}

        {/* PROFILE / SECURITY */}

        {currentView === 'privacy-security' && (
          <ProfileSecurityView />
        )}

      </main>

      {/* BOTTOM NAVIGATION */}

      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

    </div>
  );
}

export default App;