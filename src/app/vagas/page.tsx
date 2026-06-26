import { getJobs } from '@/actions/platform';
import { JobBoard } from '@/components/job-board';

export default async function VagasPage() {
  const jobs = await getJobs();
  return <JobBoard initialJobs={jobs} />;
}
