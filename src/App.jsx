import { useState } from 'react'
import './App.css'

import Signup from './login/Signup'
import Signin from './login/Signin'

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import AuditeeDashboard from './dashboard_old/AuditeeDashboard';
import AdminDashboard from './dashboard_old/AdminDashboard';
import AuditorDashboard from './dashboard_old/AuditorDashboard';

import ProtectedRoute from './utilities/ProtectedRoute'
import UserVerification from './UserVerification/UserVerfication';
import PendingApproval from './utilities/PendingApproval'
import CompletedReports from './AuditorDashboard/CompletedAudits';
import RegisterApplication from './AuditeeDashboard/RegisterApplication'
import AuditAssignment from './AdminDashboard/AuditAssignment'
import NewAudits from './AuditorDashboard/NewAudits';
import PendingAudits from './AdminDashboard/PendingAudits'
import RejectedAudits from './AdminDashboard/RejectedAudits'
import RejectedApplications from './AuditeeDashboard/RejectedApplications'
import AssignedAuditView from './AdminDashboard/AssignedAuditViiew'
import ApprovedApplications from './AuditeeDashboard/ApprovedApplications'
import EditApplication from './AuditeeDashboard/EditApplication'
import CreateChecklist from './AdminDashboard/CreateChecklist'
// import ViewChecklist from './AdminDashboard/ViewChecklist'
import EditChecklist from './AdminDashboard/EditChecklist'
import AcceptedAudits from './AuditorDashboard/AcceptedAudits'
import RemediationSigin from './Remediation/RemediationSigin';
import ViewChecklist from './ChecklistModule/ViewChecklist'
import DataBreachScanner from './AuditorDashboard/DataBreachScanner';


import SessionExpiredScreen from './utilities/SessionExpiredScreen';

import SelfCheckConsentScanner
  from "./AuditeeDashboard/Tools/ConsentScanner/SelfCheckConsentScanner";

import ConsentScans
  from "./AuditeeDashboard/Tools/ConsentScanner/ConsentScans";




//  -------------------- NOTIFICATION IMPORTS ----------------- */ 

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import RemediationGate from './Remediation/RemediationGate';
import RemediationForm from './Remediation/RemediationForm';
import RemediationDashboard from './Remediation/RemediationDashboard';
import NewRemediation from './Remediation/NewRemediation';
import PaymentPage from './Remediation/PaymentPage';
import RemediationApplications from './Remediation/RemediationApplications';
import RemediationView from './Remediation/RemediationView';
// import ChecklistModule from './ChecklistModule/ChecklistModule';
import ViewChecklistDetail from './ChecklistModule/ViewChecklistDetail';
import OngoingAudits from './AuditorDashboard/OngoingAudits';
import ViewOngoingAudit from './AuditorDashboard/ViewOngoingAudit';
import ConsentResultViewer from './ConsentScannerModule/ConsentResultViewer';
import ScannerResultViewer from './ConsentScannerModule/ScannerResultViewer';
import DomainTable from './ChecklistModule/DomainTable';
import CreateDomain from './ChecklistModule/CreateDomain';
import EditDomain from './ChecklistModule/EditDomain';
import EvidenceTable from './ChecklistModule/EvidenceTable';
import CreateEvidence from './ChecklistModule/CreateEvidence';
import CreateChecklistModule from './ChecklistModule/CreateChecklist';
import EditChecklistModule from './ChecklistModule/EditChecklistModule';
import EvidenceScannerMapping from './AdminDashboard/EvidenceScannerMapping';
import EvidenceScannerMappingTable from './AdminDashboard/EvidenceScannerMappingTable';
import PaymentWrapper from './Payment/components/PaymentWrapper';
import PendingAssignments from './AuditorDashboard/PendingAssignments';
import DeclinedAudits from './AuditorDashboard/DeclinedAudits';
import ReassignAudits from './AdminDashboard/ReassignAudits';





// ---------------------------KEYWORD MANAGEMENT----------------------------

import KeywordManagement from "./AdminDashboard/ToolsManagement/DataBreachScanner/KeywordManagement/KeywordManagement";


import AuditorChecklistPage from "./AuditorWorkspace/AuditorChecklistPage";

/*-------------------TESTING CONSENT MANAGEMENT V2.0----------*/
import ConsentAuditDemo from "./ConsentScannerModule/Consent2.0/pages/ConsentAuditDemo";

// ----------------------CONSENT--------------------------------
import ConsentScanner from './ConsentScannerModule/Consent2.0/components/ConsentScanner';
import BulkUpload from './ChecklistModule/BullkUpload';
import ConsentAutoAudit from './ConsentScannerModule/Consent2.0/components/ConsentAutoAudit';
import LearnDPDP from './AuditeeDashboard/LearnDPDP';
import CompletedAudits from './AuditorDashboard/CompletedAudits';
import SelfCheckDataBreachScanner from './AuditeeDashboard/Tools/BreachScanner/SelfCheckDataBreachScanner';
import ProfilePage from './Profile/ProfilePage';
import SelfCheckScanResult from './AuditeeDashboard/Tools/ConsentScanner/SelfCheckScanResult';
import InProgressAudits from './AuditorDashboard/InProgressAudits';
import DataBreachScanConfig from './AuditorDashboard/DataBreachScanConfig';
import SelfCheckDataBreachScans from './AuditeeDashboard/Tools/BreachScanner/SelfCheckDataBreachScans';
import SelfCheckDataBreachResult from './AuditeeDashboard/Tools/BreachScanner/SelfCheckDataBreachResult';
import DataBreachScannerResult from './AuditorDashboard/DataBreachScannerResult';
import AdminReports from './AdminDashboard/AdminReports';
import PendingApplications from './AuditeeDashboard/PendingApplications';
import OnProgressAudits from './AuditeeDashboard/OnProgressAudits';
import AuditeePublishedReports from './AuditeeDashboard/AuditeePublishedReport';



//  ------------------------------------------ NEW UI -------------------------------------
import NewUIRoot from './new_ui/app/NewUIRoot';
import DashboardLayout from "./dashboard_/DashboardLayout";




/* ------------------ ROLE BASED REDIRECT ------------------ */
const getDashboardRoute = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user.role === 1) return "/admindashboard";
  if (user.role === 2) return "/auditdashboard";
  if (user.role === 3) return "/devdashboard";

  return "/signin";
};

/* ------------------ PUBLIC ROUTE ------------------ */
const PublicRoute = ({ children }) => {
  const access = localStorage.getItem("access");

  if (access) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return children;
};

/* ------------------ ROOT REDIRECT ------------------ */
const RootRedirect = () => {
  const access = localStorage.getItem("access");

  if (access) {
    return <Navigate to={getDashboardRoute()} replace />;
  }

  return <Navigate to="/signin" replace />;
};

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
      <Router>
        <Routes>

          {/* ROOT */}
          <Route path="/" element={<RootRedirect />} />

          {/* REMEDIATION ROUTES  */}
          <Route
            path="/remediation/signin"
            element={<RemediationSigin />}
          />
          <Route path='/remediation/gate' element={<RemediationGate />} />
          <Route path='/remediation/dashboard' element={<RemediationDashboard />} />
          <Route path='/remediation/new' element={<NewRemediation />} />
          <Route path='/remediation/payment' element={<PaymentPage />} />
          <Route path='/remediation/applications' element={<RemediationApplications />} />
          <Route path='/remediation/view/:id' element={<RemediationView />} />

          {/* AUTH ROUTES */}
          <Route
            path="/signin"
            element={
              <PublicRoute>
                <Signin />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route path='/pending' element={<PendingApproval />} />

          {/* ------------------------ PROFILE ROUTES ---------------------- */}

          <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ---------------- ADMIN ---------------- */}

          <Route
            path="/admin/data-breach-scanner/keywords"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <KeywordManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminReports />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin/checklist/bulkupload/'
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <BulkUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path='/admin/audits/resassign/'
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <ReassignAudits />
              </ProtectedRoute>
            }
          />
          <Route
            path='/evidence/map'
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <EvidenceScannerMapping />
              </ProtectedRoute>
            }
          />

          <Route
            path='/evidence/map/table'
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <EvidenceScannerMappingTable />
              </ProtectedRoute>
            }
          />

          <Route
            path="/evidence/view/all"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <EvidenceTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/evidence/create"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <CreateEvidence />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domain/view"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <DomainTable />
              </ProtectedRoute>
            }
          />
          <Route
            path="/domain/create"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <CreateDomain />
              </ProtectedRoute>
            }
          />

          <Route
            path="/domain/edit"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <EditDomain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admindashboard"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/verify/users"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <UserVerification />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/pendingaudits"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <PendingAudits />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/rejectedaudits"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <RejectedAudits />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/ongoingaudits"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AssignedAuditView />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/assignaudits"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <AuditAssignment />
              </ProtectedRoute>
            }
          />

          {/* <Route
            path="/admin/createChecklist"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <ChecklistModule />
              </ProtectedRoute>
            }
          />*/}
          <Route
            path="/admin/createChecklist"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <CreateChecklistModule />
              </ProtectedRoute>
            } />
          <Route
            path="/admin/viewChecklist"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <ViewChecklist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/viewChecklist/:id"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <ViewChecklistDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/editChecklist/:id"
            element={
              <ProtectedRoute allowedRoles={[1]}>
                <EditChecklistModule />
              </ProtectedRoute>
            }
          />


          {/* ---------------- auditee ---------------- */}


          <Route
            path="/application/pending"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <PendingApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path="/application/inprogress"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <OnProgressAudits />
              </ProtectedRoute>
            }
          />

          <Route
            path="/application/published-reports"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <AuditeePublishedReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/self-check/breach-scans/:publicAuditId/result"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <SelfCheckDataBreachResult />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/self-check/breach-scans"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <SelfCheckDataBreachScans />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/self-check/scans/:publicAuditId/results"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <SelfCheckScanResult />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/self-check/scans/:publicAuditId/results"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <ConsentAutoAudit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/self-check/consent-scanner"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <SelfCheckConsentScanner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/self-check/data-breach-scanner"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <SelfCheckDataBreachScanner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/self-check/scans"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <ConsentScans />
              </ProtectedRoute>
            }
          />
          <Route path="/learndpdp" element={
            <ProtectedRoute allowedRoles={[2, 3]}>
              <LearnDPDP />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute allowedRoles={[3]}>
              <PaymentWrapper />
            </ProtectedRoute>
          } />
          <Route
            path="/devdashboard"
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <AuditeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path='/user/register'
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <RegisterApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path='/user/rejectedaudits'
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <RejectedApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path='/user/approvedaudits'
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <ApprovedApplications />
              </ProtectedRoute>
            }
          />

          <Route
            path='/user/editapplication/:id'
            element={
              <ProtectedRoute allowedRoles={[3]}>
                <EditApplication />
              </ProtectedRoute>
            }
          />


          {/* ---------------- AUDITOR ---------------- */}

          <Route
            path="/auditor-workspace/:publicAuditId"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <AuditorChecklistPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/acceptedAudits"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <AcceptedAudits />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/pendingAudits"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <PendingAssignments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/completedaudits"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <CompletedAudits />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/completed-reports"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <CompletedReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/data-breach-scan/:publicAuditId/result"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DataBreachScannerResult />
              </ProtectedRoute>
            }
          />

          <Route
            path="/data-breach-scan-config/:auditId"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DataBreachScanConfig />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor-workspace/:publicAuditId"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <AuditorChecklistPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/inprogress"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <InProgressAudits />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route path='/auditor/declinedAudits' element={
            <ProtectedRoute allowedRoles={[2]}>
              <DashboardLayout role="auditor">
                <DeclinedAudits />
              </DashboardLayout>
            </ProtectedRoute>
          } />

          <Route
            path='/auditor/databreachscanner/'
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <DataBreachScanner />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path='/auditor/consentscanner/'
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <DashboardLayout role="auditor">
                  <ConsentScanner />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/consent-management/:publicAuditId"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ConsentAutoAudit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/consent-auto-audit"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ConsentAutoAudit />
              </ProtectedRoute>
            }
          />

          <Route
            path="/consent-scanner/:auditId"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ConsentAuditDemo />
              </ProtectedRoute>
            }
          />

          <Route
            path='/admin/consentv2/demo'
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ConsentAuditDemo />
              </ProtectedRoute>
            }
          />

          <Route path='/consent/view/' element={
            <ProtectedRoute allowedRoles={[2]}>
              <ScannerResultViewer />
            </ProtectedRoute>
          } />


          <Route
            path="/auditdashboard"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <AuditorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/newaudits"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <NewAudits />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auditor/acceptedAudits"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <AcceptedAudits />
              </ProtectedRoute>
            }
          />
          <Route path='/auditor/pendingAudits'
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <PendingAssignments />
              </ProtectedRoute>
            } />
          <Route
            path="/auditor/ongoingaudits"
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <OngoingAudits />
              </ProtectedRoute>
            }
          />

          <Route
            path='/auditor/ongoing/:id'
            element={
              <ProtectedRoute allowedRoles={[2]}>
                <ViewOngoingAudit />
              </ProtectedRoute>
            }
          />


          <Route
            path="/new-ui/*"
            element={
              <ProtectedRoute allowedRoles={[1, 2, 3]}>
                <NewUIRoot />
              </ProtectedRoute>
            }
          />
        </Routes>
        <SessionExpiredScreen />
      </Router>
    </>

  )
}

export default App;