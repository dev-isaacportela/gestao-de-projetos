import { render, screen } from '@testing-library/react';
import ReportsPage from './page';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/reports'),
}));

vi.mock('@/lib/store', () => ({
  getReportData: vi.fn(() => ({
    timeByCat: [
      { name: 'Desenvolvimento Backend', color: '#1b31e7', seconds: 7200 },
      { name: 'Reunião', color: '#00ccf9', seconds: 3600 },
    ],
    doneTasksByCat: [
      { name: 'Desenvolvimento Backend', color: '#1b31e7', count: 4 },
      { name: 'Reunião', color: '#00ccf9', count: 2 },
    ],
  })),
  getProjects: vi.fn(() => [
    { id: 'p1', name: 'Projeto 1' },
    { id: 'p2', name: 'Projeto 2' },
  ]),
  getTasks: vi.fn(() => [
    { id: 't1', status: 'done' },
    { id: 't2', status: 'todo' },
    { id: 't3', status: 'done' },
  ]),
}));

vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="piechart">{children}</div>,
  Pie: ({ children }: { children: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: ({ children }: { children: React.ReactNode }) => <div data-testid="cell">{children}</div>,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('ReportsPage', () => {
  it('renders analytics cards and top clusters', async () => {
    render(<ReportsPage />);

    expect(await screen.findByText('Analytics Central')).toBeInTheDocument();
    expect(screen.getByText('Focus Hours')).toBeInTheDocument();
    expect(screen.getByText('Efficiency')).toBeInTheDocument();
    expect(screen.getByText('Task Flow')).toBeInTheDocument();
    expect(screen.getByText('Deep Work')).toBeInTheDocument();

    expect(screen.getByText('Productivity Clusters')).toBeInTheDocument();
    expect(screen.getAllByText('Desenvolvimento Backend').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Reunião').length).toBeGreaterThan(0);

    expect(screen.getByTestId('piechart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders empty data state if no categories', async () => {
    const store = await import('@/lib/store');
    (store.getReportData as unknown as vi.Mock).mockReturnValue({ timeByCat: [], doneTasksByCat: [] });

    render(<ReportsPage />);

    expect(screen.getByText('Sem dados disponíveis ainda.')).toBeInTheDocument();
  });
});
