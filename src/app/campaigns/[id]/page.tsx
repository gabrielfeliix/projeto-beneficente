import { getCampaignById, getCampaignUpdates, getCampaignOrganizer } from "@/actions/campaigns";
import { CampaignPageClient } from "@/components/campaign-page-client";
import { notFound } from "next/navigation";

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const campaign = await getCampaignById(id);

  if (!campaign) {
    notFound();
  }

  const updates = await getCampaignUpdates(id);
  const organizer = await getCampaignOrganizer(campaign.organizerId);

  return (
    <CampaignPageClient campaign={campaign} initialUpdates={updates} organizer={organizer} />
  );
}
