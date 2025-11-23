import { Activity, AlertTriangle, Brain, Cpu, History as HistoryIcon, Server, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import DataGenerationCard from '../components/DataGenerationCard';

interface AutomationLabViewProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'Generator', description: 'Scenario designer & dataset composer' },
  { id: 'blueprints', label: 'Blueprints', description: 'LLM routing, guardrails, and caching' },
  { id: 'history', label: 'Run history', description: 'Latest synthetic data executions' }
] as const;

const labStats = [
  { label: 'Synthetic records generated', value: '4.8M', delta: '+12% vs last week' },
  { label: 'LLM savings (Ollama-first)', value: '$3.7K', delta: '-62% token spend' },
  { label: 'Edge cases injected', value: '312', delta: 'Contract + compliance coverage' }
];

const llmToneStyles = {
  emerald: {
    badge: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500'
  },
  amber: {
    badge: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500'
  },
  indigo: {
    badge: 'bg-indigo-100 text-indigo-700',
    bar: 'bg-indigo-500'
  }
} as const;

const llmStack = [
  {
    id: 'ollama',
    title: 'Ollama Local',
    caption: 'llama3.2:latest',
    detail: 'Zero-cost edge inference with GPU acceleration.',
    badge: 'Default route',
    usage: '78%',
    tone: 'emerald' as const
  },
  {
    id: 'sonnet',
    title: 'Claude Sonnet',
    caption: 'claude-sonnet-4.5',
    detail: 'Paid failover for faster throughput or complex claims.',
    badge: 'Burst mode',
    usage: '17%',
    tone: 'amber' as const
  },
  {
    id: 'opus',
    title: 'Claude Opus',
    caption: 'claude-opus-4',
    detail: 'Premium reasoning for exhaustive audit scenarios.',
    badge: 'Premium reasoning',
    usage: '5%',
    tone: 'indigo' as const
  }
];

const guardrails = [
  {
    title: 'Contract compliance validator',
    description: 'FAR117 + union rules are replayed before any dataset is persisted.',
    icon: ShieldCheck,
    bullets: ['Dual-agent cross checks', 'Auto quarantine for risky rows']
  },
  {
    title: 'Anomaly radar',
    description: 'Streaming histograms catch drift, bias, and seasonality gaps mid-run.',
    icon: Activity,
    bullets: ['Live deterministic alerts', 'Adaptive sampling per scenario']
  },
  {
    title: 'Blueprint cache',
    description: 'Scenario + LLM combinations are memoized for sub-second replays.',
    icon: Server,
    bullets: ['Cold start < 400ms', 'Shared across workspaces']
  }
];

const runHistory = [
  {
    id: 'RUN-9837',
    scenario: 'Holiday Season Rush',
    llm: 'Ollama Local',
    size: '1.2M rows',
    status: 'completed',
    timestamp: 'Today · 10:24 UTC',
    details: ['+18% overtime spikes', 'Seasonal pattern overlay']
  },
  {
    id: 'RUN-9821',
    scenario: 'Contract Negotiation',
    llm: 'Claude Sonnet',
    size: '640K rows',
    status: 'running',
    timestamp: 'ETA 01:12',
    details: ['Edge-case claims ×42', 'LLM fallback engaged']
  },
  {
    id: 'RUN-9813',
    scenario: 'Crew Shortage Crisis',
    llm: 'Ollama Local',
    size: '870K rows',
    status: 'completed',
    timestamp: 'Yesterday · 22:18 UTC',
    details: ['Deadhead reduction playbook', 'Fatigue monitoring toggled']
  },
  {
    id: 'RUN-9804',
    scenario: 'Stress Test - High Volume',
    llm: 'Claude Opus',
    size: '1.9M rows',
    status: 'failed',
    timestamp: 'Yesterday · 05:41 UTC',
    details: ['Timeout on persist step', 'Retry queued with sharding']
  }
];

const statusStyles: Record<string, { badge: string; text: string }> = {
  completed: { badge: 'bg-emerald-100 text-emerald-700', text: 'Completed' },
  running: { badge: 'bg-amber-100 text-amber-700', text: 'Running' },
  failed: { badge: 'bg-rose-100 text-rose-700', text: 'Needs attention' }
};

export default function AutomationLabView({ activeView, onViewChange }: AutomationLabViewProps) {
  const tabIds = tabs.map((tab) => tab.id);
  const resolvedView = tabIds.includes(activeView) ? activeView : tabs[0].id;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-cyan-200 text-xs tracking-[0.3em] uppercase">
              <Sparkles className="w-4 h-4" />
              Automation Lab
            </div>
            <div>
              <h2 className="text-3xl font-bold">Agentic test data & automation playground</h2>
              <p className="text-white/80 mt-2 max-w-2xl">
                Compose airline-scale datasets, orchestrate multi-agent pipelines, and keep every synthetic run
                audit-ready inside a dedicated workspace.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {labStats.map((stat) => (
                <div key={stat.label} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-white/60">{stat.label}</p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  <p className="text-xs text-emerald-200 mt-1">{stat.delta}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20">
                <Cpu className="w-8 h-8 text-cyan-200" />
              </div>
              <div>
                <p className="text-sm text-white/70">Current pipeline</p>
                <h3 className="text-xl font-semibold">Scenario → LLM blueprint → Persist</h3>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                Contract guardrails enforced before writing to the DB.
              </li>
              <li className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-300" />
                Ollama-first reasoning with Anthropic fallback on demand.
              </li>
              <li className="flex items-center gap-2">
                <HistoryIcon className="w-4 h-4 text-blue-200" />
                Every run is logged with a replayable blueprint hash.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-wrap gap-3 border-b border-slate-200 px-4 pt-4">
          {tabs.map((tab) => {
            const isActive = resolvedView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onViewChange(tab.id)}
                className={`px-4 py-3 rounded-2xl transition-all text-left ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="text-sm font-semibold">{tab.label}</div>
                <div className="text-xs">{tab.description}</div>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-6">
          {resolvedView === 'dashboard' && <DataGenerationCard />}

          {resolvedView === 'blueprints' && (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {llmStack.map((stack) => {
                  const tone = llmToneStyles[stack.tone];
                  return (
                    <div key={stack.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm text-slate-500">{stack.caption}</p>
                          <h3 className="text-lg font-semibold text-slate-900">{stack.title}</h3>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${tone.badge}`}>{stack.badge}</span>
                      </div>
                      <p className="text-sm text-slate-600">{stack.detail}</p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span>Usage</span>
                          <span className="font-semibold text-slate-900">{stack.usage}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`${tone.bar} h-2`} style={{ width: stack.usage }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {guardrails.map((guardrail) => {
                  const Icon = guardrail.icon;
                  return (
                    <div key={guardrail.title} className="rounded-2xl border border-slate-200 p-5 bg-slate-50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-xl bg-white shadow-sm">
                          <Icon className="w-5 h-5 text-slate-700" />
                        </div>
                        <h3 className="font-semibold text-slate-900 text-sm">{guardrail.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600">{guardrail.description}</p>
                      <ul className="mt-3 space-y-1 text-sm text-slate-700">
                        {guardrail.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-center gap-2">
                            <span className="text-slate-400">•</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm text-slate-500 uppercase tracking-wide">Blueprint lifecycle</p>
                  <h3 className="text-xl font-semibold text-slate-900 mt-1">Draft → Simulate → Approve → Persist</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    Every scenario run produces a reproducible hash so auditors can replay the exact AI plan that created the data.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Average blueprint build</p>
                    <p>3.1s from draft to approval</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {resolvedView === 'history' && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Active queue</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">3 runs</p>
                  <p className="text-xs text-slate-500 mt-1">1 running, 2 scheduled</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Success rate (24h)</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">93%</p>
                  <p className="text-xs text-slate-500 mt-1">Auto-retries on failure</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Average duration</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">08:14</p>
                  <p className="text-xs text-slate-500 mt-1">Scenario to persist</p>
                </div>
              </div>

              <div className="space-y-4">
                {runHistory.map((run) => {
                  const status = statusStyles[run.status];
                  return (
                    <div
                      key={run.id}
                      className="rounded-2xl border border-slate-200 p-4 lg:p-5 flex flex-col lg:flex-row gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="font-mono text-slate-500">{run.id}</span>
                          <span className={`px-3 py-1 rounded-full font-semibold ${status.badge}`}>{status.text}</span>
                          <span>{run.timestamp}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{run.scenario}</h3>
                        <p className="text-sm text-slate-600">LLM · {run.llm}</p>
                        <ul className="text-sm text-slate-700 space-y-1 mt-2">
                          {run.details.map((detail) => (
                            <li key={detail} className="flex items-center gap-2">
                              <span className="text-slate-400">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="lg:w-56 bg-slate-50 rounded-2xl border border-slate-200 p-4 text-sm text-slate-600 space-y-2">
                        <div>
                          <p className="text-xs uppercase text-slate-500">Synthetic rows</p>
                          <p className="text-xl font-semibold text-slate-900">{run.size}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Provider</span>
                          <span className="font-semibold text-slate-900">{run.llm}</span>
                        </div>
                        {run.status === 'running' && (
                          <div className="flex items-center gap-2 text-amber-600">
                            <Activity className="w-4 h-4 animate-spin" />
                            Streaming tokens…
                          </div>
                        )}
                        {run.status === 'failed' && (
                          <div className="flex items-center gap-2 text-rose-600">
                            <AlertTriangle className="w-4 h-4" />
                            Auto-retry scheduled
                          </div>
                        )}
                        {run.status === 'completed' && (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <ShieldCheck className="w-4 h-4" />
                            Stored in warehouse
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
