<?php

namespace App\Services;

use App\Models\CommissionConfig;
use App\Models\Product;
use App\Models\SellerProfile;

class CommissionService
{
    /**
     * Resolve commission rate dynamically from Seller override -> Category config -> Marketplace default.
     * Never hardcoded in controllers or frontend.
     */
    public function resolveRateForProduct(Product $product, SellerProfile $seller): float
    {
        if ($seller->custom_commission_rate !== null) {
            return (float) $seller->custom_commission_rate;
        }

        $categoryConfig = CommissionConfig::query()
            ->where('category_id', $product->category_id)
            ->where('is_active', true)
            ->first();

        if ($categoryConfig) {
            return (float) $categoryConfig->rate_percent;
        }

        $globalConfig = CommissionConfig::query()
            ->whereNull('category_id')
            ->where('is_active', true)
            ->first();

        return $globalConfig
            ? (float) $globalConfig->rate_percent
            : (float) config('buyhive.default_commission_rate');
    }

    /**
     * Deducts BuyHive commission from the seller's advertised price (never added on top).
     */
    public function calculateBreakdown(float $grossAmount, float $ratePercent): array
    {
        $commission = round(($grossAmount * $ratePercent) / 100, 2);
        $netProceeds = round($grossAmount - $commission, 2);

        return [
            'gross_amount' => round($grossAmount, 2),
            'rate_percent' => $ratePercent,
            'commission_amount' => $commission,
            'net_seller_proceeds' => $netProceeds,
        ];
    }
}
