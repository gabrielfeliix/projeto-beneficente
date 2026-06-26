'use server';

import {
  Application,
  FeedPost,
  Institution,
  JobPosting,
  Notification,
  Volunteer,
} from '@/domain/entities';
import {
  mockApplications,
  mockFeedPosts,
  mockInstitutions,
  mockJobPostings,
  mockNotifications,
  mockVolunteers,
} from '@/data/mock';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getVolunteers(): Promise<Volunteer[]> {
  await delay(400);
  return [...mockVolunteers];
}

export async function getInstitutions(): Promise<Institution[]> {
  await delay(400);
  return [...mockInstitutions];
}

export async function getJobs(): Promise<JobPosting[]> {
  await delay(500);
  return [...mockJobPostings].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

export async function getJobById(id: string): Promise<JobPosting | null> {
  await delay(300);
  return mockJobPostings.find((job) => job.id === id) || null;
}

export async function getApplicationsForVolunteer(volunteerId: string): Promise<Application[]> {
  await delay(400);
  return mockApplications.filter((application) => application.volunteerId === volunteerId);
}

export async function getApplicationsForInstitution(institutionId: string): Promise<Application[]> {
  await delay(400);
  return mockApplications.filter((application) => application.institutionId === institutionId);
}

export async function getFeedPosts(): Promise<FeedPost[]> {
  await delay(400);
  return [...mockFeedPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay(300);
  return mockNotifications.filter((notification) => notification.userId === userId);
}

export async function getProfile(userId: string): Promise<Volunteer | Institution | null> {
  await delay(300);
  return (
    mockVolunteers.find((profile) => profile.id === userId) ||
    mockInstitutions.find((profile) => profile.id === userId) ||
    null
  );
}
