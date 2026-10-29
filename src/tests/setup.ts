import '@testing-library/jest-dom';

// Mock BroadcastChannel for jsdom test environment if needed
if (typeof window !== 'undefined' && !('BroadcastChannel' in window)) {
  class MockBroadcastChannel {
    name: string;
    onmessage: ((ev: MessageEvent) => void) | null = null;
    constructor(name: string) {
      this.name = name;
    }
    postMessage() {}
    close() {}
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).BroadcastChannel = MockBroadcastChannel;
}
