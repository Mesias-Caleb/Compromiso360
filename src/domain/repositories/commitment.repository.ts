import { Commitment, CreateCommitmentInput, CommitmentFilters } from '../models/commitment';
import { EventStats } from '../models/stats';

export interface CommitmentRepository {
  /**
   * Registers a new commitment, validating accidental duplicate submission token if present.
   */
  register(input: CreateCommitmentInput): Promise<Commitment>;

  /**
   * Retrieves commitments with optional filters.
   */
  getAll(filters?: CommitmentFilters): Promise<Commitment[]>;

  /**
   * Retrieves a single commitment by its UUID.
   */
  getById(id: string): Promise<Commitment | null>;

  /**
   * Retrieves the aggregated real-time statistics for the event.
   */
  getStats(): Promise<EventStats>;

  /**
   * Retrieves the most recent commitments (e.g. for ceremonial mural stream).
   */
  getRecent(limit?: number): Promise<Commitment[]>;

  /**
   * Retrieves the most recent consenting commitments (e.g. for public mural).
   */
  getRecentConsenting(limit?: number): Promise<Commitment[]>;

  /**
   * Generates a CSV string of commitments matching the filters.
   */
  exportToCSV(filters?: CommitmentFilters): Promise<string>;

  /**
   * Cleans all demo records or resets the local storage.
   */
  clearAll(): Promise<void>;

  /**
   * Seeds demo data for testing and demonstrations.
   */
  seedDemo(records?: Commitment[]): Promise<number>;

  /**
   * Subscribes to changes (useful for cross-tab or local state synchronization).
   * Returns an unsubscribe function.
   */
  subscribe(listener: () => void): () => void;
}
