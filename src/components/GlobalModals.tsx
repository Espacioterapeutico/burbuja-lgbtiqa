import React from 'react';
import type { 
  UserProfile, 
  Contact, 
  Community, 
  UserReport, 
  CommunityRole, 
  CommunityMember, 
  UserStatus,
  ManagedUser,
  GlobalBroadcast
} from '../types';
import { ProfileView } from './ProfileView';
import { SharePINModal } from './SharePINModal';
import { AddContactModal } from './AddContactModal';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';
import { ReportUserModal } from './ReportUserModal';
import { AuthModal } from './AuthModal';
import { SuperadminPortal } from './SuperadminPortal';
import { CreateCommunityModal } from './CreateCommunityModal';
import { CommunityRolesModal } from './CommunityRolesModal';
import { RadarBurbujasModal } from './RadarBurbujasModal';
import { DirectChatModal } from './DirectChatModal';

interface GlobalModalsProps {
  currentUser: UserProfile;
  contacts: Contact[];
  availableContacts: Contact[];
  theme: 'dark' | 'light';
  reports: UserReport[];
  managingCommunity: Community | null;
  selectedCommunity: Community;
  communities?: Community[];
  managedUsers?: ManagedUser[];
  globalBroadcasts?: GlobalBroadcast[];
  
  // Modals Visibility
  isProfileOpen: boolean;
  isSharePINOpen: boolean;
  isAddContactOpen: boolean;
  selectedStoryContact: Contact | null;
  isCreateStoryOpen: boolean;
  reportTargetContact: Contact | null;
  isAuthOpen: boolean;
  isSuperadminOpen: boolean;
  isCreateCommunityOpen: boolean;
  isCommunityRolesOpen: boolean;
  isRadarOpen?: boolean;
  activeDirectChatContact?: Contact | null;
  sentRequestsPins?: string[];

  // Handlers
  onToggleTheme: () => void;
  onOpenSharePIN: () => void;
  onCloseProfile: () => void;
  onCloseSharePIN: () => void;
  onCloseAddContact: () => void;
  onAddContact: (contact: Contact) => void;
  onCloseStoryViewer: () => void;
  onCloseCreateStory: () => void;
  onPublishStory: (mediaUrl: string, caption: string) => void;
  onCloseReport: () => void;
  onSubmitReport: (report: Omit<UserReport, 'id' | 'timestamp' | 'status' | 'inviterAlerted'>) => void;
  onCloseAuth: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  onCloseSuperadmin: () => void;
  onUpdateReportStatus: (id: string, status: UserReport['status'], inviterAlerted?: boolean) => void;
  onCloseCreateCommunity: () => void;
  onCreateCommunity: (community: Community) => void;
  onCloseCommunityRoles: () => void;
  onUpdateCommunity: (communityId: string, updates: Partial<Community>) => void;
  onUpdateMemberRole: (communityId: string, userId: string, newRole: CommunityRole) => void;
  onMuteMember: (communityId: string, userId: string, muteDurationText: string | null) => void;
  onRemoveMember: (communityId: string, userId: string) => void;
  onAcceptRequest: (communityId: string, requestId: string) => void;
  onRejectRequest: (communityId: string, requestId: string) => void;
  onAddMemberByPin: (communityId: string, pin: string) => boolean;
  onOpenReportMember: (member: CommunityMember) => void;
  onToggleWhatsAppBridge: () => void;
  onUpdateStatus: (status: UserStatus) => void;
  onUpdateProfile?: (updates: Partial<UserProfile>) => void;
  onCloseRadar?: () => void;
  onToggleRadarVisible?: (active: boolean) => void;
  onSendConnectionRequest?: (target: Contact, introMessage: string) => void;
  onCloseDirectChat?: () => void;
  onToggleUserEnabled?: (userId: string) => void;
  onGrantInvitations?: (userId: string, count: number) => void;
  onToggleCommunityFreeze?: (commId: string) => void;
  onSendBroadcast?: (broadcast: GlobalBroadcast) => void;
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({
  currentUser,
  contacts,
  availableContacts,
  theme,
  reports,
  managingCommunity,
  selectedCommunity,
  communities = [],
  managedUsers = [],
  globalBroadcasts = [],
  isProfileOpen,
  isSharePINOpen,
  isAddContactOpen,
  selectedStoryContact,
  isCreateStoryOpen,
  reportTargetContact,
  isAuthOpen,
  isSuperadminOpen,
  isCreateCommunityOpen,
  isCommunityRolesOpen,
  isRadarOpen = false,
  activeDirectChatContact = null,
  sentRequestsPins = [],
  onCloseRadar,
  onToggleRadarVisible,
  onSendConnectionRequest,
  onCloseDirectChat,
  onToggleTheme,
  onOpenSharePIN,
  onCloseProfile,
  onCloseSharePIN,
  onCloseAddContact,
  onAddContact,
  onCloseStoryViewer,
  onCloseCreateStory,
  onPublishStory,
  onCloseReport,
  onSubmitReport,
  onCloseAuth,
  onLoginSuccess,
  onCloseSuperadmin,
  onUpdateReportStatus,
  onCloseCreateCommunity,
  onCreateCommunity,
  onCloseCommunityRoles,
  onUpdateCommunity,
  onUpdateMemberRole,
  onMuteMember,
  onRemoveMember,
  onAcceptRequest,
  onRejectRequest,
  onAddMemberByPin,
  onOpenReportMember,
  onToggleWhatsAppBridge,
  onUpdateStatus,
  onUpdateProfile,
  onToggleUserEnabled,
  onGrantInvitations,
  onToggleCommunityFreeze,
  onSendBroadcast
}) => {
  return (
    <>
      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileView
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenSharePIN={onOpenSharePIN}
          onToggleWhatsAppBridge={onToggleWhatsAppBridge}
          onUpdateStatus={onUpdateStatus}
          onUpdateProfile={onUpdateProfile}
          onClose={onCloseProfile}
        />
      )}

      {/* Share PIN Modal */}
      <SharePINModal
        user={currentUser}
        isOpen={isSharePINOpen}
        onClose={onCloseSharePIN}
      />

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={onCloseAddContact}
        onAddContact={onAddContact}
        availableContacts={availableContacts}
      />

      {/* 24h Story Viewer */}
      <StoryViewerModal
        contact={selectedStoryContact}
        isOpen={!!selectedStoryContact}
        onClose={onCloseStoryViewer}
      />

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateStoryOpen}
        onClose={onCloseCreateStory}
        onPublishStory={onPublishStory}
      />

      {/* Report User Modal */}
      <ReportUserModal
        contact={reportTargetContact}
        isOpen={!!reportTargetContact}
        onClose={onCloseReport}
        onSubmitReport={onSubmitReport}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={onCloseAuth}
        onLoginSuccess={onLoginSuccess}
      />

      {/* Superadmin Governance Portal */}
      {isSuperadminOpen && (
        <SuperadminPortal
          reports={reports}
          communities={communities}
          users={managedUsers}
          broadcasts={globalBroadcasts}
          onUpdateReportStatus={onUpdateReportStatus}
          onToggleUserEnabled={onToggleUserEnabled}
          onGrantInvitations={onGrantInvitations}
          onToggleCommunityFreeze={onToggleCommunityFreeze}
          onSendBroadcast={onSendBroadcast}
          onClose={onCloseSuperadmin}
        />
      )}

      {/* Create Community Modal */}
      <CreateCommunityModal
        isOpen={isCreateCommunityOpen}
        onClose={onCloseCreateCommunity}
        currentUser={currentUser}
        onCreateCommunity={onCreateCommunity}
      />

      {/* Community Roles & Management Modal */}
      {isCommunityRolesOpen && (managingCommunity || selectedCommunity) && (
        <CommunityRolesModal
          isOpen={isCommunityRolesOpen}
          onClose={onCloseCommunityRoles}
          community={managingCommunity || selectedCommunity}
          currentUser={currentUser}
          availableContacts={contacts}
          onUpdateCommunity={onUpdateCommunity}
          onUpdateMemberRole={onUpdateMemberRole}
          onMuteMember={onMuteMember}
          onRemoveMember={onRemoveMember}
          onAcceptRequest={onAcceptRequest}
          onRejectRequest={onRejectRequest}
          onAddMemberByPin={onAddMemberByPin}
          onOpenReportMember={onOpenReportMember}
        />
      )}
      {/* Radar de Burbujas Modal (Exploración Geográfica & Cercanía) */}
      {isRadarOpen && onCloseRadar && onToggleRadarVisible && onSendConnectionRequest && (
        <RadarBurbujasModal
          isOpen={isRadarOpen}
          onClose={onCloseRadar}
          currentUser={currentUser}
          theme={theme}
          onToggleRadarVisible={onToggleRadarVisible}
          onSendConnectionRequest={onSendConnectionRequest}
          sentRequestsPins={sentRequestsPins}
        />
      )}

      {/* Direct Chat 1 a 1 Modal */}
      {activeDirectChatContact && onCloseDirectChat && (
        <DirectChatModal
          isOpen={!!activeDirectChatContact}
          onClose={onCloseDirectChat}
          contact={activeDirectChatContact}
          currentUser={currentUser}
        />
      )}
    </>
  );
};
