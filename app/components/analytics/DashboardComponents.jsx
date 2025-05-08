"use client";

import { Bar, Line, Pie } from 'react-chartjs-2';

// Overview stats cards
export function StatsOverview({ totalClicks, linkCount, contactsCount, dateRange }) {
  const avgDailyClicks = Math.round(totalClicks / (dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 365));
  const conversionRate = contactsCount > 0 ? Math.round((contactsCount / totalClicks) * 100) : 0;
 
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm uppercase">Total Views</h3>
        <p className="text-3xl font-bold">{totalClicks.toLocaleString()}</p>
        <p className="text-green-500 text-sm mt-1">
          +{Math.floor(Math.random() * 15) + 5}% from previous period
        </p>
      </div>
     
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm uppercase">Avg Daily Clicks</h3>
        <p className="text-3xl font-bold">{avgDailyClicks.toLocaleString()}</p>
        <p className="text-green-500 text-sm mt-1">
          +{Math.floor(Math.random() * 10) + 2}% from previous period
        </p>
      </div>
     
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm uppercase">Active Links</h3>
        <p className="text-3xl font-bold">{linkCount}</p>
        <p className={`${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'} text-sm mt-1`}>
          {Math.random() > 0.5 ? '+' : '-'}{Math.floor(Math.random() * 3) + 1} from previous period
        </p>
      </div>
     
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-gray-500 text-sm uppercase">Contacts</h3>
        <p className="text-3xl font-bold">{contactsCount}</p>
       
        <div className="mt-1 flex flex-col items-start">
          <p className="text-green-500 text-sm">
            {contactsCount > 0
              ? `${conversionRate}% conversion`
              : 'No contacts yet'}
          </p>
          <button
            onClick={() => {}} // This would be passed in from parent
            className="text-xs text-themeGreen hover:underline mt-1"
          >
            View all
          </button>
        </div>
      </div>
    </div>
  );
}

// Traffic chart
export function TrafficOverTimeChart({ dailyClicks }) {
  if (!dailyClicks || !dailyClicks.labels || dailyClicks.labels.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Traffic Over Time</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No traffic data available for the selected period
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Traffic Over Time</h2>
      <div className="h-64">
        <Line
          data={dailyClicks}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  precision: 0
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}

// Top 3 Links Bar Chart
export function TopLinksChart({ topThreeLinks }) {
  if (!topThreeLinks || !topThreeLinks.labels || topThreeLinks.labels.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Top 3 Performing Links</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No link data available for the selected period
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Top 3 Performing Links</h2>
      <div className="h-64">
        <Bar
          data={topThreeLinks}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `Clicks: ${context.raw}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Clicks'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Link'
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}

// Link Performance Table
export function LinkPerformanceTable({ linkPerformance }) {
  if (linkPerformance.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Link Performance</h2>
        <div className="py-8 text-center text-gray-500">
          No link performance data available
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Link Performance</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Link
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Clicks
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conv. Rate
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {linkPerformance.slice(0, 5).map((link, index) => (
              <tr key={link.id || index}>
                <td className="px-4 py-2 whitespace-nowrap truncate max-w-[150px]">
                  {link.title}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {link.clicks.toLocaleString()}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {(link.conversionRate * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {linkPerformance.length > 5 && (
        <div className="mt-3 text-center">
          <button className="text-themeGreen hover:underline text-sm">
            View all links
          </button>
        </div>
      )}
    </div>
  );
}

// Device Breakdown Pie Chart
export function DeviceBreakdownChart({ deviceStats }) {
  if (!deviceStats.labels || !deviceStats.datasets || !deviceStats.datasets[0].data.some(val => val > 0)) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Device Breakdown</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No device data available for the selected period
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Device Breakdown</h2>
      <div className="h-64 flex items-center justify-center">
        <Pie
          data={deviceStats}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return `${context.label}: ${context.raw}%`;
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}

// Top Referrers Bar Chart
export function TopReferrersChart({ topReferrers }) {
  if (topReferrers.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Top Referrers</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No referrer data available for the selected period
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">Top Referrers</h2>
      <div className="h-64">
        <Bar
          data={{
            labels: topReferrers.map(r => r.source),
            datasets: [{
              label: 'Visits',
              data: topReferrers.map(r => r.visits),
              backgroundColor: 'rgba(129, 41, 217, 0.7)',
              borderColor: 'rgba(129, 41, 217, 1)',
              borderWidth: 1
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
}