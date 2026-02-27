import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { useStore } from '../store';
import { getAllAgentOrders } from '../agents';

// Mock child components to avoid deep rendering
vi.mock('../SimulationDashboard', () => ({
  SimulationDashboard: () => <div data-testid="simulation-dashboard">Simulation Dashboard</div>
}));
vi.mock('../QuantAcademy', () => ({
  QuantAcademy: () => <div data-testid="quant-academy">Quant Academy</div>
}));
vi.mock('../Glossary', () => ({
  Glossary: () => <div data-testid="glossary">Glossary</div>
}));
vi.mock('../AgentConfigurations', () => ({
  AgentConfigurations: () => <div data-testid="agent-configurations">Agent Configurations</div>
}));
vi.mock('../ScenarioDeck', () => ({
  ScenarioDeck: () => <div data-testid="scenario-deck">Scenario Deck</div>
}));

// Mock agents module
vi.mock('../agents', () => ({
  getAllAgentOrders: vi.fn(() => [])
}));

// Mock store
const mockToggleSimulation = vi.fn();
const mockResetSimulation = vi.fn();
const mockStepEpoch = vi.fn();

const mockStoreState = {
  epoch: 42,
  currentPrice: 123.45,
  isRunning: false,
  toggleSimulation: mockToggleSimulation,
  resetSimulation: mockResetSimulation,
  stepEpoch: mockStepEpoch,
  playbackSpeedMs: 1000,
  agents: {},
};

// Mock the store module
vi.mock('../store', () => {
  const useStoreMock = vi.fn();
  (useStoreMock as any).getState = vi.fn();
  return {
    useStore: useStoreMock
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup store mock behavior
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockStoreState);
    (useStore as unknown as any).getState.mockReturnValue(mockStoreState);
  });

  it('renders the header and default dashboard view', () => {
    render(<App />);

    // Header title
    expect(screen.getByText(/QuantSim: MARL Synthetic Economy/i)).toBeInTheDocument();

    // Default view is dashboard
    expect(screen.getByTestId('simulation-dashboard')).toBeInTheDocument();

    // Metrics
    expect(screen.getByText('42')).toBeInTheDocument(); // epoch
    expect(screen.getByText('$123.45')).toBeInTheDocument(); // price
  });

  it('navigates between views', () => {
    render(<App />);

    // Switch to Quant Academy
    const academyButton = screen.getByText('Quant Academy');
    fireEvent.click(academyButton);
    expect(screen.getByTestId('quant-academy')).toBeInTheDocument();
    expect(screen.queryByTestId('simulation-dashboard')).not.toBeInTheDocument();

    // Switch to Glossary
    const glossaryButton = screen.getByText('Glossary');
    fireEvent.click(glossaryButton);
    expect(screen.getByTestId('glossary')).toBeInTheDocument();

    // Switch back to Dashboard
    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);
    expect(screen.getByTestId('simulation-dashboard')).toBeInTheDocument();
  });

  it('toggles sidebars', () => {
    render(<App />);

    // Left sidebar (Agent Configurations) is open by default
    expect(screen.getByTestId('agent-configurations')).toBeInTheDocument();

    // Click left toggle button
    const leftToggle = screen.getByTitle('Toggle Agent Configurations');
    fireEvent.click(leftToggle);
    expect(screen.queryByTestId('agent-configurations')).not.toBeInTheDocument();

    fireEvent.click(leftToggle);
    expect(screen.getByTestId('agent-configurations')).toBeInTheDocument();

    // Right sidebar (Scenario Deck) is open by default
    expect(screen.getByTestId('scenario-deck')).toBeInTheDocument();

    // Click right toggle button
    const rightToggle = screen.getByTitle('Toggle Scenario Deck');
    fireEvent.click(rightToggle);
    expect(screen.queryByTestId('scenario-deck')).not.toBeInTheDocument();

    fireEvent.click(rightToggle);
    expect(screen.getByTestId('scenario-deck')).toBeInTheDocument();
  });

  it('handles simulation controls', () => {
    render(<App />);

    // Toggle Simulation (Play)
    const playButton = screen.getByText('Play').closest('button');
    expect(playButton).toBeInTheDocument();
    fireEvent.click(playButton!);
    expect(mockToggleSimulation).toHaveBeenCalled();

    // Reset
    const resetButton = screen.getByTitle('Reset Simulation');
    fireEvent.click(resetButton);
    expect(mockResetSimulation).toHaveBeenCalled();

    // Step forward
    const stepButton = screen.getByTitle('Step +1 Epoch');
    fireEvent.click(stepButton);

    // Verify handleStepEpoch logic
    // It calls useStore.getState(), getAllAgentOrders, and stepEpoch
    expect((useStore as unknown as any).getState).toHaveBeenCalled();
    expect(getAllAgentOrders).toHaveBeenCalled();
    expect(mockStepEpoch).toHaveBeenCalled();
  });

  it('displays Pause button when running', () => {
    // Override mock for this test
    const runningState = { ...mockStoreState, isRunning: true };
    (useStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue(runningState);
    (useStore as unknown as any).getState.mockReturnValue(runningState);

    render(<App />);

    const pauseButton = screen.getByText('Pause').closest('button');
    expect(pauseButton).toBeInTheDocument();
  });
});
