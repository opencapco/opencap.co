import type { JOB_TYPES } from "@/constants/job";
import { env } from "@/env";
import { singleton } from "@/lib/singleton";
import pgBoss from "pg-boss";

type JobTypes = typeof JOB_TYPES;

export type JobType = {
  [Key in keyof JobTypes]: `${Key}.${JobTypes[Key][number]}`;
}[keyof JobTypes];

interface Job<T extends object, U = void> {
  type: JobType;
  options: pgBoss.SendOptions;
  start: () => Promise<void>;
  work: (job: pgBoss.Job<T>) => Promise<U>;
  emit: (data: T) => Promise<void>;
}

export abstract class BaseJob<T extends object, U = void> implements Job<T, U> {
  protected boss: pgBoss;
  abstract readonly type: JobType;
  readonly options = { retryLimit: 3, retryDelay: 1000 };

  constructor() {
    this.boss = boss;
  }

  async start(): Promise<void> {
    await this.boss.work(this.type, this.work.bind(this));
  }

  abstract work(job: pgBoss.Job<T>): Promise<U>;

  async emit(data: T, options?: pgBoss.SendOptions): Promise<void> {
    await this.boss.send(this.type, data, options ?? this.options);
  }
  async bulkEmit(data: Omit<pgBoss.JobInsert<T>, "name">[]): Promise<void> {
    await this.boss.insert(
      data.map((items) => ({ ...items, name: this.type })),
    );
  }
}

export class JobManager {
  private readonly boss: pgBoss;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  private jobs = new Map<string, Job<any>>();

  constructor(boss: pgBoss) {
    this.boss = boss;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  register(job: new (boss: pgBoss) => Job<any>): JobManager {
    const jobInstance = new job(this.boss);
    this.jobs.set(jobInstance.type, jobInstance);
    return this;
  }

  async start(): Promise<void> {
    await this.boss.start();
    for (const job of this.jobs.values()) {
      await job.start();
    }
  }
}

export const boss = singleton(
  "pg-boss",
  () =>
    new pgBoss({
      connectionString: env.DATABASE_URL,
      max: 5,
      retryBackoff: true,
      retryLimit: 4,
      expireInHours: 48,
      archiveCompletedAfterSeconds: 60 * 60 * 2, // 2 hours
      deleteAfterDays: 2,
      retentionDays: 2,
    }),
);
