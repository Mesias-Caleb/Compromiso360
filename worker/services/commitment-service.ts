import { D1CommitmentRepository } from '../repositories/d1-commitment-repository';
import { Commitment, CreateCommitmentInput, CommitmentFilters } from '../../src/domain/models/commitment';
import { EventStats } from '../../src/domain/models/stats';

export class CommitmentService {
  constructor(private repository: D1CommitmentRepository) {}

  async register(input: CreateCommitmentInput): Promise<Commitment> {
    return await this.repository.register(input);
  }

  async list(filters?: CommitmentFilters): Promise<Commitment[]> {
    return await this.repository.getAll(filters);
  }

  async getRecentConsenting(limit?: number): Promise<Commitment[]> {
    const all = await this.repository.getAll({ onlyConsenting: true, limit });
    return all;
  }

  async getStats(): Promise<EventStats> {
    return await this.repository.getStats();
  }

  async getRecent(limit?: number): Promise<Commitment[]> {
    return await this.repository.getRecent(limit);
  }

  async exportCSV(filters?: CommitmentFilters): Promise<string> {
    return await this.repository.exportToCSV(filters);
  }

  async clearAll(): Promise<void> {
    await this.repository.clearAll();
  }
}
