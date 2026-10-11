import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  UtensilsCrossed,
  ArrowLeft,
  Info,
  Calendar,
  Filter,
  TrendingUp,
  Leaf,
  Users,
  Award,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { KPIStatCard } from '../../components/ui/KPIStatCard';
import { api } from '../../services/api';

const COLORS = ['#16845B', '#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

export const ImpactPage = () => {
  const [data, setData] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadImpactData = async () => {
    try {
      setLoading(true);
      const res = await api.getImpactAnalytics({ category: categoryFilter });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load impact metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImpactData();
  }, [categoryFilter]);

  const metrics = data?.metrics;
  const charts = data?.charts;

  return (
    <div className="min-h-screen bg-replate-muted flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#16845B] bg-[#EAF6EF] px-2.5 py-0.5 rounded-full border border-[#16845B]/20">
                SDG 2 · ZERO HUNGER ANALYTICS
              </span>
              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Illustrative Demo Data
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-replate-text">
              Community Food Redistribution Impact
            </h1>
            <p className="text-xs sm:text-sm text-replate-subtext mt-1">
              Verified metrics derived strictly from completed handovers. No estimated fluff.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-replate-border bg-white text-xs font-medium text-replate-text focus:ring-1 focus:ring-[#16845B]"
            >
              <option value="All">All Food Categories</option>
              <option value="Prepared Meals">Prepared Meals</option>
              <option value="Bakery & Bread">Bakery & Bread</option>
              <option value="Fresh Produce & Fruits">Fresh Produce & Fruits</option>
              <option value="Dairy & Refrigerated">Dairy & Refrigerated</option>
            </select>
          </div>
        </div>

        {/* Methodology Alert Banner */}
        <div className="mb-8 p-4 rounded-card bg-white border border-replate-border shadow-subtle flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-replate-text block">
              Transparent Calculation Methodology
            </span>
            <p className="text-replate-subtext leading-relaxed">
              In accordance with Zero Hunger standards, only donations verified through the full lifecycle (marked <strong>COMPLETED</strong>) are included in redistributed totals.
              Conversion baseline: 1 cooked serving / packed meal = 1 meal. 1 kg fresh produce = 2.5 meals. Food waste diverted is calculated at 0.40 kg per meal + kg fresh produce. Greenhouse gas avoidance follows the FAO standard of 2.5 kg CO2e per kg food waste prevented.
            </p>
          </div>
        </div>

        {/* Primary KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KPIStatCard
            title="Estimated Meals Served"
            value={metrics?.estimatedMealsServed ?? 205}
            subtext="Calculated from verified portions"
            icon={UtensilsCrossed}
            badgeText="SDG 2"
            badgeColor="green"
          />
          <KPIStatCard
            title="Completed Handovers"
            value={metrics?.completedDonations ?? 3}
            subtext={`${metrics?.completionRatePercentage ?? 50}% completion rate`}
            icon={Award}
            badgeText="Verified"
            badgeColor="green"
          />
          <KPIStatCard
            title="Food Waste Diverted"
            value={`${metrics?.estimatedWasteAvoidedKg ?? 82} kg`}
            subtext="Saved from landfill disposal"
            icon={TrendingUp}
            badgeText="Target 12.3"
            badgeColor="green"
          />
          <KPIStatCard
            title="Carbon Prevented (CO2e)"
            value={`${metrics?.estimatedCo2PreventedKg ?? 205} kg`}
            subtext="FAO GHG standard (2.5x)"
            icon={Leaf}
            badgeText="Climate Action"
            badgeColor="green"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Weekly Growth Trend */}
          <div className="lg:col-span-7 bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-replate-text">
                  Redistributed Meals Trend (Weekly)
                </h3>
                <p className="text-xs text-replate-subtext">
                  Cumulative nutritious meals supplied to community shelters.
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              {charts?.weeklyTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={charts.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F3" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B756F' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#6B756F' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E5EAE6',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="completedMeals" fill="#16845B" radius={[4, 4, 0, 0]} name="Meals Served" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-400">
                  Loading chart metrics...
                </div>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="lg:col-span-5 bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-replate-text">
                Food Category Breakdown
              </h3>
              <p className="text-xs text-replate-subtext">
                Diversity of surplus food batches redistributed.
              </p>
            </div>

            <div className="h-64 w-full">
              {charts?.categoryChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={charts.categoryChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {charts.categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E5EAE6',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-400">
                  Loading chart metrics...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participating Organizations Table */}
        <div className="bg-white rounded-card border border-replate-border p-5 sm:p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-4 border-b border-replate-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-replate-text">
                Redistribution Network Entities
              </h3>
              <p className="text-xs text-replate-subtext">
                College canteens, restaurants, and recipient NGOs in Hyderabad.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#16845B] bg-[#EAF6EF] px-2.5 py-1 rounded-full">
              Verified Partners
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border border-replate-border bg-replate-muted/40">
              <span className="text-[10px] font-bold uppercase text-[#16845B]">Donor Partner</span>
              <p className="font-bold text-replate-text text-sm mt-0.5">
                CBIT Central Canteen & Mess
              </p>
              <p className="text-replate-subtext mt-1">
                Gandipet Campus · Prepares 1,500 daily portions for students & faculty.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-replate-border bg-replate-muted/40">
              <span className="text-[10px] font-bold uppercase text-blue-600">NGO Partner</span>
              <p className="font-bold text-replate-text text-sm mt-0.5">
                Akshaya Seva Food Foundation
              </p>
              <p className="text-replate-subtext mt-1">
                Puppalguda & Gandipet · Serves 400 meals daily to children and daily workers.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-replate-border bg-replate-muted/40">
              <span className="text-[10px] font-bold uppercase text-indigo-600">Logistics Fleet</span>
              <p className="font-bold text-replate-text text-sm mt-0.5">
                NovaNex Volunteer Logistics
              </p>
              <p className="text-replate-subtext mt-1">
                Hyderabad Metro · Insulated temperature-controlled transit team.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
