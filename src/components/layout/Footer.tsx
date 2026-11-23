import React from 'react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { BrandMark } from '../common/BrandMark';

export const Footer: React.FC = () => {
  const { navigate } = useMarketplace();

  return (
    <footer className="bg-[#141619] text-stone-300 border-t border-stone-800 mt-16">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div className="space-y-4">
          <BrandMark variant="light" onClick={() => navigate('/')} />
          <p className="text-sm text-stone-400 leading-relaxed">
            BuyHive is a multi-vendor marketplace connecting buyers with independent verified sellers across Kenya’s 47 counties, backed by two-stage physical inspection and coordinated fulfilment.
          </p>
          <div className="flex items-center gap-4 text-xs font-medium text-stone-400 pt-1">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <span aria-hidden="true">·</span>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TikTok</a>
            <span aria-hidden="true">·</span>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Facebook</a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Marketplace</h3>
          <ul className="space-y-2.5 text-sm">
            <li><button type="button" onClick={() => navigate('/shop')} className="hover:text-white cursor-pointer">Browse Products</button></li>
            <li><button type="button" onClick={() => navigate('/categories')} className="hover:text-white cursor-pointer">All 17 Categories</button></li>
            <li><button type="button" onClick={() => navigate('/deals')} className="hover:text-white cursor-pointer">Deals and Offers</button></li>
            <li><button type="button" onClick={() => navigate('/occasions')} className="hover:text-white cursor-pointer">Shop by Occasion</button></li>
            <li><button type="button" onClick={() => navigate('/locations')} className="hover:text-white cursor-pointer">47 Kenyan Counties</button></li>
            <li><button type="button" onClick={() => navigate('/trending')} className="hover:text-white cursor-pointer">Trending & New Arrivals</button></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Customer Care</h3>
          <ul className="space-y-2.5 text-sm">
            <li><button type="button" onClick={() => navigate('/about')} className="hover:text-white cursor-pointer">About BuyHive</button></li>
            <li><button type="button" onClick={() => navigate('/contact')} className="hover:text-white cursor-pointer">Contact Us</button></li>
            <li><button type="button" onClick={() => navigate('/support')} className="hover:text-white cursor-pointer">Customer Support & FAQs</button></li>
            <li><button type="button" onClick={() => navigate('/policies/delivery')} className="hover:text-white cursor-pointer">Delivery Information</button></li>
            <li><button type="button" onClick={() => navigate('/policies/returns')} className="hover:text-white cursor-pointer">Returns & Refunds Policy</button></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Sellers & Legal</h3>
          <ul className="space-y-2.5 text-sm">
            <li><button type="button" onClick={() => navigate('/seller/register')} className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer">Seller Registration</button></li>
            <li><button type="button" onClick={() => navigate('/seller/login')} className="hover:text-white cursor-pointer">Seller Login</button></li>
            <li><button type="button" onClick={() => navigate('/policies/terms')} className="hover:text-white cursor-pointer">Terms and Conditions</button></li>
            <li><button type="button" onClick={() => navigate('/policies/privacy')} className="hover:text-white cursor-pointer">Privacy Policy</button></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800/80">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400">
          <p>© {new Date().getFullYear()} BuyHive Marketplace. All rights reserved.</p>
          <p>Inspected Multi-Vendor Commerce · Nairobi, Kenya</p>
        </div>
      </div>
    </footer>
  );
};
