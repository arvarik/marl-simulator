import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimulationDashboard } from '../SimulationDashboard';
import * as storeModule from '../store';
import type { AgentState } from '../types';

// Mock ResizeObserver for Recharts
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Mock Recharts ResponsiveContainer to render children directly
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

// Mock the store
vi.mock('../store', () => ({
  useStore: vi.fn(),
}));

describe('SimulationDashboard Smoke Test', () => {
  it('renders the dashboard components without crashing', () => {
    // Define a minimal valid AgentState
    const defaultAgentState: AgentState = {
      cash: 10000,
      inventory: 0,
      avgEntry: 0,
      wealth: 10000,
      params: { intrinsicValue: 100, lossAversion: 2.25, gainSensitivity: 0.88 }, // Include likely params to avoid undefined errors
    };

    const mockState = {
      epoch: 0,
      currentPrice: 100,
      history: [100],
      wealthHistory: {
        Prospector: [10000],
        Rationalist: [10000],
        Momentum: [10000],
        MeanRevertor: [10000],
        MarketMaker: [10000],
        NoiseTrader: [10000],
      },
      agents: {
        Prospector: { ...defaultAgentState },
        Rationalist: { ...defaultAgentState },
        Momentum: { ...defaultAgentState },
        MeanRevertor: { ...defaultAgentState },
        MarketMaker: { ...defaultAgentState },
        NoiseTrader: { ...defaultAgentState },
      },
      logs: [],
      isRunning: false,
      playbackSpeedMs: 1000,
      borrowRate: 0,
      marginCallThreshold: 0.2,
      toggleSimulation: vi.fn(),
      updateSimulationParam: vi.fn(),
      stepEpoch: vi.fn(),
      resetSimulation: vi.fn(),
      setPlaybackSpeed: vi.fn(),
      updateAgentParam: vi.fn(),
    };

    // Setup the mock return value
    vi.mocked(storeModule.useStore).mockReturnValue(mockState as any);

    render(<SimulationDashboard />);

    // Assert key sections are present
    expect(screen.getByText(/Price Action/i)).toBeInTheDocument();
    expect(screen.getByText(/Agent Wealth Race \(MtM\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Limit Order Book \(LOB\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Event Logs/i)).toBeInTheDocument();
  });
});
