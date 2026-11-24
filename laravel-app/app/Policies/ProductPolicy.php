<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function update(User $user, Product $product): bool
    {
        return $user->isSeller()
            && $user->sellerProfile?->id === $product->seller_profile_id;
    }

    public function delete(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }
}

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->isCustomer() && $user->id === $order->user_id;
    }
}
