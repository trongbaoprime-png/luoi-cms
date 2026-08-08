import { sendMetaCapiEvent, MetaEventData } from "../api-clients/meta-ads";

export type JobType = "JOB_AI_ARTICLE_GEN" | "JOB_IMAGE_OPTIMIZE" | "JOB_META_CAPI_SYNC";

export interface QueueJob {
  id: string;
  type: JobType;
  payload: Record<string, unknown>;
  attempts: number;
  createdAt: number;
}

const jobQueue: QueueJob[] = [];
let isProcessing = false;

export function addJobToQueue(type: JobType, payload: Record<string, unknown>): string {
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const job: QueueJob = {
    id: jobId,
    type,
    payload,
    attempts: 0,
    createdAt: Date.now(),
  };

  jobQueue.push(job);
  console.log(`[JobQueue]: Job ${jobId} (${type}) added to queue.`);
  processQueue();
  return jobId;
}

async function processQueue() {
  if (isProcessing || jobQueue.length === 0) return;
  isProcessing = true;

  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    if (!job) break;

    try {
      console.log(`[JobQueue]: Processing job ${job.id} (${job.type})...`);

      switch (job.type) {
        case "JOB_META_CAPI_SYNC":
          await sendMetaCapiEvent(job.payload as unknown as MetaEventData);
          break;

        case "JOB_AI_ARTICLE_GEN":
          console.log(`[JobQueue]: Background AI Article Gen for topic:`, job.payload.topic);
          break;

        case "JOB_IMAGE_OPTIMIZE":
          console.log(`[JobQueue]: Background Image Optimization for url:`, job.payload.url);
          break;
      }

      console.log(`[JobQueue]: Job ${job.id} completed successfully.`);
    } catch (err) {
      console.error(`[JobQueue Error]: Job ${job.id} failed:`, err);
      if (job.attempts < 3) {
        job.attempts += 1;
        jobQueue.push(job);
      }
    }
  }

  isProcessing = false;
}
