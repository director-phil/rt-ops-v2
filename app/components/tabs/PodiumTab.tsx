"use client";

export default function PodiumTab() {
  return (
    <div className="p-4 lg:p-6 space-y-5">

      {/* Header */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📱</span>
          <div>
            <h2 className="text-xl font-black text-white">Podium Integration</h2>
            <p className="text-sm text-zinc-500">Lead attribution · Coming Soon</p>
          </div>
          <span className="ml-auto px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
            PENDING SETUP
          </span>
        </div>

        {/* Attribution model diagram */}
        <div className="bg-zinc-800/40 rounded-xl p-5 mb-5">
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Attribution Model</div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex-1 min-w-[140px] bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
              <div className="text-2xl mb-1">📱</div>
              <div className="text-sm font-bold text-white">Podium Lead</div>
              <div className="text-xs text-zinc-500 mt-1">Review request / message / chat</div>
            </div>
            <div className="text-zinc-600 font-bold px-1">→</div>
            <div className="flex-1 min-w-[140px] bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
              <div className="text-2xl mb-1">📣</div>
              <div className="text-sm font-bold text-white">Google Ads Match</div>
              <div className="text-xs text-zinc-500 mt-1">GCLID / campaign / keyword lookup</div>
            </div>
            <div className="text-zinc-600 font-bold px-1">→</div>
            <div className="flex-1 min-w-[140px] bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
              <div className="text-2xl mb-1">🧾</div>
              <div className="text-sm font-bold text-white">ST Job</div>
              <div className="text-xs text-zinc-500 mt-1">ServiceTitan job created from lead</div>
            </div>
            <div className="text-zinc-600 font-bold px-1">→</div>
            <div className="flex-1 min-w-[140px] bg-zinc-800 rounded-xl p-3 text-center border border-zinc-700">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-sm font-bold text-white">Revenue</div>
              <div className="text-xs text-zinc-500 mt-1">Closed job total attributed to source</div>
            </div>
          </div>
        </div>

        {/* Setup message */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-5">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 text-lg">ℹ️</span>
            <div>
              <div className="font-semibold text-blue-400 mb-1">Connect Podium API to populate real leads data</div>
              <div className="text-sm text-zinc-400">
                To activate this tab, the Podium API needs to be integrated. All columns below are ready — 
                we just need to connect the data source.
              </div>
              <div className="mt-2 text-sm">
                <span className="text-zinc-500">Contact: </span>
                <a href="mailto:openclaw@reliabletradies.com" className="text-orange-400 hover:text-orange-300 font-medium">
                  openclaw@reliabletradies.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder table */}
        <div>
          <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Lead Data Preview (no data yet)</div>
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-800/50">
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500 whitespace-nowrap">Lead Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Campaign</th>
                  <th className="text-left px-4 py-3 text-xs font-bold uppercase text-zinc-500">Outcome</th>
                  <th className="text-right px-4 py-3 text-xs font-bold uppercase text-zinc-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">
                    <div className="text-4xl mb-3">📭</div>
                    <div className="font-semibold text-zinc-500 mb-1">No leads data connected</div>
                    <div className="text-xs text-zinc-600">Once Podium API is connected, leads will appear here with full attribution</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
