import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart, Globe, Award, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-replate-border pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Ideathon Mission */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#16845B] text-white flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-replate-text">REPLATE</span>
            </div>
            <p className="text-xs text-replate-subtext leading-relaxed mb-4">
              Give Surplus Food a Second Chance. A centralized food redistribution platform connecting restaurants, college canteens, and event organizers with nearby NGOs.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EAF6EF] text-[#116747] text-[11px] font-medium">
              <Award className="w-3.5 h-3.5" />
              IETE IDEATHON 2026 · #HACK4SDG
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-replate-text mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-replate-subtext">
              <li>
                <a href="/#how-it-works" className="hover:text-[#16845B] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link to="/register?role=donor" className="hover:text-[#16845B] transition-colors">
                  Donate Food (Donors)
                </Link>
              </li>
              <li>
                <Link to="/register?role=ngo" className="hover:text-[#16845B] transition-colors">
                  Request Food (NGOs)
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-[#16845B] transition-colors">
                  Impact Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: SDG 2 Focus */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-replate-text mb-3">
              Sustainable Development
            </h4>
            <div className="space-y-2 text-xs text-replate-subtext">
              <p className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <Globe className="w-3.5 h-3.5 text-[#16845B]" />
                UN SDG Goal 2: Zero Hunger
              </p>
              <p>Target 12.3: Halve per capita food waste by 2030 through direct local redistribution.</p>
              <p className="text-[11px] text-stone-400">
                Transparent conversion standard: 1 meal ~ 0.4kg edible food waste diverted.
              </p>
            </div>
          </div>

          {/* Col 4: Team NovaNex Credentials */}
          <div id="novanex">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-replate-text mb-3">
              Project Credits
            </h4>
            <div className="p-3 bg-replate-muted rounded-lg border border-replate-border text-xs text-replate-subtext space-y-1">
              <p className="font-semibold text-replate-text">Team NovaNex</p>
              <p>Chaitanya Bharathi Institute of Technology (CBIT)</p>
              <p>Gandipet, Hyderabad, Telangana</p>
              <p className="pt-1 text-[11px] text-[#16845B] font-medium">
                IETE Students' Forum · IDEATHON 2026
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-replate-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-replate-subtext gap-3">
          <p>© 2026 REPLATE · Team NovaNex. Developed for IETE IDEATHON 2026.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
              Role-Based REST Architecture
            </span>
            <Link to="/login" className="hover:text-replate-text transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
