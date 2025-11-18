import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { User } from '../models/user.model';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'vendor';
  company: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
  createdAt?: Date;
}

export interface UserUpdateData {
  name?: string;
  company?: string;
  phone?: string;
  address?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  user?: T;
}

export interface UserStats {
  totalRFQs?: number;
  totalBids?: number;
  totalContracts?: number;
  activeRFQs?: number;
  activeBids?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Load user from localStorage on service initialization
    this.loadUserFromStorage();
  }

  /**
   * Load user data from localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * Get current user profile from server
   */
  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateCurrentUser(response.user);
        }
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(userData: UserUpdateData): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.apiUrl}/profile`, userData).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateCurrentUser(response.user);
        }
      })
    );
  }

  /**
   * Get user by ID (admin functionality)
   */
  getUserById(userId: string): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/users/${userId}`);
  }

  /**
   * Get all users (admin functionality)
   */
  getAllUsers(params?: { role?: string; page?: number; limit?: number }): Observable<ApiResponse<UserProfile[]>> {
    let queryParams = '';
    if (params) {
      const paramArray: string[] = [];
      if (params.role) paramArray.push(`role=${params.role}`);
      if (params.page) paramArray.push(`page=${params.page}`);
      if (params.limit) paramArray.push(`limit=${params.limit}`);
      if (paramArray.length > 0) {
        queryParams = '?' + paramArray.join('&');
      }
    }
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.apiUrl}/users${queryParams}`);
  }

  /**
   * Update current user in memory and localStorage
   */
  private updateCurrentUser(user: UserProfile): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get current user synchronously
   */
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user role
   */
  getUserRole(): 'customer' | 'vendor' | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  /**
   * Check if user is customer
   */
  isCustomer(): boolean {
    return this.getUserRole() === 'customer';
  }

  /**
   * Check if user is vendor
   */
  isVendor(): boolean {
    return this.getUserRole() === 'vendor';
  }

  /**
   * Get user statistics
   */
  getUserStats(): Observable<ApiResponse<UserStats>> {
    return this.http.get<ApiResponse<UserStats>>(`${this.apiUrl}/stats`);
  }

  /**
   * Change password
   */
  changePassword(oldPassword: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  /**
   * Verify email
   */
  verifyEmail(token: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/verify-email`, { token });
  }

  /**
   * Resend verification email
   */
  resendVerificationEmail(): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/resend-verification`, {});
  }

  /**
   * Deactivate user account
   */
  deactivateAccount(password: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/deactivate`, { password });
  }

  /**
   * Delete user account
   */
  deleteAccount(password: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/account`, {
      body: { password }
    });
  }

  /**
   * Upload profile picture
   */
  uploadProfilePicture(file: File): Observable<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return this.http.post<ApiResponse<{ url: string }>>(`${this.apiUrl}/upload-picture`, formData);
  }

  /**
   * Get user's activity log
   */
  getActivityLog(params?: { page?: number; limit?: number }): Observable<ApiResponse<any[]>> {
    let queryParams = '';
    if (params) {
      const paramArray: string[] = [];
      if (params.page) paramArray.push(`page=${params.page}`);
      if (params.limit) paramArray.push(`limit=${params.limit}`);
      if (paramArray.length > 0) {
        queryParams = '?' + paramArray.join('&');
      }
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/activity-log${queryParams}`);
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: any): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/preferences`, preferences);
  }

  /**
   * Get user preferences
   */
  getPreferences(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/preferences`);
  }

  /**
   * Enable two-factor authentication
   */
  enableTwoFactor(): Observable<ApiResponse<{ qrCode: string; secret: string }>> {
    return this.http.post<ApiResponse<{ qrCode: string; secret: string }>>(`${this.apiUrl}/2fa/enable`, {});
  }

  /**
   * Verify two-factor authentication code
   */
  verifyTwoFactor(code: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/2fa/verify`, { code });
  }

  /**
   * Disable two-factor authentication
   */
  disableTwoFactor(password: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/2fa/disable`, { password });
  }

  /**
   * Get notifications
   */
  getNotifications(unreadOnly: boolean = false): Observable<ApiResponse<any[]>> {
    const params = unreadOnly ? '?unread=true' : '';
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/notifications${params}`);
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllNotificationsAsRead(): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/notifications/read-all`, {});
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/notifications/${notificationId}`);
  }

  /**
   * Get unread notification count
   */
  getUnreadNotificationCount(): Observable<ApiResponse<{ count: number }>> {
    return this.http.get<ApiResponse<{ count: number }>>(`${this.apiUrl}/notifications/unread-count`);
  }

  /**
   * Update notification settings
   */
  updateNotificationSettings(settings: any): Observable<ApiResponse<void>> {
    return this.http.put<ApiResponse<void>>(`${this.apiUrl}/notification-settings`, settings);
  }

  /**
   * Get notification settings
   */
  getNotificationSettings(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/notification-settings`);
  }

  /**
   * Search users (for mentions, collaborations, etc.)
   */
  searchUsers(query: string, role?: 'customer' | 'vendor'): Observable<ApiResponse<UserProfile[]>> {
    let params = `?q=${encodeURIComponent(query)}`;
    if (role) params += `&role=${role}`;
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.apiUrl}/search${params}`);
  }

  /**
   * Block user
   */
  blockUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/block/${userId}`, {});
  }

  /**
   * Unblock user
   */
  unblockUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/unblock/${userId}`, {});
  }

  /**
   * Get blocked users list
   */
  getBlockedUsers(): Observable<ApiResponse<UserProfile[]>> {
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.apiUrl}/blocked-users`);
  }

  /**
   * Report user
   */
  reportUser(userId: string, reason: string, description: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/report/${userId}`, {
      reason,
      description
    });
  }

  /**
   * Get user rating/reviews
   */
  getUserRatings(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/${userId}/ratings`);
  }

  /**
   * Rate user (after contract completion)
   */
  rateUser(userId: string, rating: number, review?: string, contractId?: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/users/${userId}/rate`, {
      rating,
      review,
      contractId
    });
  }

  /**
   * Get user's public profile
   */
  getPublicProfile(userId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/users/${userId}/public`);
  }

  /**
   * Follow user (for updates)
   */
  followUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/follow/${userId}`, {});
  }

  /**
   * Unfollow user
   */
  unfollowUser(userId: string): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/unfollow/${userId}`, {});
  }

  /**
   * Get followers list
   */
  getFollowers(): Observable<ApiResponse<UserProfile[]>> {
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.apiUrl}/followers`);
  }

  /**
   * Get following list
   */
  getFollowing(): Observable<ApiResponse<UserProfile[]>> {
    return this.http.get<ApiResponse<UserProfile[]>>(`${this.apiUrl}/following`);
  }

  /**
   * Export user data (GDPR compliance)
   */
  exportUserData(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export-data`, {
      responseType: 'blob'
    });
  }

  /**
   * Clear user data from localStorage and memory
   */
  clearUserData(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
  }

  /**
   * Refresh user data from server
   */
  refreshUserData(): Observable<ApiResponse<UserProfile>> {
    return this.getProfile();
  }

  /**
   * Check if email is available
   */
  checkEmailAvailability(email: string): Observable<ApiResponse<{ available: boolean }>> {
    return this.http.post<ApiResponse<{ available: boolean }>>(`${this.apiUrl}/check-email`, { email });
  }

  /**
   * Get user dashboard summary
   */
  getDashboardSummary(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dashboard-summary`);
  }

  /**
   * Get user timeline/activity feed
   */
  getActivityFeed(params?: { page?: number; limit?: number }): Observable<ApiResponse<any[]>> {
    let queryParams = '';
    if (params) {
      const paramArray: string[] = [];
      if (params.page) paramArray.push(`page=${params.page}`);
      if (params.limit) paramArray.push(`limit=${params.limit}`);
      if (paramArray.length > 0) {
        queryParams = '?' + paramArray.join('&');
      }
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/activity-feed${queryParams}`);
  }

  /**
   * Update user avatar/profile picture URL
   */
  updateAvatar(avatarUrl: string): Observable<ApiResponse<UserProfile>> {
    return this.http.patch<ApiResponse<UserProfile>>(`${this.apiUrl}/avatar`, { avatarUrl }).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.updateCurrentUser(response.user);
        }
      })
    );
  }

  /**
   * Validate user session
   */
  validateSession(): Observable<ApiResponse<{ valid: boolean }>> {
    return this.http.get<ApiResponse<{ valid: boolean }>>(`${this.apiUrl}/validate-session`);
  }

  /**
   * Get user's saved items/bookmarks
   */
  getSavedItems(type?: 'rfq' | 'vendor'): Observable<ApiResponse<any[]>> {
    const params = type ? `?type=${type}` : '';
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/saved-items${params}`);
  }

  /**
   * Save/bookmark item
   */
  saveItem(itemId: string, itemType: 'rfq' | 'vendor'): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/save-item`, { itemId, itemType });
  }

  /**
   * Remove saved/bookmarked item
   */
  removeSavedItem(itemId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/saved-items/${itemId}`);
  }

  /**
   * Get user badges/achievements
   */
  getUserBadges(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/badges`);
  }

  /**
   * Get user transaction history
   */
  getTransactionHistory(params?: { page?: number; limit?: number; type?: string }): Observable<ApiResponse<any[]>> {
    let queryParams = '';
    if (params) {
      const paramArray: string[] = [];
      if (params.page) paramArray.push(`page=${params.page}`);
      if (params.limit) paramArray.push(`limit=${params.limit}`);
      if (params.type) paramArray.push(`type=${params.type}`);
      if (paramArray.length > 0) {
        queryParams = '?' + paramArray.join('&');
      }
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/transactions${queryParams}`);
  }

  /**
   * Subscribe to user updates (returns observable for real-time updates)
   */
  subscribeToUserUpdates(): Observable<UserProfile> {
    return this.currentUser$.pipe(
      filter((u): u is UserProfile => u !== null)
    );
  }
}